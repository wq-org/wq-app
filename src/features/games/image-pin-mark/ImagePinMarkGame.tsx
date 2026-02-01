import { useState, useRef, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import GameLayout from '@/components/layout/GameLayout';
import ImagePin from './components/ImagePin';
import SquareMarker from './components/SquareMarker';
import GameInformation from '@/features/games/components/GameInformation';
import GameInformationCard from '@/features/games/components/GameInformationCard';
import GamePreviewAlert from '@/features/games/components/GamePreviewAlert';
import FileDropzone from '@/features/upload-files/components/FileDropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Plus, X } from 'lucide-react';
import GameSummaryCard from '@/features/games/components/GameSummaryCard';
import GameResultTable from '@/features/games/components/GameResultTable';
import PointsInput from '@/features/games/components/PointsInput';
import SlotsLeftLabel from '@/features/games/components/SlotsLeftLabel';
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton';
import { useGameEditorContext } from '@/contexts/game-studio';
import { MAX_IMAGE_PIN_SQUARES } from '@/lib/constants';

interface Square {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  question: string;
  points?: number;
}

interface PinPosition {
  id: string;
  x: number;
  y: number;
  squareId?: number; // Track which square the pin is in
}

export interface ImagePinMarkInitialData {
  title?: string;
  description?: string;
  imagePreview?: string | null;
  squares?: Square[];
  pinPositions?: PinPosition[];
}

export interface ImagePinMarkGameProps {
  initialData?: unknown;
  onDelete?: () => void;
}

type ImagePinVariant = 'default' | 'secondary' | 'correct' | 'wrong';

function DraggablePin({
  id,
  position,
  squareId,
  variant,
}: {
  id: string;
  position?: { x: number; y: number };
  squareId?: number;
  variant?: ImagePinVariant;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

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
      };

  const dragStyle = transform && position
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
    : baseStyle;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        squareId && 'ring-4 ring-blue-500 rounded-full'
      )}
    >
      <ImagePin variant={variant ?? 'default'} />
    </div>
  );
}

function DroppableArea({ children, id }: { children: React.ReactNode; id: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        'w-full h-full relative',
        isOver && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      {children}
    </div>
  );
}

