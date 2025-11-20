import { useState, useRef } from 'react';
import { DndContext, useDraggable, useDroppable, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import GameLayout from '@/components/layout/GameLayout';
import ImagePin from './components/ImagePin';
import SquareMarker from './components/SquareMarker';
import GameInformation from '@/features/games/components/GameInformation';
import { useGameNodePoints } from '@/features/game-studio/contexts/GameNodePointsContext';
import FileDropzone from '@/features/upload-files/components/FileDropzone';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Square {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  question: string;
}

interface PinPosition {
  id: string;
  x: number;
  y: number;
  squareId?: number; // Track which square the pin is in
}

function DraggablePin({ 
  id, 
  position, 
  squareId 
}: { 
  id: string; 
  position?: { x: number; y: number };
  squareId?: number;
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
      <ImagePin variant="default" />
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

export default function ImagePinMarkGame() {
  const { points, onPointsChange } = useGameNodePoints();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [squares, setSquares] = useState<Square[]>([]);
  const [pinPositions, setPinPositions] = useState<PinPosition[]>([]);
  const [pinVariant] = useState<'default' | 'secondary'>('default');
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

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
    if (!imageContainerRef.current || squares.length >= 4) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = 80; // w-20 = 80px
    const height = 80; // h-20 = 80px

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
    setSquares(squares.map((sq) => (sq.id === id ? { ...sq, question } : sq)));
  };

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

        console.log(`Pin ${active.id} dropped at:`, { x, y, rect: { width: rect.width, height: rect.height } });

        // Check if pin is within any square
        let squareId: number | undefined;
        for (const square of squares) {
          if (isPointInSquare(x, y, square)) {
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

        // Add or update pin position
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
        points={points}
        onPointsChange={onPointsChange}
      />

      <Card>
        <CardHeader>
          <Label>Upload Image</Label>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <FileDropzone
              onFilesSelected={handleFileSelected}
              accept="image/*"
            />
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div
                  ref={imageContainerRef}
                  className="relative w-full cursor-crosshair"
                  onClick={handleImageClick}
                >
                  <img
                    src={imagePreview}
                    alt="Game image"
                    className="w-full h-auto rounded-lg"
                  />
                  {squares.map((square) => (
                    <SquareMarker
                      key={square.id}
                      number={square.id}
                      x={square.x}
                      y={square.y}
                      onDelete={() => handleSquareDelete(square.id)}
                    />
                  ))}
                </div>
                {squares.length >= 4 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum of 4 squares reached
                  </p>
                )}
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
              <div key={square.id} className="space-y-2">
                <Label>Square {square.id} Question</Label>
                <Input
                  value={square.question}
                  onChange={(e) =>
                    handleSquareQuestionChange(square.id, e.target.value)
                  }
                  placeholder={`Enter question for square ${square.id}...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const previewContent = (
    <div className="space-y-6">
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
                        pointerEvents="none"
                      />
                    ))}
                    {pinPositions.map((pin) => (
                      <DraggablePin
                        key={pin.id}
                        id={pin.id}
                        position={{ x: pin.x, y: pin.y }}
                        squareId={pin.squareId}
                      />
                    ))}
                  </div>
                </DroppableArea>

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

                <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">
                    Drag pins onto the image above:
                  </p>
                  <div className="flex gap-4 flex-wrap">
                      {squares
                        .filter((square) => {
                          // Only show pins that haven't been placed yet
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
      <Card>
        <CardHeader>
          <Label>Settings</Label>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pin Variant:</span>
              <span className="font-medium capitalize">{pinVariant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Squares:</span>
              <span className="font-medium">{squares.length} / 4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Placed Pins:</span>
              <span className="font-medium">{pinPositions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
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

