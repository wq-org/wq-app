import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import GameLayout from '@/components/layout/GameLayout'
import ImagePin from './components/ImagePin'
import SquareMarker from './components/SquareMarker'
import GameInformation from '@/features/games/components/GameInformation'
import GameInformationCard from '@/features/games/components/GameInformationCard'
import GamePreviewAlert from '@/features/games/components/GamePreviewAlert'
import FileDropzone from '@/components/shared/upload-files/components/FileDropzone'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Check, Minus, Plus, X } from 'lucide-react'
import GameSummaryCard from '@/features/games/components/GameSummaryCard'
import GameResultTable from '@/features/games/components/GameResultTable'
import PointsInput from '@/features/games/components/PointsInput'
import SlotsLeftLabel from '@/features/games/components/SlotsLeftLabel'
import FeedbackInput from '@/features/games/components/FeedbackInput'
import { Badge } from '@/components/ui/badge'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { useGameEditorContext } from '@/contexts/game-studio'
import { useUser } from '@/contexts/user'
import { getFileBlobUrl } from '@/features/files/api/filesApi'
import { fetchFilesByRole } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ImageGallery } from '@/components/shared/media'
import type { GalleryImage } from '@/components/shared/media'
import { MAX_IMAGE_PIN_SQUARES } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'

/** Default size (width/height) for new squares; matches SquareMarker DEFAULT_SIZE. */
const DEFAULT_SQUARE_SIZE = 80

interface Square {
  id: number
  x: number
  y: number
  width: number
  height: number
  question: string
  points?: number
  pointsWhenWrong?: number
  feedbackWhenCorrect?: string
  feedbackWhenWrong?: string
}

interface PinPosition {
  id: string
  x: number
  y: number
  squareId?: number // Track which square the pin is in
}

export interface ImagePinMarkInitialData {
  title?: string
  description?: string
  imagePreview?: string | null
  filepath?: string | null
  squares?: Square[]
  pinPositions?: PinPosition[]
  feedbackWhenCorrect?: string
  feedbackWhenWrong?: string
}

export interface ImagePinMarkGameProps {
  initialData?: unknown
  onDelete?: () => void
  /** Called when user removes the image and it was stored at this path (so caller can delete from storage). */
  onRemoveImage?: (path: string) => void | Promise<void>
}

type ImagePinVariant = 'default' | 'secondary' | 'correct' | 'wrong'

