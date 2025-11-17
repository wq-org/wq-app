import { useState } from 'react';
import { CheckCircle2, X, Plus, Trash2, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GameLayout from '@/components/layout/GameLayout';
import GameInformation from '@/features/games/components/GameInformation';
import { Card, CardContent } from '@/components/ui/card';

const paragraph = `Maintaining good health is one of the most important things in life. Regular exercise not only benefits your body but also helps elevate your mood and reduce stress. I believe eating a balanced diet, filled with fruits and vegetables, can make a big difference in how you feel every day. Sometimes just going for a walk or drinking enough water can boost your energy levels. In my opinion, prioritizing sleep is just as crucial as staying active. Everyone has different routines, but finding what makes you feel your best is key. Taking care of your mental health is just as vital as taking care of your physical health, and it's perfectly okay to rest when you need it.`;


interface VotingOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface SentenceConfig {
  sentenceNumber: number;
  sentenceText: string;
  options: VotingOption[];
}

interface SelectedAnswer {
  sentenceNumber: number;
  optionId: string;
}

export default function ParagraphLineSelectGame() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [sentenceConfigs, setSentenceConfigs] = useState<SentenceConfig[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([]);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  // Split paragraph into sentences
  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());

  // Get config for a sentence
  const getSentenceConfig = (index: number): SentenceConfig | undefined => {
    return sentenceConfigs.find((config) => config.sentenceNumber === index + 1);
  };

  // Handle selecting a sentence in editor
  const handleSelectSentence = (index: number) => {
    setSelectedSentenceIndex(index);
    // Initialize config if it doesn't exist
    if (!getSentenceConfig(index)) {
      setSentenceConfigs((prev) => [
        ...prev,
        {
          sentenceNumber: index + 1,
          sentenceText: sentences[index],
          options: [],
        },
      ]);
    }
  };

  // Add voting option to selected sentence
  const handleAddOption = (sentenceIndex: number, optionText: string, isCorrect: boolean) => {
    const config = getSentenceConfig(sentenceIndex);
    if (!config) return;

    if (config.options.length >= 3) return;

    const newOption: VotingOption = {
      id: `option-${Date.now()}`,
      text: optionText,
      isCorrect,
    };

    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? { ...c, options: [...c.options, newOption] }
          : c
      )
    );
  };

  // Remove voting option
  const handleRemoveOption = (sentenceIndex: number, optionId: string) => {
    setSentenceConfigs((prev) =>
      prev.map((c) =>
        c.sentenceNumber === sentenceIndex + 1
          ? { ...c, options: c.options.filter((opt) => opt.id !== optionId) }
          : c
      )
    );
  };

  // Handle answer selection in preview
  const handleAnswerSelect = (sentenceNumber: number, optionId: string) => {
    setSelectedAnswers((prev) => {
      const existing = prev.find((a) => a.sentenceNumber === sentenceNumber);
      if (existing) {
        return prev.map((a) =>
          a.sentenceNumber === sentenceNumber ? { ...a, optionId } : a
        );
      }
      return [...prev, { sentenceNumber, optionId }];
    });
  };

  // Get selected answer for a sentence
  const getSelectedAnswer = (sentenceNumber: number): string | null => {
    const answer = selectedAnswers.find((a) => a.sentenceNumber === sentenceNumber);
    return answer ? answer.optionId : null;
  };

  // Handle save - log everything as a single object
  const handleSave = () => {
    const gameData = {
      title,
      description,
      paragraph,
      sentenceConfigs,
    };
    console.log(gameData);
  };

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
          <Label className="text-base font-medium mb-4 block">Paragraph</Label>
          <div className="space-y-2">
            {sentences.map((sentence, index) => {
              const isSelected = selectedSentenceIndex === index;
              const config = getSentenceConfig(index);

              return (
                <div key={index}>
                  <div
                    className={`relative cursor-pointer transition-all duration-200 p-3 rounded-lg ${
                      isSelected
                        ? 'ring-2 ring-black/20'
                        : ''
                    }`}
                    onClick={() => handleSelectSentence(index)}
                  >
                    <p className="text-base leading-relaxed">
                      <span className="font-medium  mr-2">
                        {index + 1}.
                      </span>
                      {sentence}
                    </p>
                  </div>

                  {/* Options for selected sentence */}
                  {isSelected && (
                    <div className="mt-3 ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">
                          Voting Options (max 3)
                        </Label>
                        <span className="text-xs text-gray-500">
                          {config?.options.length || 0}/3
                        </span>
                      </div>

                      {config?.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-2 p-2 bg-white rounded border"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {option.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-black" />
                            ) : (
                              <X className="w-4 h-4 text-black" />
                            )}
                            <span className="text-sm">{option.text}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveOption(index, option.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}

                      {(!config || config.options.length < 3) && (
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
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="space-y-2">
                              <Input
                                placeholder="Option text"
                                id={`option-input-${index}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.currentTarget;
                                    const text = input.value.trim();
                                    if (text) {
                                      handleAddOption(index, text, false);
                                      input.value = '';
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
                                      `option-input-${index}`
                                    ) as HTMLInputElement;
                                    const text = input?.value.trim();
                                    if (text) {
                                      handleAddOption(index, text, true);
                                      input.value = '';
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
                                      `option-input-${index}`
                                    ) as HTMLInputElement;
                                    const text = input?.value.trim();
                                    if (text) {
                                      handleAddOption(index, text, false);
                                      input.value = '';
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );

  const previewContent = (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <p className="text-base leading-[2.5]">
              {sentences.map((sentence, index) => {
                const isHovered = hoveredIndex === index;
                const config = getSentenceConfig(index);
                const selectedOptionId = getSelectedAnswer(index + 1);

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
                            setOpenPopoverIndex(index);
                          }
                        }}
                      >
                        {sentence}
                        {index < sentences.length - 1 && ' '}
                      </span>
                    </PopoverTrigger>
                    {config && config.options.length > 0 && (
                      <PopoverContent 
                        className="w-auto p-2" 
                        align="start"
                        onMouseEnter={() => setOpenPopoverIndex(index)}
                        onMouseLeave={() => setOpenPopoverIndex(null)}
                      >
                        <div className="space-y-1">
                          {config.options.map((option) => {
                            const isOptionSelected = selectedOptionId === option.id;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  handleAnswerSelect(index + 1, option.id);
                                  setOpenPopoverIndex(null);
                                }}
                                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                                  isOptionSelected
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {option.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                                <span className="text-sm">{option.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Selected Answers List */}
      {selectedAnswers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selected Answers
          </h3>
          <div className="space-y-1">
            {selectedAnswers
              .sort((a, b) => a.sentenceNumber - b.sentenceNumber)
              .map((answer) => {
                const config = sentenceConfigs.find(
                  (c) => c.sentenceNumber === answer.sentenceNumber
                );
                const option = config?.options.find(
                  (opt) => opt.id === answer.optionId
                );

                if (!option) return null;

                return (
                  <div
                    key={answer.sentenceNumber}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-gray-500 min-w-[40px]">
                      {answer.sentenceNumber}.
                    </span>
                    {option.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-black flex-shrink-0" />
                    )}
                    <span className="text-foreground">{option.text}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  const settingsContent = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600">Game settings will appear here.</p>
    </div>
  );

  return (
    <GameLayout
      editorContent={editorContent}
      previewContent={previewContent}
      settingsContent={settingsContent}
    />
  );
}
