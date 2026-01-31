import { useState, useEffect } from 'react';
import { Plus, X, Check, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import FileDropzone from '@/features/upload-files/components/FileDropzone';
import GameLayout from '@/components/layout/GameLayout';
import GameInformation from '@/features/games/components/GameInformation';
import GameSummaryCard from '@/features/games/components/GameSummaryCard';
import GameResultTable from '@/features/games/components/GameResultTable';
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton';
import { MAX_IMAGE_TERM_OPTIONS } from '@/lib/constants';
import { useGameEditorContext } from '@/contexts/game-studio';
import type { Term, ImageTermMatchGameProps, ImageTermMatchGameData } from './types/imageTermMatch.types';

const STATEMENT_TRUNCATE_LENGTH = 60;

function getInitialTerms(initialData: ImageTermMatchGameData | null | undefined): Term[] {
    const t = initialData?.terms;
    if (Array.isArray(t) && t.length > 0) return t;
    return [{ id: '1', value: '' }];
}

export default function ImageTermMatchGame({ initialData: initialDataProp, onDelete }: ImageTermMatchGameProps = {}) {
    const initialData = initialDataProp as ImageTermMatchGameData | null | undefined;
    const [title, setTitle] = useState<string>(initialData?.title ?? '');
    const [description, setDescription] = useState<string>(initialData?.description ?? '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePreview ?? null);
    const [terms, setTerms] = useState<Term[]>(() => getInitialTerms(initialData));
    const [previewSelectedTermIds, setPreviewSelectedTermIds] = useState<string[]>([]);
    const [resultsRevealed, setResultsRevealed] = useState(false);
    const [editingPoints, setEditingPoints] = useState<Record<string, string>>({});
    const [previewDescriptionExpanded, setPreviewDescriptionExpanded] = useState(false);

    const gameEditor = useGameEditorContext();

    const correctTerms = terms.filter((t) => t.isCorrect);
    const pointsWhenCorrect = correctTerms.reduce(
        (sum, t) => sum + (t.points != null && t.points > 0 ? t.points : 1),
        0
    );

    useEffect(() => {
        if (!gameEditor?.registerGetGameData) return;
        gameEditor.registerGetGameData(() => ({
            title,
            description,
            imageFile: imageFile?.name ?? null,
            imagePreview,
            terms,
        }));
    }, [gameEditor, title, description, imageFile, imagePreview, terms]);

    const handleImageSelected = (files: File[]) => {
        if (files.length === 0) return;
        
        const selectedFile = files[0];
        
        // Validate it's an image
        if (!selectedFile.type.startsWith('image/')) {
            return;
        }

        // Validate it's not WebP
        if (selectedFile.type === 'image/webp') {
            return;
        }

        setImageFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.onerror = () => {
            setImagePreview(null);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleAddTerm = () => {
        if (terms.length >= MAX_IMAGE_TERM_OPTIONS) return;

        const newId = String(Date.now());
        setTerms([...terms, { id: newId, value: '' }]);
    };

    const handleTermPointsChange = (termId: string, value: number) => {
        const rounded = Math.round(value * 2) / 2;
        const clamped = Math.max(0, Math.min(1000, rounded));
        setTerms((prev) =>
            prev.map((t) => (t.id === termId ? { ...t, points: clamped } : t))
        );
    };

    const handleRemoveTerm = (id: string) => {
        if (terms.length <= 1) return;
        setTerms((prev) => prev.filter((term) => term.id !== id));
        setPreviewSelectedTermIds((prev) => prev.filter((tid) => tid !== id));
    };

    const handleToggleCorrect = (termId: string) => {
        setTerms((prev) =>
            prev.map((t) =>
                t.id === termId ? { ...t, isCorrect: !t.isCorrect } : t
            )
        );
    };

    const handleTermChange = (id: string, value: string) => {
        setTerms(terms.map(term => 
            term.id === id ? { ...term, value } : term
        ));
    };

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
                    {imagePreview ? (
                        <div className="space-y-2">
                            <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                                <img
                                    src={imagePreview}
                                    alt="Game image"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setImageFile(null);
                                    setImagePreview(null);
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
                                <span className="text-xs text-gray-500">
                                    {MAX_IMAGE_TERM_OPTIONS - terms.length}/{MAX_IMAGE_TERM_OPTIONS} slots left
                                </span>
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
                            Add up to four multiple choice options. Use the <Circle className="inline size-3.5 mx-0.5" aria-hidden /> / <CheckCircle2 className="inline size-3.5 mx-0.5" aria-hidden /> icon to mark which are correct, and set points for each correct option.
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {terms.map((term, index) => (
                            <Card
                                key={term.id}
                                className={`transition-shadow ${
                                    term.isCorrect ? 'border-primary shadow-md' : ''
                                }`}
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
                                                onChange={(e) =>
                                                    handleTermChange(term.id, e.target.value)
                                                }
                                                className="w-full"
                                            />
                                        </Label>
                                        {term.isCorrect && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Label className="text-xs text-muted-foreground whitespace-nowrap">Points</Label>
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="pts"
                                                    value={
                                                        editingPoints[term.id] !== undefined
                                                            ? editingPoints[term.id]
                                                            : (term.points !== undefined && term.points !== null
                                                                ? String(term.points)
                                                                : '')
                                                    }
                                                    onChange={(e) => {
                                                        setEditingPoints((prev) => ({ ...prev, [term.id]: e.target.value }));
                                                    }}
                                                    onBlur={(e) => {
                                                        const raw = e.target.value.trim();
                                                        const v = raw === '' ? NaN : parseFloat(raw);
                                                        if (!isNaN(v)) {
                                                            handleTermPointsChange(term.id, Math.round(v * 2) / 2);
                                                        }
                                                        setEditingPoints((prev) => {
                                                            const next = { ...prev };
                                                            delete next[term.id];
                                                            return next;
                                                        });
                                                    }}
                                                    className="w-16 h-8 text-xs"
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

            <GameSummaryCard totalQuestions={1} totalPoints={pointsWhenCorrect} />
        </div>
    );

    // Preview Content
    const statementText = title?.trim() || 'Image term match';
    const statementTruncated =
        statementText.length > STATEMENT_TRUNCATE_LENGTH
            ? statementText.slice(0, STATEMENT_TRUNCATE_LENGTH) + '…'
            : statementText;

    const PREVIEW_DESCRIPTION_TRUNCATE = 600;
    const isPreviewDescriptionLong =
        typeof description === 'string' && description.length > PREVIEW_DESCRIPTION_TRUNCATE;
    const previewDescriptionDisplay =
        description &&
        (isPreviewDescriptionLong && !previewDescriptionExpanded
            ? `${description.slice(0, PREVIEW_DESCRIPTION_TRUNCATE)}…`
            : description);

    const previewContent = (
        <div className="space-y-6">
            <div className="space-y-2">
                {title && (
                    <h2 className="text-lg font-semibold">{title}</h2>
                )}
                {description && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{previewDescriptionDisplay}</p>
                        {isPreviewDescriptionLong && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setPreviewDescriptionExpanded((prev) => !prev)}
                            >
                                {previewDescriptionExpanded ? (
                                    <>
                                        <ChevronUp className="size-4" aria-hidden />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="size-4" aria-hidden />
                                        Show more
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Alert
                variant="default"
                className="bg-slate-100 border-slate-200 text-slate-800 [&_[data-slot=alert-title]]:text-slate-900 [&_[data-slot=alert-description]]:text-slate-700"
            >
                <AlertTitle>Preview only</AlertTitle>
                <AlertDescription>
                    The correct/incorrect styling is for preview only and is hidden in production so players do not see it during play.
                </AlertDescription>
            </Alert>

            <Card>
                <CardContent className="p-6">
                    <div className="w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
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
                            const letter = String.fromCharCode(65 + index);
                            const isSelected = previewSelectedTermIds.includes(term.id);
                            const isCorrect = term.isCorrect ?? false;

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
                                                : [...prev, term.id]
                                        );
                                    }}
                                >
                                    <span className={`font-semibold text-lg ${isSelected && isCorrect ? 'text-blue-500' : 'text-black'}`}>
                                        {letter}.
                                    </span>
                                    <span className={`flex-1 text-left ${isSelected && isCorrect ? 'text-blue-500 font-medium' : 'text-black'}`}>
                                        {term.value}
                                    </span>
                                </Button>
                            );
                        })}
                </div>
            )}

            <Separator />

            {resultsRevealed && (() => {
                const selectedTexts = previewSelectedTermIds
                    .map((id) => terms.find((t) => t.id === id)?.value ?? '')
                    .filter(Boolean);
                const earned = previewSelectedTermIds.reduce((sum, id) => {
                    const term = terms.find((t) => t.id === id);
                    if (!term?.isCorrect) return sum;
                    const pts = term.points != null && term.points > 0 ? term.points : 1;
                    return sum + pts;
                }, 0);
                const rows = [
                    {
                        key: 'image-term',
                        statementText,
                        statementTruncated,
                        selectedAnswerTexts: selectedTexts,
                        earned,
                        max: pointsWhenCorrect,
                    },
                ];
                return (
                    <GameResultTable
                        rows={rows}
                        totalEarned={earned}
                        totalMax={pointsWhenCorrect}
                    />
                );
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

            {!imagePreview && terms.every((term) => !term.value.trim()) && (
                <div className="text-center text-gray-400 py-12">
                    <p>Complete the editor to see the preview</p>
                </div>
            )}
        </div>
    );

    // Settings Content
    const settingsContent = (
        <div className="p-6 flex flex-col gap-6">
            {onDelete && (
                <div>
                    <p className="text-muted-foreground text-sm mb-3">
                        Hold the button below for 3 seconds to delete this game node.
                    </p>
                    <HoldToDeleteButton onDelete={onDelete} holdDuration={3000} />
                </div>
            )}
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