export default function ImagePinMarkGame({ initialData: initialDataProp, onDelete }: ImagePinMarkGameProps = {}) {
  const initialData = initialDataProp as ImagePinMarkInitialData | null | undefined;
  const [title, setTitle] = useState<string>(initialData?.title ?? '');
  const [description, setDescription] = useState<string>(initialData?.description ?? '');
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagePreview ?? null);
  const [squares, setSquares] = useState<Square[]>(initialData?.squares ?? []);
  const [pinPositions, setPinPositions] = useState<PinPosition[]>(initialData?.pinPositions ?? []);
  const [editingPoints, setEditingPoints] = useState<Record<number, string>>({});
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [pinVariant] = useState<'default' | 'secondary'>('default');
  const [refDimensions, setRefDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const gameEditor = useGameEditorContext();

  // Register getGameData so GameNodeDialog can pull current state on Save
  useEffect(() => {
    if (!gameEditor?.registerGetGameData) return;
    gameEditor.registerGetGameData(() => ({
      title,
      description,
      imagePreview,
      squares,
      pinPositions,
    }));
  }, [gameEditor, title, description, imagePreview, squares, pinPositions]);

  // Capture editor image dimensions when we have squares (e.g. from initialData) so drop hit-test can scale
  useEffect(() => {
    if (!imagePreview || squares.length === 0) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setRefDimensions((prev) => prev ?? { width: rect.width, height: rect.height });
          }
        }
      });
    });
    return () => cancelAnimationFrame(id);
  }, [imagePreview, squares.length]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || squares.length >= MAX_IMAGE_PIN_SQUARES) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = 80;
    const height = 80;
    setRefDimensions((prev) => prev ?? { width: rect.width, height: rect.height });

    const newSquare: Square = {
      id: squares.length + 1,
      x,
      y,
      width,
      height,
      question: '',
    };

    // Log square coordinates and dimensions
    console.log('Square created:', {
      id: newSquare.id,
      x: newSquare.x,
      y: newSquare.y,
      width: newSquare.width,
      height: newSquare.height,
    });

    setSquares([...squares, newSquare]);
  };

  const handleSquareDelete = (id: number) => {
    const updatedSquares = squares
      .filter((sq) => sq.id !== id)
      .map((sq, index) => ({ ...sq, id: index + 1 }));
    setSquares(updatedSquares);
  };

  const handleSquareQuestionChange = (id: number, question: string) => {
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, question } : sq)));
  };

  const handleSquarePositionChange = (id: number, x: number, y: number) => {
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, x, y } : sq)));
  };

  const handleSquarePointsChange = (id: number, value: number) => {
    const rounded = Math.round(value * 2) / 2;
    const clamped = Math.max(0, Math.min(1000, rounded));
    setSquares((prev) => prev.map((sq) => (sq.id === id ? { ...sq, points: clamped } : sq)));
  };

  const handleCheckAnswers = () => {
    setResultsRevealed(true);
  };

  const STATEMENT_TRUNCATE_LENGTH = 60;

  const totalPoints = squares.reduce(
    (sum, sq) => sum + (sq.points != null && sq.points > 0 ? sq.points : 1),
    0
  );

  // Check if a point is within a square's bounds
  const isPointInSquare = (px: number, py: number, square: Square): boolean => {
    // Square is centered at (square.x, square.y) with transform translate(-50%, -50%)
    // So the actual bounds are:
    const left = square.x - square.width / 2;
    const right = square.x + square.width / 2;
    const top = square.y - square.height / 2;
    const bottom = square.y + square.height / 2;

    return px >= left && px <= right && py >= top && py <= bottom;
  };

  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = () => {
    dragPositionRef.current = null;
    setDragPosition(null);
    
    // Add global mousemove listener to track position during drag
    const handleMouseMove = (e: MouseEvent) => {
      if (previewImageRef.current) {
        const rect = previewImageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dragPositionRef.current = { x, y };
        setDragPosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Store cleanup function
    (window as any).__dragCleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      delete (window as any).__dragCleanup;
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Always clean up mouse listener
    if ((window as any).__dragCleanup) {
      (window as any).__dragCleanup();
    }
    
    if (over && over.id === 'image-drop-area') {
      if (previewImageRef.current) {
        const rect = previewImageRef.current.getBoundingClientRect();
        const existingPin = pinPositions.find((p) => p.id === active.id);
        
        let x: number;
        let y: number;

        // Get drop coordinates - use tracked drag position first
        const finalPosition = dragPositionRef.current || dragPosition;
        if (finalPosition) {
          x = finalPosition.x;
          y = finalPosition.y;
        } else if (over.rect) {
          // Fallback to center of drop zone
          x = over.rect.left - rect.left + over.rect.width / 2;
          y = over.rect.top - rect.top + over.rect.height / 2;
        } else if (event.activatorEvent) {
          // Use the mouse event coordinates
          const mouseEvent = event.activatorEvent as MouseEvent;
          x = mouseEvent.clientX - rect.left;
          y = mouseEvent.clientY - rect.top;
        } else if (existingPin && event.delta) {
          // Update existing position with delta
          x = existingPin.x + event.delta.x;
          y = existingPin.y + event.delta.y;
        } else {
          console.warn('Could not determine drop position', { over, event, dragPosition });
          setDragPosition(null);
          return;
        }

        // Clamp to image bounds
        x = Math.max(0, Math.min(rect.width, x));
        y = Math.max(0, Math.min(rect.height, y));

        // Scale drop coords from preview image space to editor/reference space
        // so isPointInSquare uses the same coordinate system as square.x, square.y
        let hitX = x;
        let hitY = y;
        if (refDimensions && rect.width > 0 && rect.height > 0) {
          hitX = x * (refDimensions.width / rect.width);
          hitY = y * (refDimensions.height / rect.height);
        }

        console.log(`Pin ${active.id} dropped at:`, { x, y, hitX, hitY, rect: { width: rect.width, height: rect.height } });

        // Check if pin is within any square
        let squareId: number | undefined;
        for (const square of squares) {
          if (isPointInSquare(hitX, hitY, square)) {
            squareId = square.id;
            console.log(`✅ Pin ${active.id} placed in Square ${square.id}`, {
              pinPosition: { x, y },
              square: {
                id: square.id,
                x: square.x,
                y: square.y,
                width: square.width,
                height: square.height,
              },
            });
            break;
          }
        }

        if (!squareId) {
          console.log(`Pin ${active.id} placed outside all squares`);
        }

        // Add or update pin position (store display coords x,y for rendering)
        setPinPositions((prev) => {
          const existing = prev.find((p) => p.id === active.id);
          if (existing) {
            return prev.map((p) => (p.id === active.id ? { ...p, x, y, squareId } : p));
          }
          return [...prev, { id: active.id as string, x, y, squareId }];
        });
      }
    }
    
    setDragPosition(null);
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
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload an image and start clicking on the areas you want to highlight. Your cursor turns into 
            "<span className="text-slate-500 inline-flex align-middle mx-1"><Plus /></span>" 
            icon when you hover over the uploaded image.
          </CardDescription>
          <CardAction>
            <SlotsLeftLabel current={squares.length} max={MAX_IMAGE_PIN_SQUARES} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <FileDropzone
              onFilesSelected={handleFileSelected}
              accept="image/*"
            />
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
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                  }}
                  aria-label="Click on the image to add a marker square"
                >
                  <img
                    src={imagePreview}
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
                  setImagePreview(null);
                  setSquares([]);
                  setPinPositions([]);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
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
              <div key={square.id} className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <Label>Square {square.id}</Label>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Question</Label>
                  <Textarea
                    value={square.question}
                    onChange={(e) =>
                      handleSquareQuestionChange(square.id, e.target.value)
                    }
                    placeholder={`Enter question for square ${square.id}...`}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Points</Label>
                    <PointsInput
                      value={
                        editingPoints[square.id] !== undefined
                          ? editingPoints[square.id]
                          : (square.points !== undefined && square.points !== null
                              ? String(square.points)
                              : '')
                      }
                      onChange={(e) => {
                        setEditingPoints((prev) => ({ ...prev, [square.id]: e.target.value }));
                      }}
                      onBlur={(e) => {
                        const raw = e.target.value.trim();
                        const v = raw === '' ? NaN : parseFloat(raw);
                        if (!isNaN(v)) {
                          handleSquarePointsChange(square.id, Math.round(v * 2) / 2);
                        }
                        setEditingPoints((prev) => {
                          const next = { ...prev };
                          delete next[square.id];
                          return next;
                        });
                      }}
                      className="w-20 h-8 text-xs"
                    />
                  </div>
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
  );

  const previewContent = (
    <div className="space-y-6">
      <GameInformationCard title={title} description={description} />
      <GamePreviewAlert />
      <Card>
        <CardHeader>
          <Label>Preview</Label>
        </CardHeader>
        <CardContent>
          {imagePreview ? (
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
                        const img = previewImageRef.current;
                        if (img.complete) {
                          el.style.height = `${img.offsetHeight}px`;
                        } else {
                          img.onload = () => {
                            el.style.height = `${img.offsetHeight}px`;
                          };
                        }
                      }
                    }}
                  >
                    <img
                      ref={previewImageRef}
                      src={imagePreview}
                      alt="Game preview"
                      className="w-full h-auto rounded-lg pointer-events-none select-none"
                      draggable={false}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        const container = img.parentElement;
                        if (container) {
                          container.style.height = `${img.offsetHeight}px`;
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
                      const expectedSquareId = parseInt(String(pin.id).replace(/^pin-/, ''), 10);
                      const pinSquareId = pin.squareId != null ? Number(pin.squareId) : NaN;
                      const correct =
                        !Number.isNaN(expectedSquareId) &&
                        !Number.isNaN(pinSquareId) &&
                        pinSquareId === expectedSquareId;
                      const displayVariant: ImagePinVariant = resultsRevealed
                        ? correct
                          ? 'correct'
                          : 'wrong'
                        : 'default';
                      return (
                        <DraggablePin
                          key={pin.id}
                          id={pin.id}
                          position={{ x: pin.x, y: pin.y }}
                          squareId={pin.squareId}
                          variant={displayVariant}
                        />
                      );
                    })}
                  </div>
                </DroppableArea>

                {squares.length > 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      Drag pins onto the image above:
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      {squares
                        .filter((square) => {
                          const pinId = `pin-${square.id}`;
                          return !pinPositions.some((p) => p.id === pinId);
                        })
                        .map((square) => {
                          const pinId = `pin-${square.id}`;
                          return (
                            <DraggablePin
                              key={pinId}
                              id={pinId}
                            />
                          );
                        })}
                    </div>
                    {squares.filter((square) => {
                      const pinId = `pin-${square.id}`;
                      return !pinPositions.some((p) => p.id === pinId);
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
                        <div key={square.id} className="flex gap-2">
                          <span className="font-medium min-w-[80px]">
                            Square {square.id}:
                          </span>
                          <span>{square.question || 'No question set'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resultsRevealed && squares.length > 0 && (() => {
                  let totalEarned = 0;
                  let totalMax = 0;
                  const rows = squares.map((square) => {
                    const pinId = `pin-${square.id}`;
                    const pin = pinPositions.find((p) => p.id === pinId);
                    const max = square.points != null && square.points > 0 ? square.points : 1;
                    const correct = pin?.squareId === square.id;
                    const earned = correct ? max : 0;
                    totalEarned += earned;
                    totalMax += max;
                    const statementText = square.question || 'No question set';
                    const statementTruncated =
                      statementText.length > STATEMENT_TRUNCATE_LENGTH
                        ? statementText.slice(0, STATEMENT_TRUNCATE_LENGTH) + '…'
                        : statementText;
                    const placementText = pin
                      ? correct
                        ? 'Correct'
                        : 'Wrong square'
                      : 'Not placed';
                    return {
                      key: square.id,
                      statementText,
                      statementTruncated,
                      selectedAnswerTexts: [placementText],
                      earned,
                      max,
                    };
                  });
                  return (
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
                  );
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
  );

  const settingsContent = (
    <div className="space-y-6">
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

