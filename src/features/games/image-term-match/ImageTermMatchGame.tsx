import { useState } from 'react';
import { Plus, Trash, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import FileDropzone from '@/features/upload-files/components/FileDropzone';
import GameLayout from '@/components/layout/GameLayout';
import GameInformation from '@/features/games/components/GameInformation';
import type { Term } from './types/imageTermMatch.types';

export default function ImageTermMatchGame() {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [feedbackText, setFeedbackText] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [terms, setTerms] = useState<Term[]>([
        { id: '1', value: '' },
    ]);
    const [correctTermId, setCorrectTermId] = useState<string>('');
    const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
    const [showFeedbackDrawer, setShowFeedbackDrawer] = useState<boolean>(false);

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
        if (terms.length >= 4) return;
        
        const newId = String(Date.now());
        setTerms([...terms, { id: newId, value: '' }]);
    };

    const handleRemoveTerm = (id: string) => {
        if (terms.length <= 1) return;
        
        const updatedTerms = terms.filter(term => term.id !== id);
        setTerms(updatedTerms);
        
        // Clear correct selection if removed term was selected
        if (correctTermId === id) {
            setCorrectTermId('');
        }
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

            {/* Feedback Section */}
            <Card>
                <CardHeader>
                    <Label>Feedback (shown when user selects wrong answer)</Label>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Enter feedback text that will be shown when the user selects an incorrect answer..."
                            value={feedbackText}
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setFeedbackText(e.target.value);
                                }
                            }}
                            rows={4}
                            className="resize-none"
                            maxLength={500}
                        />
                        <div className="flex justify-end">
                            <span className={`text-xs ${
                                feedbackText.length > 450 
                                    ? 'text-orange-500' 
                                    : 'text-gray-500'
                            }`}>
                                {feedbackText.length} / 500 characters
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Terms Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Label>Terms (Select the correct one)</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTerm}
                            disabled={terms.length >= 4}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Term {terms.length < 4 && `(${terms.length}/4)`}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={correctTermId}
                        onValueChange={setCorrectTermId}
                        className="space-y-3"
                    >
                        {terms.map((term, index) => (
                            <Card
                                key={term.id}
                                className={`transition-shadow ${
                                    correctTermId === term.id
                                        ? 'border-primary shadow-md'
                                        : ''
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem
                                            value={term.id}
                                            id={term.id}
                                            className="shrink-0"
                                        />
                                        <Label
                                            htmlFor={term.id}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <Input
                                                type="text"
                                                placeholder={`Term ${index + 1}`}
                                                value={term.value}
                                                onChange={(e) =>
                                                    handleTermChange(term.id, e.target.value)
                                                }
                                                className="w-full"
                                            />
                                        </Label>
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
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        const gameData = {
                            title: title.trim() || null,
                            description: description.trim() || null,
                            feedbackText: feedbackText.trim() || null,
                            filepath: imageFile?.name || null,
                            imagePreview: imagePreview || null,
                            answers: terms.map(term => ({
                                id: term.id,
                                value: term.value,
                                isCorrect: term.id === correctTermId,
                            })),
                            correctAnswerId: correctTermId || null,
                        };
                        console.log('Game Data:', gameData);
                    }}
                    disabled={!title.trim() || !imagePreview || terms.some(term => !term.value.trim()) || !correctTermId}
                >
                    Save Game
                </Button>
            </div>
        </div>
    );

    // Preview Content
    const previewContent = (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                            <AvatarFallback>Q</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-1">
                                {title || 'Game Preview'}
                            </h2>
                            {description && (
                                <p className="text-sm text-gray-600">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border relative">
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
            {terms.filter(term => term.value.trim()).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {terms
                        .filter(term => term.value.trim())
                        .map((term, index) => {
                            const letter = String.fromCharCode(65 + index); // A, B, C, D
                            const isCorrect = term.id === correctTermId;
                            
                            return (
                                <Button
                                    key={term.id}
                                    variant="outline"
                                    className={`h-auto py-4 px-4 flex items-center justify-start gap-3 ${
                                        isCorrect
                                            ? 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                                            : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        const wasCorrect = term.id === correctTermId;
                                        setCorrectTermId(term.id);
                                        // Show feedback drawer when correct answer is selected
                                        if (wasCorrect) {
                                            setShowFeedbackDrawer(true);
                                        }
                                    }}
                                >
                                    <span className={`font-semibold text-lg ${
                                        isCorrect ? 'text-blue-500' : 'text-black'
                                    }`}>
                                        {letter}.
                                    </span>
                                    <span className={`flex-1 text-left ${
                                        isCorrect ? 'text-blue-500 font-medium' : 'text-black'
                                    }`}>
                                        {term.value}
                                    </span>
                                </Button>
                            );
                        })}
                </div>
            )}

            {(!imagePreview && terms.every(term => !term.value.trim())) && (
                <div className="text-center text-gray-400 py-12">
                    <p>Complete the editor to see the preview</p>
                </div>
            )}
        </div>
    );

    // Settings Content
    const settingsContent = (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Game Settings</h2>
                <p className="text-gray-600 text-sm">
                    Configure game settings and preferences.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <Label>Game Data</Label>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Image:</span>
                            <span className="font-medium">{imageFile?.name || 'Not uploaded'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Terms:</span>
                            <span className="font-medium">{terms.filter(t => t.value.trim()).length} / 4</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Correct Answer:</span>
                            <span className="font-medium">
                                {correctTermId 
                                    ? terms.find(t => t.id === correctTermId)?.value || 'Not selected'
                                    : 'Not selected'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Feedback:</span>
                            <span className="font-medium">{feedbackText.trim() ? 'Set' : 'Not set'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Game Section */}
            <Card>
                <CardHeader>
                    <Label className=" font-bold">Delete Game</Label>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="delete-confirm" className=" font-bold">
                            Type <span className="text-red-500">delete-game-node</span> to confirm deletion
                        </Label>
                        <Input
                            id="delete-confirm"
                            type="text"
                            placeholder="delete-game-node"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="border-red-500/20 focus:border-red-500"
                        />
                    </div>
                    {deleteConfirmText === 'delete-game-node' && (
                        <Button
                            variant="outline"
                            className=" text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:text-red-600"
                            onClick={() => {
                                // Handle delete logic here
                                console.log('Game deleted');
                                // Reset all state
                                setTitle('');
                                setDescription('');
                                setFeedbackText('');
                                setImageFile(null);
                                setImagePreview(null);
                                setTerms([{ id: '1', value: '' }]);
                                setCorrectTermId('');
                                setDeleteConfirmText('');
                            }}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            <span className="text-red-500">Delete Game</span>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <>
            <GameLayout
                editorContent={editorContent}
                previewContent={previewContent}
                settingsContent={settingsContent}
            />
            
            {/* Feedback Drawer */}
            <Drawer open={showFeedbackDrawer} onOpenChange={setShowFeedbackDrawer}>
                <DrawerContent className="!h-[40vh]">
                    <DrawerHeader className="text-center">
                        {/* Checkmark Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-gray-600" />
                            </div>
                        </div>
                        
                        <DrawerTitle className="text-2xl font-bold text-gray-800">
                            Hurra super gemacht.
                        </DrawerTitle>
                        
                        <DrawerDescription className="text-base text-gray-600 mt-2">
                            Dafür gibts einen Punkt. Nun weiter zum nächsten drücke
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="p-4">
                        <Button
                            className="w-full bg-gray-800 text-white hover:bg-gray-700"
                            onClick={() => setShowFeedbackDrawer(false)}
                        >
                            Okey
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
