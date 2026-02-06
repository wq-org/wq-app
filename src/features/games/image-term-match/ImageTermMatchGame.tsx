import { useState, useEffect, useRef } from 'react'
import { Plus, Minus, X, Check, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import FileDropzone from '@/components/shared/upload-files/components/FileDropzone'
import GameLayout from '@/components/layout/GameLayout'
import GameInformation from '@/features/games/shared/GameInformation'
import GameInformationCard from '@/features/games/shared/GameInformationCard'
import GamePreviewAlert from '@/features/games/shared/GamePreviewAlert'
import GameSummaryCard from '@/features/games/shared/GameSummaryCard'
import PointsInput from '@/features/games/shared/PointsInput'
import SlotsLeftLabel from '@/features/games/shared/SlotsLeftLabel'
import GameResultTable from '@/features/games/shared/GameResultTable'
import FeedbackInput from '@/features/games/shared/FeedbackInput'
import { Badge } from '@/components/ui/badge'
import Spinner from '@/components/ui/spinner'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { getFileBlobUrl } from '@/features/files/api/filesApi'
import { fetchFilesByRole } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ImageGallery } from '@/components/shared/media'
import type { GalleryImage } from '@/components/shared/media'
import { useUser } from '@/contexts/user'
import { MAX_IMAGE_TERM_OPTIONS } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'
import { useGameEditorContext } from '@/contexts/game-studio'
import type { Term, ImageTermMatchGameProps, ImageTermMatchGameData } from './types'
import { computeImageTermResults } from '@/features/games/image-term-match/utils/imageTermScoring'
import { Text } from '@/components/ui/text'

const IMAGE_EXTENSIONS = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP']

function getInitialTerms(initialData: ImageTermMatchGameData | null | undefined): Term[] {
  const t = initialData?.terms
  if (Array.isArray(t) && t.length > 0) return t
  return [{ id: '1', value: '' }]
}

