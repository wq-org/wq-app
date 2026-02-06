import { useState, useMemo, useEffect, useRef } from 'react'
import { Check, CheckCircle2, X, Plus, Trash2, Pencil, Minus, CircleX } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import GameLayout from '@/components/layout/GameLayout'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import GameInformation from '@/features/games/shared/GameInformation'
import GameInformationCard from '@/features/games/shared/GameInformationCard'
import GamePreviewAlert from '@/features/games/shared/GamePreviewAlert'
import GameSummaryCard from '@/features/games/shared/GameSummaryCard'
import PointsInput from '@/features/games/shared/PointsInput'
import SlotsLeftLabel from '@/features/games/shared/SlotsLeftLabel'
import GameResultTable from '@/features/games/shared/GameResultTable'
import FeedbackInput from '@/features/games/shared/FeedbackInput'
import { useGameEditorContext } from '@/contexts/game-studio'
import { Card, CardContent } from '@/components/ui/card'
import {
  DEFAULT_PARAGRAPH,
  QUESTION_SEPARATOR,
  MAX_PARAGRAPH_VOTING_OPTIONS,
} from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'
import type {
  VotingOption,
  SentenceConfig,
  SelectedAnswer,
  ParagraphGameInitialData,
  ParagraphLineSelectGameProps,
} from './types'
import {
  hasMultipleCorrectOptions,
  computeParagraphResults,
} from '@/features/games/paragraph-line-select/utils/paragraphScoring'

export type { ParagraphGameInitialData }