function DraggablePin({
  id,
  position,
  squareId,
  variant,
  resultsRevealed,
}: {
  id: string
  position?: { x: number; y: number }
  squareId?: number
  variant?: ImagePinVariant
  resultsRevealed?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })

  const baseStyle: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }
    : {
        position: 'relative',
      }

  const dragStyle =
    transform && position
      ? {
          ...baseStyle,
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px))`,
        }
      : transform
        ? {
            ...baseStyle,
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : baseStyle

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        squareId && !resultsRevealed && 'ring-4 ring-blue-500 rounded-full',
      )}
    >
      <ImagePin variant={variant ?? 'default'} />
    </div>
  )
}

function DroppableArea({ children, id }: { children: React.ReactNode; id: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('w-full h-full relative', isOver && 'ring-2 ring-blue-400 ring-offset-2')}
    >
      {children}
    </div>
  )
}

export default function ImagePinMarkGame({
  initialData: initialDataProp,
  onDelete,
  onRemoveImage: _onRemoveImage,
}: ImagePinMarkGameProps = {}) {
  const initialData = initialDataProp as ImagePinMarkInitialData | null | undefined
  const [title, setTitle] = useState<string>(initialData?.title ?? '')
  const [description, setDescription] = useState<string>(
    constrainDescription(initialData?.description ?? ''),
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageRemovedByUser, setImageRemovedByUser] = useState(false)
  const [selectedStoragePath, setSelectedStoragePath] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  const [squares, setSquares] = useState<Square[]>(initialData?.squares ?? [])
  const [pinPositions, setPinPositions] = useState<PinPosition[]>(initialData?.pinPositions ?? [])
  const [editingPoints, setEditingPoints] = useState<Record<number, string>>({})
  const [editingPointsWhenWrong, setEditingPointsWhenWrong] = useState<Record<number, string>>({})
  const [resultsRevealed, setResultsRevealed] = useState(false)
  const [refDimensions, setRefDimensions] = useState<{ width: number; height: number } | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const previewImageRef = useRef<HTMLImageElement>(null)

  const gameEditor = useGameEditorContext()
  const { getUserId, getRole } = useUser()

  const effectiveFilepath =
    imageRemovedByUser ? null : selectedStoragePath ?? initialData?.filepath ?? null
  const isStoragePath =
    typeof effectiveFilepath === 'string' &&
    effectiveFilepath.trim() !== '' &&
    !effectiveFilepath.startsWith('http')

  const localDataUrl =
    imageFile && imagePreview && imagePreview.startsWith('data:') ? imagePreview : null
  const displayUrl: string | null = localDataUrl ?? resolvedImageUrl ?? null

  // Resolve storage path to blob URL when opening saved node or after gallery selection
  useEffect(() => {
    if (!isStoragePath || !effectiveFilepath) {
      setResolvedImageUrl(null)
      return
    }
    setImageLoading(true)
    getFileBlobUrl(effectiveFilepath)
      .then((url) => {
        if (url) {
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
          }
          blobUrlRef.current = url
          setResolvedImageUrl(url)
        } else {
          setResolvedImageUrl(null)
        }
      })
      .catch(() => setResolvedImageUrl(null))
      .finally(() => setImageLoading(false))

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [effectiveFilepath, isStoragePath])

  // Register getGameData so GameNodeDialog can pull current state on Save
  useEffect(() => {
    if (!gameEditor?.registerGetGameData) return
    gameEditor.registerGetGameData(() => ({
      title,
      description,
      imageFile: imageFile ?? null,
      imagePreview,
      filepath: imageFile
        ? undefined
        : imageRemovedByUser
          ? null
          : selectedStoragePath ?? initialData?.filepath ?? null,
      squares,
      pinPositions,
    }))
  }, [
    gameEditor,
    title,
    description,
    imageFile,
    imagePreview,
    imageRemovedByUser,
    selectedStoragePath,
    initialData?.filepath,
    squares,
    pinPositions,
  ])

  // Fetch image-type files for gallery (teacher dashboard pattern)
  const IMAGE_EXTENSIONS = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP']
  useEffect(() => {
    const userId = getUserId()
    const role = getRole()?.toLowerCase()
    if (!userId || !role) return
    setGalleryLoading(true)
    const pathRole = role === 'teachers' ? 'teacher' : role
    fetchFilesByRole(role, userId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      .then((result) => {
        if (!result.success || !result.files) {
          setGalleryImages([])
          return
        }
        const imageFiles = result.files.filter((file) => {
          const ext = file.name.split('.').pop()?.toUpperCase() ?? ''
          return IMAGE_EXTENSIONS.includes(ext)
        })
        return Promise.all(
          imageFiles.map(async (file) => {
            const storagePath = `${pathRole}/${userId}/${file.name}`
            const url = await getFileBlobUrl(storagePath)
            return { url: url ?? '', title: file.name, storagePath }
          }),
        )
      })
      .then((items) => {
        if (items) setGalleryImages(items.filter((i) => i.url))
      })
      .catch(() => setGalleryImages([]))
      .finally(() => setGalleryLoading(false))
  }, [getUserId, getRole])

  // Capture editor image dimensions when we have squares (e.g. from initialData) so drop hit-test can scale
  useEffect(() => {
    if (!displayUrl || squares.length === 0) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setRefDimensions((prev) => prev ?? { width: rect.width, height: rect.height })
          }
        }
      })
    })
    return () => cancelAnimationFrame(id)
  }, [imagePreview, squares.length])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setImageFile(file)
      setSelectedStoragePath(null)
      setImageRemovedByUser(false)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || squares.length >= MAX_IMAGE_PIN_SQUARES) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRefDimensions((prev) => prev ?? { width: rect.width, height: rect.height })

    const newSquare: Square = {
      id: squares.length + 1,
      x,
      y,
      width: DEFAULT_SQUARE_SIZE,
      height: DEFAULT_SQUARE_SIZE,
      question: '',
      feedbackWhenCorrect: '',
      feedbackWhenWrong: '',
    }

    setSquares([...squares, newSquare])
  }

  const handleSquareDelete = (id: number) => {
    const updatedSquares = squares
      .filter((sq) => sq.id !== id)
      .map((sq, index) => ({ ...sq, id: index + 1 }))
    setSquares(updatedSquares)
  }

  const handleSquareQuestionChange = (id: number, question: string) => {
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, question } : sq)))
  }

  const handleSquarePositionChange = (id: number, x: number, y: number) => {
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, x, y } : sq)))
  }

  const handleSquarePointsChange = (id: number, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, points: clamped } : sq)))
  }

  const handleSquarePointsWhenWrongChange = (id: number, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setSquares((prev) =>
      prev.map((sq) => (sq.id === id ? { ...sq, pointsWhenWrong: clamped } : sq)),
    )
  }

  const handleSquareFeedbackWhenCorrectChange = (id: number, value: string) => {
    setSquares((prev) =>
      prev.map((sq) => (sq.id === id ? { ...sq, feedbackWhenCorrect: value } : sq)),
    )
  }

  const handleSquareFeedbackWhenWrongChange = (id: number, value: string) => {
    setSquares((prev) =>
      prev.map((sq) => (sq.id === id ? { ...sq, feedbackWhenWrong: value } : sq)),
    )
  }

  const handleCheckAnswers = () => {
    setResultsRevealed(true)
  }

  const STATEMENT_TRUNCATE_LENGTH = 60

  const totalPoints = squares.reduce(
    (sum, sq) => sum + (sq.points != null && sq.points > 0 ? sq.points : 1),
    0,
  )

  /**
   * Hit test: point (px, py) is inside the square.
   * Square uses center-based rect, same geometry as SquareMarker (translate(-50%, -50%)).
   * Bounds are inclusive so a point on the edge counts as inside.
   */
  const isPointInSquare = (px: number, py: number, square: Square): boolean => {
    const left = square.x - square.width / 2
    const right = square.x + square.width / 2
    const top = square.y - square.height / 2
    const bottom = square.y + square.height / 2
    return px >= left && px <= right && py >= top && py <= bottom
  }

  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const dragPositionRef = useRef<{ x: number; y: number } | null>(null)
  const dragCleanupRef = useRef<(() => void) | null>(null)

  const handleDragStart = () => {
    dragPositionRef.current = null
    setDragPosition(null)

    // Add global mousemove listener to track position during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (previewImageRef.current) {
        const rect = previewImageRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        dragPositionRef.current = { x, y }
        setDragPosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Store cleanup function in ref
    dragCleanupRef.current = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      dragCleanupRef.current = null
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    const cleanup = (window as Window & { __dragCleanup?: () => void }).__dragCleanup
    if (cleanup) {
      cleanup()
    }

    if (over && over.id === 'image-drop-area' && previewImageRef.current) {
      const rect = previewImageRef.current.getBoundingClientRect()
      const existingPin = pinPositions.find((p) => p.id === active.id)

      // Refresh ref dimensions at drop so scaling stays accurate after resize
      if (imageContainerRef.current) {
        const editorRect = imageContainerRef.current.getBoundingClientRect()
        if (editorRect.width > 0 && editorRect.height > 0) {
          setRefDimensions({ width: editorRect.width, height: editorRect.height })
        }
      }

      let dropX: number
      let dropY: number
      const finalPosition = dragPositionRef.current || dragPosition
      if (finalPosition) {
        dropX = finalPosition.x
        dropY = finalPosition.y
      } else if (over.rect) {
        dropX = over.rect.left - rect.left + over.rect.width / 2
        dropY = over.rect.top - rect.top + over.rect.height / 2
      } else if (event.activatorEvent) {
        const mouseEvent = event.activatorEvent as MouseEvent
        dropX = mouseEvent.clientX - rect.left
        dropY = mouseEvent.clientY - rect.top
      } else if (existingPin && event.delta) {
        dropX = existingPin.x + event.delta.x
        dropY = existingPin.y + event.delta.y
      } else {
        setDragPosition(null)
        return
      }

      const clampedX = Math.max(0, Math.min(rect.width, dropX))
      const clampedY = Math.max(0, Math.min(rect.height, dropY))

      // Scale from preview image space to reference (editor) space for hit test
      const canScale =
        refDimensions &&
        refDimensions.width > 0 &&
        refDimensions.height > 0 &&
        rect.width > 0 &&
        rect.height > 0
      const hitX = canScale ? clampedX * (refDimensions!.width / rect.width) : clampedX
      const hitY = canScale ? clampedY * (refDimensions!.height / rect.height) : clampedY

      // Find which square contains the pin center; overlap resolved by first match in array order
      let matchedSquareId: number | undefined
      for (const square of squares) {
        if (isPointInSquare(hitX, hitY, square)) {
          matchedSquareId = square.id
          break
        }
      }

      setPinPositions((prev) => {
        const existing = prev.find((p) => p.id === active.id)
        if (existing) {
          return prev.map((p) =>
            p.id === active.id ? { ...p, x: clampedX, y: clampedY, squareId: matchedSquareId } : p,
          )
        }
        return [
          ...prev,
          { id: active.id as string, x: clampedX, y: clampedY, squareId: matchedSquareId },
        ]
      })
    }

    setDragPosition(null)
  }

  const editorContent = (
    <div className="space-y-6">
      <GameInformation
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload an image and start clicking on the areas you want to highlight. Your cursor turns
            into "
            <span className="text-slate-500 inline-flex align-middle mx-1">
              <Plus />
            </span>
            " icon when you hover over the uploaded image.
          </CardDescription>
          <CardAction>
            <SlotsLeftLabel
              current={squares.length}
              max={MAX_IMAGE_PIN_SQUARES}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top slot: dropzone when no image, or selected image with squares when one is chosen */}
          {!displayUrl ? (
            <FileDropzone
              onFilesSelected={handleFileSelected}
              accept="image/*"
            />
          ) : imageLoading ? (
            <div className="w-full min-h-[200px] rounded-lg border bg-gray-100 flex items-center justify-center">
              <Spinner variant="gray" size="xl" speed={1750} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full">
                <div
                  ref={imageContainerRef}
                  className="relative w-full cursor-crosshair min-h-[200px]"
                  onClick={handleImageClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
                  }}
                  aria-label="Click on the image to add a marker square"
                >
                  <img
                    src={displayUrl}
                    alt="Game image"
                    className="w-full h-auto rounded-lg block pointer-events-none select-none"
                    draggable={false}
                  />
                  {squares.map((square) => (
                    <SquareMarker
                      key={square.id}
                      number={square.id}
                      x={square.x}
                      y={square.y}
                      width={square.width}
                      height={square.height}
                      containerRef={imageContainerRef}
                      onPositionChange={(x, y) => handleSquarePositionChange(square.id, x, y)}
                      onDelete={() => handleSquareDelete(square.id)}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                  setResolvedImageUrl(null)
                  setImageRemovedByUser(true)
                  setSelectedStoragePath(null)
                  setSquares([])
                  setPinPositions([])
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
            </div>
          )}
          {/* Gallery below: alternative way to pick or switch image */}
          {galleryLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner variant="gray" size="lg" />
            </div>
          ) : (
            <div className="min-w-0 max-w-full">
              <ImageGallery
                images={galleryImages}
                onSelect={(img) => {
                  if (img.storagePath) {
                    setSelectedStoragePath(img.storagePath)
                    setImageRemovedByUser(false)
                    setImageFile(null)
                    setImagePreview(null)
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {squares.length > 0 && (
        <Card>
          <CardHeader>
            <Label>Square Questions</Label>
          </CardHeader>
          <CardContent className="space-y-4">
            {squares.map((square) => (
              <div
                key={square.id}
                className="space-y-3 p-3 rounded-lg border bg-muted/30"
              >
                <Label>Square {square.id}</Label>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Question</Label>
                  <Textarea
                    value={square.question}
                    onChange={(e) => handleSquareQuestionChange(square.id, e.target.value)}
                    placeholder={`Enter question for square ${square.id}...`}
                    className="min-h-20 w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      <Plus className="size-3" />
                    </Badge>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Points</Label>
                      <PointsInput
                        value={
                          editingPoints[square.id] !== undefined
                            ? editingPoints[square.id]
                            : square.points !== undefined && square.points !== null
                              ? String(square.points)
                              : ''
                        }
                        onChange={(e) => {
                          setEditingPoints((prev) => ({ ...prev, [square.id]: e.target.value }))
                        }}
                        onBlur={(e) => {
                          const raw = e.target.value.trim()
                          const v = raw === '' ? NaN : parseFloat(raw)
                          if (!isNaN(v)) {
                            handleSquarePointsChange(square.id, Math.round(v * 2) / 2)
                          }
                          setEditingPoints((prev) => {
                            const next = { ...prev }
                            delete next[square.id]
                            return next
                          })
                        }}
                        className="w-20 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex  items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      <Minus className="size-3" />
                    </Badge>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Points when wrong</Label>
                      <PointsInput
                        value={
                          editingPointsWhenWrong[square.id] !== undefined
                            ? editingPointsWhenWrong[square.id]
                            : square.pointsWhenWrong !== undefined &&
                                square.pointsWhenWrong !== null
                              ? String(square.pointsWhenWrong)
                              : ''
                        }
                        onChange={(e) => {
                          setEditingPointsWhenWrong((prev) => ({
                            ...prev,
                            [square.id]: e.target.value,
                          }))
                        }}
                        onBlur={(e) => {
                          const raw = e.target.value.trim()
                          const v = raw === '' ? NaN : parseFloat(raw)
                          if (!isNaN(v)) {
                            handleSquarePointsWhenWrongChange(square.id, Math.round(v * 2) / 2)
                          }
                          setEditingPointsWhenWrong((prev) => {
                            const next = { ...prev }
                            delete next[square.id]
                            return next
                          })
                        }}
                        className="w-20 h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-2 border-t">
                  <FeedbackInput
                    label="When correct"
                    value={square.feedbackWhenCorrect ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleSquareFeedbackWhenCorrectChange(square.id, e.target.value)
                    }
                    placeholder="Optional message when the answer is correct"
                  />
                  <FeedbackInput
                    label="When wrong"
                    value={square.feedbackWhenWrong ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleSquareFeedbackWhenWrongChange(square.id, e.target.value)
                    }
                    placeholder="Optional message when the answer is wrong"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {squares.length > 0 && (
        <GameSummaryCard
          totalQuestions={squares.length}
          totalPoints={totalPoints}
        />
      )}
    </div>
  )

  const previewContent = (
    <div className="space-y-6">
      <GameInformationCard
        title={title}
        description={description}
      />
      <GamePreviewAlert />
      <Card>
        <CardHeader>
          <Label>Preview</Label>
        </CardHeader>
        <CardContent>
          {displayUrl ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-6">
                <DroppableArea id="image-drop-area">
                  <div
                    className="relative w-full"
                    style={{ minHeight: '400px' }}
                    ref={(el) => {
                      if (el && previewImageRef.current) {
                        // Ensure the container matches image dimensions
                        const img = previewImageRef.current
                        if (img.complete) {
                          el.style.height = `${img.offsetHeight}px`
                        } else {
                          img.onload = () => {
                            el.style.height = `${img.offsetHeight}px`
                          }
                        }
                      }
                    }}
                  >
                    <img
                      ref={previewImageRef}
                      src={displayUrl}
                      alt="Game preview"
                      className="w-full h-auto rounded-lg pointer-events-none select-none"
                      draggable={false}
                      onLoad={(e) => {
                        const img = e.currentTarget
                        const container = img.parentElement
                        if (container) {
                          container.style.height = `${img.offsetHeight}px`
                        }
                      }}
                    />
                    {squares.map((square) => (
                      <SquareMarker
                        key={square.id}
                        number={square.id}
                        x={square.x}
                        y={square.y}
                        width={square.width}
                        height={square.height}
                        pointerEvents="none"
                      />
                    ))}
                    {pinPositions.map((pin) => {
                      const expectedSquareId = parseInt(String(pin.id).replace(/^pin-/, ''), 10)
                      const pinSquareId = pin.squareId != null ? Number(pin.squareId) : NaN
                      const correct =
                        !Number.isNaN(expectedSquareId) &&
                        !Number.isNaN(pinSquareId) &&
                        pinSquareId === expectedSquareId
                      const displayVariant: ImagePinVariant = resultsRevealed
                        ? correct
                          ? 'correct'
                          : 'wrong'
                        : 'default'
                      return (
                        <DraggablePin
                          key={pin.id}
                          id={pin.id}
                          position={{ x: pin.x, y: pin.y }}
                          squareId={pin.squareId}
                          variant={displayVariant}
                        />
                      )
                    })}
                  </div>
                </DroppableArea>

                {squares.length > 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">Drag pins onto the image above:</p>
                    <div className="flex gap-4 flex-wrap">
                      {squares
                        .filter((square) => {
                          const pinId = `pin-${square.id}`
                          return !pinPositions.some((p) => p.id === pinId)
                        })
                        .map((square) => {
                          const pinId = `pin-${square.id}`
                          return (
                            <DraggablePin
                              key={pinId}
                              id={pinId}
                              resultsRevealed={resultsRevealed}
                            />
                          )
                        })}
                    </div>
                    {squares.filter((square) => {
                      const pinId = `pin-${square.id}`
                      return !pinPositions.some((p) => p.id === pinId)
                    }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center mt-4">
                        All pins have been placed on the image
                      </p>
                    )}
                  </div>
                )}

                {squares.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Questions:</h3>
                    <div className="space-y-2">
                      {squares.map((square) => (
                        <div
                          key={square.id}
                          className="flex gap-2"
                        >
                          <span className="font-medium min-w-20">Square {square.id}:</span>
                          <span>{square.question || 'No question set'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resultsRevealed &&
                  squares.length > 0 &&
                  (() => {
                    let totalEarned = 0
                    let totalMax = 0
                    const rows = squares.map((square) => {
                      const pinId = `pin-${square.id}`
                      const pin = pinPositions.find((p) => p.id === pinId)
                      const max = square.points != null && square.points > 0 ? square.points : 1
                      const correct = pin?.squareId === square.id
                      const penalty = square.pointsWhenWrong ?? 0
                      const earned = correct ? max : -penalty
                      totalEarned += earned
                      totalMax += max
                      const statementText = square.question || 'No question set'
                      const statementTruncated =
                        statementText.length > STATEMENT_TRUNCATE_LENGTH
                          ? `${statementText.slice(0, STATEMENT_TRUNCATE_LENGTH)}…`
                          : statementText
                      const placementText = pin
                        ? correct
                          ? 'Correct'
                          : 'Wrong square'
                        : 'Not placed'
                      const feedbackText = correct
                        ? square.feedbackWhenCorrect?.trim()
                        : square.feedbackWhenWrong?.trim()
                      return {
                        key: square.id,
                        statementText,
                        statementTruncated,
                        selectedAnswerTexts: [placementText],
                        earned,
                        max,
                        feedback: feedbackText || undefined,
                        feedbackVariant: correct ? ('correct' as const) : ('wrong' as const),
                      }
                    })
                    return (
                      <>
                        <GameResultTable
                          rows={rows}
                          totalEarned={totalEarned}
                          totalMax={totalMax}
                          title="Results"
                          columnLabels={{
                            statement: 'Question',
                            selectedAnswers: 'Placement',
                            result: 'Result',
                            footer: 'Overall',
                          }}
                        />
                      </>
                    )
                  })()}

                {squares.length > 0 && (
                  <div className="flex items-center justify-start">
                    <Button
                      type="button"
                      onClick={handleCheckAnswers}
                      disabled={pinPositions.length === 0}
                      className="gap-2"
                    >
                      <Check className="size-4" />
                      Check
                    </Button>
                  </div>
                )}
              </div>
            </DndContext>
          ) : (
            <div className="w-full h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Upload an image to see preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const settingsContent = (
    <div className="space-y-6">
      {onDelete && (
        <div>
          <p className="text-muted-foreground text-sm mb-3">
            Hold the button below for 3 seconds to delete this game node.
          </p>
          <HoldToDeleteButton
            onDelete={onDelete}
            holdDuration={3000}
          />
        </div>
      )}
    </div>
  )

  return (
    <GameLayout
      editorContent={editorContent}
      previewContent={previewContent}
      settingsContent={settingsContent}
    />
  )
}