export default function ImageTermMatchGame({
  initialData: initialDataProp,
  onDelete,
  previewOnly,
}: ImageTermMatchGameProps = {}) {
  const initialData = initialDataProp as ImageTermMatchGameData | null | undefined
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
  const [terms, setTerms] = useState<Term[]>(() => getInitialTerms(initialData))
  const [previewSelectedTermIds, setPreviewSelectedTermIds] = useState<string[]>([])
  const [resultsRevealed, setResultsRevealed] = useState(false)
  const [editingPoints, setEditingPoints] = useState<Record<string, string>>({})
  const [editingPenalty, setEditingPenalty] = useState<Record<string, string>>({})

  const gameEditor = useGameEditorContext()
  const { getUserId, getRole } = useUser()

  const effectiveFilepath = imageRemovedByUser
    ? null
    : (selectedStoragePath ?? initialData?.filepath ?? null)
  const isStoragePath =
    typeof effectiveFilepath === 'string' &&
    effectiveFilepath.trim() !== '' &&
    !effectiveFilepath.startsWith('http')

  // Display: only local data URL (from FileReader) or resolved blob URL — never public URL (files architecture)
  const localDataUrl =
    imageFile && imagePreview && imagePreview.startsWith('data:') ? imagePreview : null
  const displayUrl: string | null = localDataUrl ?? resolvedImageUrl ?? null

  const correctTerms = terms.filter((t) => t.isCorrect)
  const pointsWhenCorrect = correctTerms.reduce(
    (sum, t) => sum + (t.points != null && t.points > 0 ? t.points : 1),
    0,
  )

  // Sync from initialData when it changes (e.g. different node opened or node data updated after save) so state is not stale
  useEffect(() => {
    setTitle(initialData?.title ?? '')
    setDescription(constrainDescription(initialData?.description ?? ''))
    if (typeof initialData?.filepath === 'string' && initialData.filepath.trim() !== '') {
      setSelectedStoragePath(initialData.filepath)
      setImageFile(null)
      setImageRemovedByUser(false)
    }
    if (Array.isArray(initialData?.terms)) {
      setTerms(initialData.terms.length > 0 ? initialData.terms : [{ id: '1', value: '' }])
    }
  }, [initialData?.title, initialData?.description, initialData?.filepath, initialData?.terms])

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
          : (selectedStoragePath ?? initialData?.filepath ?? null),
      terms,
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
    terms,
  ])

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

  const handleImageSelected = (files: File[]) => {
    if (files.length === 0) return

    const selectedFile = files[0]

    // Validate it's an image
    if (!selectedFile.type.startsWith('image/')) {
      return
    }

    // Validate it's not WebP
    if (selectedFile.type === 'image/webp') {
      return
    }

    setImageFile(selectedFile)
    setSelectedStoragePath(null)
    setImageRemovedByUser(false)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.onerror = () => {
      setImagePreview(null)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleAddTerm = () => {
    if (terms.length >= MAX_IMAGE_TERM_OPTIONS) return

    const newId = String(Date.now())
    setTerms([...terms, { id: newId, value: '' }])
  }

  const handleTermPointsChange = (termId: string, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, points: clamped } : t)))
  }

  const handleTermPenaltyChange = (termId: string, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, pointsWhenWrong: clamped } : t)))
  }

  const handleRemoveTerm = (id: string) => {
    if (terms.length <= 1) return
    setTerms((prev) => prev.filter((term) => term.id !== id))
    setPreviewSelectedTermIds((prev) => prev.filter((tid) => tid !== id))
  }

  const handleToggleCorrect = (termId: string) => {
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, isCorrect: !t.isCorrect } : t)))
  }

  const handleTermFeedbackWhenCorrectChange = (termId: string, value: string) => {
    setTerms((prev) =>
      prev.map((t) => (t.id === termId ? { ...t, feedbackWhenCorrect: value } : t)),
    )
  }

  const handleTermFeedbackWhenWrongChange = (termId: string, value: string) => {
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, feedbackWhenWrong: value } : t)))
  }

  const handleTermChange = (id: string, value: string) => {
    setTerms(terms.map((term) => (term.id === id ? { ...term, value } : term)))
  }

  // Editor Content
  const editorContent = (
    <div className="space-y-6">
      {/* Title and Description Section */}
      <GameInformation
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <Label>Image</Label>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top slot: dropzone when no image, or selected image when one is chosen */}
          {!displayUrl ? (
            <FileDropzone
              onFilesSelected={handleImageSelected}
              disabled={false}
              accept="image/jpeg,image/jpg,image/png"
            />
          ) : imageLoading ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
              <Spinner
                variant="gray"
                size="xl"
                speed={1750}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                <img
                  src={displayUrl}
                  alt="Game image"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                  setResolvedImageUrl(null)
                  setImageRemovedByUser(true)
                  setSelectedStoragePath(null)
                }}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            </div>
          )}
          {/* Gallery below: alternative way to pick or switch image */}
          {galleryLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner
                variant="gray"
                size="lg"
              />
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

      {/* Terms Section */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text
                as="h3"
                variant="h3"
                className="font-bold text-base leading-none"
              >
                Terms
              </Text>
              <div className="flex items-center gap-2">
                <SlotsLeftLabel
                  current={terms.length}
                  max={MAX_IMAGE_TERM_OPTIONS}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTerm}
                  disabled={terms.length >= MAX_IMAGE_TERM_OPTIONS}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>
            </div>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              Add up to four multiple choice options. Use the{' '}
              <Circle
                className="inline size-3.5 mx-0.5"
                aria-hidden
              />{' '}
              /{' '}
              <CheckCircle2
                className="inline size-3.5 mx-0.5"
                aria-hidden
              />{' '}
              icon to mark which are correct, and set points for each correct option.
            </Text>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {terms.map((term, index) => (
              <Card
                key={term.id}
                className={`transition-shadow ${term.isCorrect ? 'border-primary shadow-md' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9"
                      onClick={() => handleToggleCorrect(term.id)}
                      aria-label={term.isCorrect ? 'Mark as incorrect' : 'Mark as correct'}
                    >
                      {term.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Label
                      htmlFor={term.id}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <Input
                        id={term.id}
                        type="text"
                        placeholder={`Term ${index + 1}`}
                        value={term.value}
                        onChange={(e) => handleTermChange(term.id, e.target.value)}
                        className="w-full"
                      />
                    </Label>
                    {term.isCorrect && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="shrink-0"
                        >
                          <Plus className="size-3" />
                        </Badge>

                        <PointsInput
                          value={
                            editingPoints[term.id] !== undefined
                              ? editingPoints[term.id]
                              : term.points !== undefined && term.points !== null
                                ? String(term.points)
                                : ''
                          }
                          onChange={(e) => {
                            setEditingPoints((prev) => ({ ...prev, [term.id]: e.target.value }))
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value.trim()
                            const v = raw === '' ? NaN : parseFloat(raw)
                            if (!isNaN(v)) {
                              handleTermPointsChange(term.id, Math.round(v * 2) / 2)
                            }
                            setEditingPoints((prev) => {
                              const next = { ...prev }
                              delete next[term.id]
                              return next
                            })
                          }}
                        />
                      </div>
                    )}
                    {!term.isCorrect && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="shrink-0"
                        >
                          <Minus className="size-3" />
                        </Badge>

                        <PointsInput
                          value={
                            editingPenalty[term.id] !== undefined
                              ? editingPenalty[term.id]
                              : term.pointsWhenWrong !== undefined && term.pointsWhenWrong !== null
                                ? String(term.pointsWhenWrong)
                                : ''
                          }
                          onChange={(e) => {
                            setEditingPenalty((prev) => ({ ...prev, [term.id]: e.target.value }))
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value.trim()
                            const v = raw === '' ? NaN : parseFloat(raw)
                            if (!isNaN(v)) {
                              handleTermPenaltyChange(term.id, Math.round(v * 2) / 2)
                            }
                            setEditingPenalty((prev) => {
                              const next = { ...prev }
                              delete next[term.id]
                              return next
                            })
                          }}
                        />
                      </div>
                    )}
                    {terms.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTerm(term.id)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {term.isCorrect ? (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <FeedbackInput
                        label="When correct feedback"
                        value={term.feedbackWhenCorrect ?? ''}
                        onChange={(e) =>
                          handleTermFeedbackWhenCorrectChange(term.id, e.target.value)
                        }
                        placeholder="Optional feedback when this option is selected and correct"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <FeedbackInput
                        label="When wrong feedback"
                        value={term.feedbackWhenWrong ?? ''}
                        onChange={(e) => handleTermFeedbackWhenWrongChange(term.id, e.target.value)}
                        placeholder="Optional feedback when this option is selected and wrong"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <GameSummaryCard
        totalQuestions={1}
        totalPoints={pointsWhenCorrect}
      />
    </div>
  )

  // Preview Content
  const previewContent = (
    <div className="space-y-6">
      <GameInformationCard
        title={title}
        description={description}
      />
      <GamePreviewAlert />
      <Card>
        <CardContent className="p-6">
          <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Game image"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Text
                  as="p"
                  variant="body"
                  className="text-gray-500 text-sm"
                >
                  No image uploaded
                </Text>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multiple Choice Answers Section */}
      {terms.filter((term) => term.value.trim()).length > 0 && (
        <div className="space-y-3">
          {correctTerms.length > 1 && (
            <Badge
              variant="outline"
              className="text-orange-500 bg-orange-500/10 border-orange-500/20"
            >
              Multiple answers can be correct
            </Badge>
          )}
          <div className="grid grid-cols-2 gap-3">
            {terms
              .filter((term) => term.value.trim())
              .map((term, index) => {
                const letter = String.fromCharCode(65 + index)
                const isSelected = previewSelectedTermIds.includes(term.id)
                const singleCorrect = correctTerms.length === 1

                return (
                  <Button
                    key={term.id}
                    variant="outline"
                    className={`h-auto py-4 px-4 flex items-center justify-start gap-3 ${
                      isSelected ? 'ring-2 ring-primary/50 bg-muted/50 border-primary/30' : ''
                    } ${
                      !isSelected
                        ? 'bg-white text-black border-gray-300 hover:bg-gray-50 dark:bg-input/30 dark:border-input dark:hover:bg-input/50'
                        : ''
                    }`}
                    onClick={() => {
                      if (singleCorrect) {
                        setPreviewSelectedTermIds((prev) =>
                          prev.includes(term.id) ? [] : [term.id],
                        )
                      } else {
                        setPreviewSelectedTermIds((prev) =>
                          prev.includes(term.id)
                            ? prev.filter((id) => id !== term.id)
                            : [...prev, term.id],
                        )
                      }
                    }}
                  >
                    <Text
                      as="span"
                      variant="small"
                      className={`font-semibold text-lg ${isSelected ? 'text-foreground' : 'text-black dark:text-foreground'}`}
                    >
                      {letter}.
                    </Text>
                    <Text
                      as="span"
                      variant="small"
                      className={`flex-1 text-left ${isSelected ? 'text-foreground font-medium' : 'text-black dark:text-foreground'}`}
                    >
                      {term.value}
                    </Text>
                  </Button>
                )
              })}
          </div>
        </div>
      )}

      <Separator />

      {resultsRevealed &&
        (() => {
          const result = computeImageTermResults(terms, previewSelectedTermIds, pointsWhenCorrect)
          const rows = [
            {
              key: 'image-term',
              statementText: result.statementText,
              statementTruncated: result.statementTruncated,
              selectedAnswerTexts: result.selectedAnswerTexts,
              earned: result.earned,
              max: result.max,
              feedback: result.feedbackText,
              feedbackVariant: result.feedbackVariant,
            },
          ]
          return (
            <div className="space-y-4">
              <GameResultTable
                rows={rows}
                totalEarned={result.earned}
                totalMax={result.max}
              />
            </div>
          )
        })()}

      <div className="flex items-center justify-start">
        <Button
          type="button"
          onClick={() => setResultsRevealed(true)}
          disabled={previewSelectedTermIds.length === 0}
          className="gap-2"
        >
          <Check className="size-4" />
          Check
        </Button>
      </div>

      {!displayUrl && terms.every((term) => !term.value.trim()) && (
        <div className="text-center text-gray-400 py-12">
          <Text
            as="p"
            variant="body"
          >
            Complete the editor to see the preview
          </Text>
        </div>
      )}
    </div>
  )

  // Settings Content
  const settingsContent = (
    <div className="py-6 px-0 flex flex-col gap-6">
      {onDelete && (
        <div>
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground text-sm mb-3"
          >
            Hold the button below for 3 seconds to delete this node.
          </Text>
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
      previewOnly={previewOnly}
    />
  )
}