/** Split paragraph by QUESTION_SEPARATOR to get one "question" (clickable unit) per segment. */
function splitIntoQuestions(text: string): string[] {
  return text
    .split(QUESTION_SEPARATOR)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export default function ParagraphLineSelectGame({
  initialData: initialDataProp,
  onDelete,
  previewOnly,
}: ParagraphLineSelectGameProps = {}) {
  const initialData = initialDataProp as ParagraphGameInitialData | null | undefined
  const [title, setTitle] = useState<string>(initialData?.title ?? '')
  const [description, setDescription] = useState<string>(
    constrainDescription(initialData?.description ?? ''),
  )
  const [paragraphText, setParagraphText] = useState<string>(
    initialData?.paragraphText ?? DEFAULT_PARAGRAPH,
  )
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null)
  const [sentenceConfigs, setSentenceConfigs] = useState<SentenceConfig[]>(
    initialData?.sentenceConfigs ?? [],
  )
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([])
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null)
  const [resultsRevealed, setResultsRevealed] = useState(false)
  const [editingPoints, setEditingPoints] = useState<Record<string, string>>({})
  const [editingPenalty, setEditingPenalty] = useState<Record<string, string>>({})
  const [editingOption, setEditingOption] = useState<{
    sentenceIndex: number
    optionId: string
  } | null>(null)
  const [editOptionText, setEditOptionText] = useState('')

  const gameEditor = useGameEditorContext()
  const configAndAnswersRef = useRef({
    sentenceConfigs: [] as SentenceConfig[],
    selectedAnswers: [] as SelectedAnswer[],
  })
  configAndAnswersRef.current = { sentenceConfigs, selectedAnswers }

  // Sync from initialData when it changes (e.g. different node opened or node data updated) so state is not stale
  useEffect(() => {
    setTitle(initialData?.title ?? '')
    setDescription(constrainDescription(initialData?.description ?? ''))
    setParagraphText(initialData?.paragraphText ?? DEFAULT_PARAGRAPH)
  }, [initialData?.title, initialData?.description, initialData?.paragraphText])

  // Register getGameData so GameNodeDialog can pull current state on Save
  useEffect(() => {
    if (!gameEditor?.registerGetGameData) return
    gameEditor.registerGetGameData(() => ({
      title,
      description,
      paragraphText,
      sentenceConfigs,
      selectedAnswers,
    }))
  }, [gameEditor, title, description, paragraphText, sentenceConfigs, selectedAnswers])

  // Derive questions (one per segment) by splitting on QUESTION_SEPARATOR
  const sentences = useMemo(() => splitIntoQuestions(paragraphText), [paragraphText])

  // When paragraph text changes, sync sentenceConfigs and selectedAnswers so no abandoned questions
  // appear in the preview: keep only configs for current positions, renumber, and update sentenceText.
  useEffect(() => {
    const currentSentences = splitIntoQuestions(paragraphText)
    const n = currentSentences.length
    const { sentenceConfigs: configs, selectedAnswers: answers } = configAndAnswersRef.current

    if (n === 0) {
      setSentenceConfigs([])
      setSelectedAnswers([])
      setSelectedSentenceIndex(null)
      return
    }

    const sorted = [...configs].sort((a, b) => a.sentenceNumber - b.sentenceNumber)
    const kept = sorted.slice(0, n)
    const oldToNew: Record<number, number> = {}
    kept.forEach((c, i) => {
      oldToNew[c.sentenceNumber] = i + 1
    })

    setSentenceConfigs(
      kept.map((c, i) => ({
        ...c,
        sentenceNumber: i + 1,
        sentenceText: currentSentences[i] ?? c.sentenceText,
      })),
    )
    setSelectedAnswers(
      answers
        .filter((a) => oldToNew[a.sentenceNumber] != null)
        .map((a) => ({ ...a, sentenceNumber: oldToNew[a.sentenceNumber]! })),
    )
    setSelectedSentenceIndex((idx) => (idx !== null && idx >= n ? null : idx))
  }, [paragraphText])

  // Get config for a sentence
  const getSentenceConfig = (index: number): SentenceConfig | undefined => {
    return sentenceConfigs.find((config) => config.sentenceNumber === index + 1)
  }

  // Handle selecting a sentence in editor
  const handleSelectSentence = (index: number) => {
    setSelectedSentenceIndex(index)
    // Initialize config if it doesn't exist
    if (!getSentenceConfig(index)) {
      setSentenceConfigs((prev) => [
        ...prev,
        {
          sentenceNumber: index + 1,
          sentenceText: sentences[index],
          options: [],
          pointsWhenCorrect: 10,
          feedbackWhenCorrect: '',
          feedbackWhenWrong: '',
        },
      ])
    }
  }

  // Add voting option to selected sentence
  const handleAddOption = (sentenceIndex: number, optionText: string, isCorrect: boolean) => {
    const config = getSentenceConfig(sentenceIndex)
    if (!config) return

    if (config.options.length >= MAX_PARAGRAPH_VOTING_OPTIONS) return

    const newOption: VotingOption = {
      id: `option-${Date.now()}`,
      text: optionText,
      isCorrect,
    }

    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1 ? { ...c, options: [...c.options, newOption] } : c,
      ),
    )
  }

  // Update points for a single correct option (whole and half decimals only); only used when option is correct.
  const handleOptionPointsChange = (sentenceIndex: number, optionId: string, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? {
              ...c,
              options: c.options.map((opt) =>
                opt.id === optionId ? { ...opt, points: clamped } : opt,
              ),
            }
          : c,
      ),
    )
  }

  // Update penalty for a single wrong option (stored as non-negative; applied as negative).
  const handleWrongPointsChange = (sentenceIndex: number, optionId: string, value: number) => {
    const rounded = Math.round(value * 2) / 2
    const clamped = Math.max(0, Math.min(1000, rounded))
    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? {
              ...c,
              options: c.options.map((opt) =>
                opt.id === optionId ? { ...opt, pointsWhenWrong: clamped } : opt,
              ),
            }
          : c,
      ),
    )
  }

  // Remove voting option
  const handleRemoveOption = (sentenceIndex: number, optionId: string) => {
    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? { ...c, options: c.options.filter((opt) => opt.id !== optionId) }
          : c,
      ),
    )
    if (editingOption?.optionId === optionId && editingOption.sentenceIndex === sentenceIndex) {
      setEditingOption(null)
    }
  }

  // Update option text and isCorrect
  const handleUpdateOption = (
    sentenceIndex: number,
    optionId: string,
    newText: string,
    isCorrect: boolean,
  ) => {
    const trimmed = newText.trim()
    if (!trimmed) return
    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? {
              ...c,
              options: c.options.map((opt) =>
                opt.id === optionId ? { ...opt, text: trimmed, isCorrect } : opt,
              ),
            }
          : c,
      ),
    )
    setEditingOption(null)
    setEditOptionText('')
  }

  // Update feedback text for a sentence (correct or wrong)
  const handleFeedbackChange = (
    sentenceIndex: number,
    field: 'feedbackWhenCorrect' | 'feedbackWhenWrong',
    value: string,
  ) => {
    setSentenceConfigs((prev) =>
      prev.map((c) => (c.sentenceNumber === sentenceIndex + 1 ? { ...c, [field]: value } : c)),
    )
  }

  // Handle answer selection in preview (toggle: same option again deselects)
  const handleAnswerSelect = (sentenceNumber: number, optionId: string) => {
    const config = sentenceConfigs.find((c) => c.sentenceNumber === sentenceNumber)
    const multi = config ? hasMultipleCorrectOptions(config) : false
    setSelectedAnswers((prev) => {
      if (multi) {
        const alreadySelected = prev.some(
          (a) => a.sentenceNumber === sentenceNumber && a.optionId === optionId,
        )
        if (alreadySelected) {
          return prev.filter(
            (a) => !(a.sentenceNumber === sentenceNumber && a.optionId === optionId),
          )
        }
        return [...prev, { sentenceNumber, optionId }]
      }
      const existing = prev.find((a) => a.sentenceNumber === sentenceNumber)
      if (existing?.optionId === optionId) {
        return prev.filter((a) => a.sentenceNumber !== sentenceNumber)
      }
      if (existing) {
        return prev.map((a) => (a.sentenceNumber === sentenceNumber ? { ...a, optionId } : a))
      }
      return [...prev, { sentenceNumber, optionId }]
    })
  }

  // Get selected answer(s) for a sentence (single when multi off, array when multi on)
  const getSelectedAnswer = (sentenceNumber: number): string | null => {
    const answer = selectedAnswers.find((a) => a.sentenceNumber === sentenceNumber)
    return answer ? answer.optionId : null
  }

  const getSelectedAnswers = (sentenceNumber: number): string[] => {
    return selectedAnswers.filter((a) => a.sentenceNumber === sentenceNumber).map((a) => a.optionId)
  }

  const handleCheckAnswers = () => {
    setResultsRevealed(true)
  }

  const hasAtLeastOneSelection = selectedAnswers.length > 0

  const getSelectedIdsForScoring = (sentenceNumber: number): string[] => {
    const config = sentenceConfigs.find((c) => c.sentenceNumber === sentenceNumber)
    const multi = config ? hasMultipleCorrectOptions(config) : false
    return multi
      ? getSelectedAnswers(sentenceNumber)
      : getSelectedAnswer(sentenceNumber) != null
        ? [getSelectedAnswer(sentenceNumber)!]
        : []
  }

  const totalQuestions = sentences.length
  const totalPoints = sentenceConfigs.reduce((sum, config) => {
    const questionTotal = config.options
      .filter((o) => o.isCorrect)
      .reduce((s, o) => s + (o.points ?? 0), 0)
    return sum + questionTotal
  }, 0)
  const totalMaxPenalty = sentenceConfigs.reduce((sum, config) => {
    const questionPenalty = config.options
      .filter((o) => !o.isCorrect)
      .reduce((s, o) => s + (o.pointsWhenWrong ?? 0), 0)
    return sum + questionPenalty
  }, 0)

  const editorContent = (
    <div className="space-y-6">
      <GameInformation
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2 mb-4">
            <Label className="text-base font-medium">Paragraph</Label>
            <p className="text-sm text-muted-foreground">
              Paste or type your text below. Separate each question using the{' '}
              <Badge
                variant="secondary"
                className="font-mono"
              >
                //
              </Badge>{' '}
              symbol—everything between two{' '}
              <Badge
                variant="outline"
                className="font-mono"
              >
                //
              </Badge>{' '}
              marks (or before the first and after the last) is one question.
            </p>
          </div>
          <Textarea
            placeholder="Enter your text. Use // to separate questions. Example: First question here. // Second question here. // Third question."
            value={paragraphText}
            onChange={(e) => setParagraphText(e.target.value)}
            className="min-h-[120px] mb-6"
          />
          <Separator className="my-6" />
          <Label className="text-base font-medium mb-4 block">
            Questions (click to add options)
          </Label>
          <div className="space-y-2">
            {sentences.map((sentence, index) => {
              const isSelected = selectedSentenceIndex === index
              const config = getSentenceConfig(index)

              return (
                <div key={index}>
                  <div
                    className={`relative cursor-pointer transition-all duration-200 p-3 rounded-lg ${
                      isSelected ? 'ring-2 ring-black/20' : ''
                    }`}
                    onClick={() => handleSelectSentence(index)}
                  >
                    <p className="text-base leading-relaxed">
                      <span className="font-medium  mr-2">{index + 1}.</span>
                      {sentence}
                    </p>
                  </div>

                  {/* Options for selected sentence */}
                  {isSelected && (
                    <div className="mt-3 ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                      {config && hasMultipleCorrectOptions(config) && (
                        <p className="text-sm text-muted-foreground">
                          Multiple answers can be correct for this question.
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Voting Options</Label>
                        <SlotsLeftLabel
                          current={config?.options.length ?? 0}
                          max={MAX_PARAGRAPH_VOTING_OPTIONS}
                        />
                      </div>

                      {config?.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-2 p-2 bg-white rounded border flex-wrap"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {option.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-black shrink-0" />
                            )}
                            <span className="text-sm wrap-break-word">{option.text}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {option.isCorrect && (
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline">
                                      <Plus />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs"
                                  >
                                    Points for correct answer.
                                  </TooltipContent>
                                </Tooltip>
                                <PointsInput
                                  value={
                                    editingPoints[option.id] !== undefined
                                      ? editingPoints[option.id]
                                      : option.points !== undefined && option.points !== null
                                        ? String(option.points)
                                        : ''
                                  }
                                  onChange={(e) => {
                                    setEditingPoints((prev) => ({
                                      ...prev,
                                      [option.id]: e.target.value,
                                    }))
                                  }}
                                  onBlur={(e) => {
                                    const raw = e.target.value.trim()
                                    const v = raw === '' ? NaN : parseFloat(raw)
                                    if (!isNaN(v)) {
                                      handleOptionPointsChange(
                                        index,
                                        option.id,
                                        Math.round(v * 2) / 2,
                                      )
                                    }
                                    setEditingPoints((prev) => {
                                      const next = { ...prev }
                                      delete next[option.id]
                                      return next
                                    })
                                  }}
                                />
                              </div>
                            )}
                            {!option.isCorrect && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline">
                                      <Minus />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs"
                                  >
                                    Wrong Answer penalty. Score never goes below zero. Applied when
                                    the answer is wrong.
                                  </TooltipContent>
                                </Tooltip>
                                <PointsInput
                                  value={
                                    editingPenalty[option.id] !== undefined
                                      ? editingPenalty[option.id]
                                      : option.pointsWhenWrong !== undefined &&
                                          option.pointsWhenWrong !== null
                                        ? String(option.pointsWhenWrong)
                                        : ''
                                  }
                                  onChange={(e) => {
                                    setEditingPenalty((prev) => ({
                                      ...prev,
                                      [option.id]: e.target.value,
                                    }))
                                  }}
                                  onBlur={(e) => {
                                    const raw = e.target.value.trim()
                                    const v = raw === '' ? NaN : parseFloat(raw)
                                    if (!isNaN(v)) {
                                      handleWrongPointsChange(
                                        index,
                                        option.id,
                                        Math.round(v * 2) / 2,
                                      )
                                    }
                                    setEditingPenalty((prev) => {
                                      const next = { ...prev }
                                      delete next[option.id]
                                      return next
                                    })
                                  }}
                                />
                              </div>
                            )}
                            <Popover
                              open={
                                editingOption?.optionId === option.id &&
                                editingOption?.sentenceIndex === index
                              }
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingOption(null)
                                  setEditOptionText('')
                                }
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 shrink-0"
                                      onClick={() => {
                                        setEditingOption({
                                          sentenceIndex: index,
                                          optionId: option.id,
                                        })
                                        setEditOptionText(option.text)
                                      }}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                  </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Edit option</TooltipContent>
                              </Tooltip>
                              <PopoverContent
                                className="w-auto p-2"
                                align="end"
                              >
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Option text"
                                    value={editOptionText}
                                    onChange={(e) => setEditOptionText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateOption(
                                          index,
                                          option.id,
                                          editOptionText,
                                          option.isCorrect,
                                        )
                                      }
                                    }}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateOption(index, option.id, editOptionText, true)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-black" />
                                      Correct
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateOption(index, option.id, editOptionText, false)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <CircleX className="w-4 h-4 text-black" />
                                      Wrong
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleRemoveOption(index, option.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {config && config.options.some((o) => o.isCorrect) && (
                        <div className="pt-2">
                          <span className="text-sm text-muted-foreground mr-2">Total points:</span>
                          <Badge variant="secondary">
                            {config.options
                              .filter((o) => o.isCorrect)
                              .reduce((s, o) => s + (o.points ?? 0), 0)}
                          </Badge>
                        </div>
                      )}

                      {config &&
                        config.options.some(
                          (o) => !o.isCorrect && (o.pointsWhenWrong ?? 0) > 0,
                        ) && (
                          <p className="pt-2 text-xs text-muted-foreground">
                            Score never goes below zero.
                          </p>
                        )}

                      {(!config || config.options.length < MAX_PARAGRAPH_VOTING_OPTIONS) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-2"
                            align="start"
                          >
                            <div className="space-y-2">
                              <Input
                                placeholder="Option text"
                                id={`option-input-${index}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.currentTarget
                                    const text = input.value.trim()
                                    if (text) {
                                      handleAddOption(index, text, false)
                                      input.value = ''
                                    }
                                  }
                                }}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `option-input-${index}`,
                                    ) as HTMLInputElement
                                    const text = input?.value.trim()
                                    if (text) {
                                      handleAddOption(index, text, true)
                                      input.value = ''
                                    }
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-black" />
                                  Correct
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `option-input-${index}`,
                                    ) as HTMLInputElement
                                    const text = input?.value.trim()
                                    if (text) {
                                      handleAddOption(index, text, false)
                                      input.value = ''
                                    }
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <X className="w-4 h-4 text-black" />
                                  False
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}

                      <Separator className="my-4" />
                      <Label className="text-sm font-medium block mb-2">
                        Feedback (shown after Check)
                      </Label>
                      <div className="space-y-3">
                        <FeedbackInput
                          label="When correct"
                          value={config?.feedbackWhenCorrect ?? ''}
                          onChange={(e) =>
                            handleFeedbackChange(index, 'feedbackWhenCorrect', e.target.value)
                          }
                          placeholder="Optional message when the answer is correct"
                        />
                        <FeedbackInput
                          label="When wrong"
                          value={config?.feedbackWhenWrong ?? ''}
                          onChange={(e) =>
                            handleFeedbackChange(index, 'feedbackWhenWrong', e.target.value)
                          }
                          placeholder="Optional message when the answer is wrong"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <GameSummaryCard
        totalQuestions={totalQuestions}
        totalPoints={totalPoints}
        pointsSubtitle={
          totalMaxPenalty > 0
            ? `Points range: 0–${totalPoints}. Wrong-answer penalties apply; score never below 0.`
            : undefined
        }
      />
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
        <CardContent className="p-6">
          <div className="relative">
            <p className="text-base leading-[2.5]">
              {sentences.map((sentence, index) => {
                const isHovered = hoveredIndex === index
                const config = getSentenceConfig(index)
                const sentenceNum = index + 1
                const selectedOptionIds =
                  config && hasMultipleCorrectOptions(config)
                    ? getSelectedAnswers(sentenceNum)
                    : getSelectedAnswer(sentenceNum) != null
                      ? [getSelectedAnswer(sentenceNum)!]
                      : []

                return (
                  <Popover
                    key={index}
                    open={openPopoverIndex === index && config && config.options.length > 0}
                    onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                  >
                    <PopoverTrigger asChild>
                      <span
                        className={`relative inline transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? 'opacity-100 scale-[1.02]'
                            : hoveredIndex !== null
                              ? 'opacity-30 blur-sm'
                              : 'opacity-100'
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => {
                          if (config && config.options.length > 0) {
                            setOpenPopoverIndex(index)
                          }
                        }}
                      >
                        {sentence}
                        {index < sentences.length - 1 && ' '}
                      </span>
                    </PopoverTrigger>
                    {config && config.options.length > 0 && (
                      <PopoverContent
                        className="w-full max-w-[700px] p-3 flex flex-col gap-2"
                        align="start"
                        onMouseEnter={() => setOpenPopoverIndex(index)}
                        onMouseLeave={() => setOpenPopoverIndex(null)}
                      >
                        {config && hasMultipleCorrectOptions(config) && (
                          <Badge className="shrink-0 w-fit bg-orange-100 text-orange-800 border-orange-200">
                            Multiple answers can be correct here.
                          </Badge>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {config.options.map((option) => {
                            const isOptionSelected = selectedOptionIds.includes(option.id)
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  handleAnswerSelect(sentenceNum, option.id)
                                  setOpenPopoverIndex(null)
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors min-w-0 shrink-0 ${
                                  isOptionSelected
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {option.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 shrink-0" />
                                )}
                                <span className="text-sm truncate max-w-[600px]">
                                  {option.text}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                )
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Results table: only visible after user clicks Check */}
      {resultsRevealed &&
        (() => {
          const { rows, totalEarned, totalMax } = computeParagraphResults(
            sentenceConfigs,
            getSelectedIdsForScoring,
          )
          if (rows.length === 0) return null
          return (
            <GameResultTable
              rows={rows}
              totalEarned={totalEarned}
              totalMax={totalMax}
            />
          )
        })()}

      <div className="flex items-center justify-start">
        <Button
          type="button"
          onClick={handleCheckAnswers}
          disabled={!hasAtLeastOneSelection}
          className="gap-2"
        >
          <Check className="size-4" />
          Check
        </Button>
      </div>
    </div>
  )

  const settingsContent = (
    <div className="py-6 px-0 flex flex-col gap-6">
      {onDelete && (
        <div>
          <p className="text-muted-foreground text-sm mb-3">
            Hold the button below for 3 seconds to delete this node.
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
      previewOnly={previewOnly}
    />
  )
}
