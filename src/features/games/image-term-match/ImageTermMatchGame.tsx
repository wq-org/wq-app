import { useState, useEffect, useRef } from 'react'
import { Plus, Minus, X, Check, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import FileDropzone from '@/features/upload-files/components/FileDropzone'
import GameLayout from '@/components/layout/GameLayout'
import GameInformation from '@/features/games/components/GameInformation'
import GameInformationCard from '@/features/games/components/GameInformationCard'
import GamePreviewAlert from '@/features/games/components/GamePreviewAlert'
import GameSummaryCard from '@/features/games/components/GameSummaryCard'
import PointsInput from '@/features/games/components/PointsInput'
import SlotsLeftLabel from '@/features/games/components/SlotsLeftLabel'
import GameResultTable from '@/features/games/components/GameResultTable'
import FeedbackInput from '@/features/games/components/FeedbackInput'
import { Badge } from '@/components/ui/badge'
import Spinner from '@/components/ui/spinner'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { getFileBlobUrl } from '@/features/files/api/filesApi'
import { MAX_IMAGE_TERM_OPTIONS } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'
import { useGameEditorContext } from '@/contexts/game-studio'
import type {
  Term,
  ImageTermMatchGameProps,
  ImageTermMatchGameData,
} from './types/imageTermMatch.types'

const STATEMENT_TRUNCATE_LENGTH = 60

function getInitialTerms(initialData: ImageTermMatchGameData | null | undefined): Term[] {
  const t = initialData?.terms
  if (Array.isArray(t) && t.length > 0) return t
  return [{ id: '1', value: '' }]
}

export default function ImageTermMatchGame({
  initialData: initialDataProp,
  onDelete,
}: ImageTermMatchGameProps = {}) {
  const initialData = initialDataProp as ImageTermMatchGameData | null | undefined
  const [title, setTitle] = useState<string>(initialData?.title ?? '')
  const [description, setDescription] = useState<string>(
    constrainDescription(initialData?.description ?? ''),
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePreview ?? null)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  const [terms, setTerms] = useState<Term[]>(() => getInitialTerms(initialData))
  const [previewSelectedTermIds, setPreviewSelectedTermIds] = useState<string[]>([])
  const [resultsRevealed, setResultsRevealed] = useState(false)
  const [editingPoints, setEditingPoints] = useState<Record<string, string>>({})
  const [editingPenalty, setEditingPenalty] = useState<Record<string, string>>({})
  const [feedbackWhenCorrect, setFeedbackWhenCorrect] = useState<string>(
    initialData?.feedbackWhenCorrect ?? '',
  )
  const [feedbackWhenWrong, setFeedbackWhenWrong] = useState<string>(
    initialData?.feedbackWhenWrong ?? '',
  )

  const gameEditor = useGameEditorContext()

  const displayUrl =
    imageFile && imagePreview ? imagePreview : resolvedImageUrl ?? imagePreview

  const correctTerms = terms.filter((t) => t.isCorrect)
  const pointsWhenCorrect = correctTerms.reduce(
    (sum, t) => sum + (t.points != null && t.points > 0 ? t.points : 1),
    0,
  )

  // Resolve storage path to blob URL when opening saved node (like Files feature)
  const filepath = initialData?.filepath
  const isStoragePath =
    typeof filepath === 'string' && filepath.trim() !== '' && !filepath.startsWith('http')
  useEffect(() => {
    if (!isStoragePath) {
      setResolvedImageUrl(null)
      return
    }
    setImageLoading(true)
    getFileBlobUrl(filepath)
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
  }, [filepath, isStoragePath])

  useEffect(() => {
    if (!gameEditor?.registerGetGameData) return
    gameEditor.registerGetGameData(() => ({
      title,
      description,
      imageFile: imageFile ?? null,
      imagePreview,
      filepath: imageFile
        ? undefined
        : resolvedImageUrl != null || imagePreview != null
          ? (initialData?.filepath ?? null)
          : null,
      terms,
      feedbackWhenCorrect,
      feedbackWhenWrong,
    }))
  }, [
    gameEditor,
    title,
    description,
    imageFile,
    imagePreview,
    resolvedImageUrl,
    initialData?.filepath,
    terms,
    feedbackWhenCorrect,
    feedbackWhenWrong,
  ])

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
    setTerms((prev) =>
      prev.map((t) => (t.id === termId ? { ...t, pointsWhenWrong: clamped } : t)),
    )
  }

  const handleRemoveTerm = (id: string) => {
    if (terms.length <= 1) return
    setTerms((prev) => prev.filter((term) => term.id !== id))
    setPreviewSelectedTermIds((prev) => prev.filter((tid) => tid !== id))
  }

  const handleToggleCorrect = (termId: string) => {
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, isCorrect: !t.isCorrect } : t)))
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
        <CardContent>
          {imageLoading ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
              <Spinner variant="gray" size="xl" speed={1750} />
            </div>
          ) : displayUrl ? (
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
                }}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            </div>
          ) : (
            <FileDropzone
              onFilesSelected={handleImageSelected}
              disabled={false}
              accept="image/jpeg,image/jpg,image/png"
            />
          )}
        </CardContent>
      </Card>

      {/* Terms Section */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base leading-none">Terms</h3>
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
            <p className="text-sm text-muted-foreground">
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
            </p>
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
                          <Badge variant="outline" className="shrink-0">
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
                        <Badge variant="outline" className="shrink-0">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <FeedbackInput
          label="When correct feedback"
          value={feedbackWhenCorrect}
          onChange={(e) => setFeedbackWhenCorrect(e.target.value)}
          placeholder="Optional feedback shown after Check when the answer is correct"
        />
        <FeedbackInput
          label="When wrong feedback"
          value={feedbackWhenWrong}
          onChange={(e) => setFeedbackWhenWrong(e.target.value)}
          placeholder="Optional feedback shown after Check when the answer is wrong"
        />
      </div>

      <GameSummaryCard
        totalQuestions={1}
        totalPoints={pointsWhenCorrect}
      />
    </div>
  )

  // Preview Content
  const statementText = title?.trim() || 'Image term match'
  const statementTruncated =
    statementText.length > STATEMENT_TRUNCATE_LENGTH
      ? `${statementText.slice(0, STATEMENT_TRUNCATE_LENGTH)}…`
      : statementText

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
                <p className="text-gray-500 text-sm">No image uploaded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multiple Choice Answers Section */}
      {terms.filter((term) => term.value.trim()).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {terms
            .filter((term) => term.value.trim())
            .map((term, index) => {
              const letter = String.fromCharCode(65 + index)
              const isSelected = previewSelectedTermIds.includes(term.id)
              const isCorrect = term.isCorrect ?? false

              return (
                <Button
                  key={term.id}
                  variant="outline"
                  className={`h-auto py-4 px-4 flex items-center justify-start gap-3 ${
                    isSelected ? 'ring-2 ring-primary/50' : ''
                  } ${
                    isSelected
                      ? isCorrect
                        ? 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setPreviewSelectedTermIds((prev) =>
                      prev.includes(term.id)
                        ? prev.filter((id) => id !== term.id)
                        : [...prev, term.id],
                    )
                  }}
                >
                  <span
                    className={`font-semibold text-lg ${isSelected && isCorrect ? 'text-blue-500' : 'text-black'}`}
                  >
                    {letter}.
                  </span>
                  <span
                    className={`flex-1 text-left ${isSelected && isCorrect ? 'text-blue-500 font-medium' : 'text-black'}`}
                  >
                    {term.value}
                  </span>
                </Button>
              )
            })}
        </div>
      )}

      <Separator />

      {resultsRevealed &&
        (() => {
          const selectedTexts = previewSelectedTermIds
            .map((id) => terms.find((t) => t.id === id)?.value ?? '')
            .filter(Boolean)
          const correctEarned = previewSelectedTermIds.reduce((sum, id) => {
            const term = terms.find((t) => t.id === id)
            if (!term?.isCorrect) return sum
            const pts = term.points != null && term.points > 0 ? term.points : 1
            return sum + pts
          }, 0)
          const penaltySum = previewSelectedTermIds.reduce((sum, id) => {
            const term = terms.find((t) => t.id === id)
            if (term?.isCorrect) return sum
            return sum + (term?.pointsWhenWrong ?? 0)
          }, 0)
          const earned = Math.max(0, correctEarned - penaltySum)
          const hasWrongSelection = previewSelectedTermIds.some((id) => {
            const term = terms.find((t) => t.id === id)
            return term && !term.isCorrect
          })
          const isFullyCorrect =
            previewSelectedTermIds.length > 0 &&
            previewSelectedTermIds.every((id) => terms.find((t) => t.id === id)?.isCorrect)
          const rows = [
            {
              key: 'image-term',
              statementText,
              statementTruncated,
              selectedAnswerTexts: selectedTexts,
              earned,
              max: pointsWhenCorrect,
            },
          ]
          return (
            <div className="space-y-4">
              <GameResultTable
                rows={rows}
                totalEarned={earned}
                totalMax={pointsWhenCorrect}
              />
              {isFullyCorrect && feedbackWhenCorrect?.trim() && (
                <p className="text-sm text-muted-foreground">{feedbackWhenCorrect}</p>
              )}
              {hasWrongSelection && feedbackWhenWrong?.trim() && (
                <p className="text-sm text-muted-foreground">{feedbackWhenWrong}</p>
              )}
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
          <p>Complete the editor to see the preview</p>
        </div>
      )}
    </div>
  )

  // Settings Content
  const settingsContent = (
    <div className="py-6 px-0 flex flex-col gap-6">
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
