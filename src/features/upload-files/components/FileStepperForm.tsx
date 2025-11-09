import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator } from '@/components/ui/stepper';
import { Check } from 'lucide-react';
import type { UploadedFile } from '../types/upload.types';

interface FileStepperFormProps {
    files: UploadedFile[];
    onFileUpdate: (id: string, updates: { title: string; description: string }) => void;
    onComplete: () => void;
    onBack?: () => void;
}

export default function FileStepperForm({
    files,
    onFileUpdate,
    onComplete,
    onBack,
}: FileStepperFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Initialize form data from files
    const initializeFormData = useCallback((): Record<string, { title: string; description: string }> => {
        const initialData: Record<string, { title: string; description: string }> = {};
        files.forEach((file) => {
            initialData[file.id] = {
                title: file.title || file.file.name.split('.')[0],
                description: file.description || '',
            };
        });
        return initialData;
    }, [files]);

    const [formData, setFormData] = useState<Record<string, { title: string; description: string }>>(() => {
        const initialData: Record<string, { title: string; description: string }> = {};
        files.forEach((file) => {
            initialData[file.id] = {
                title: file.title || file.file.name.split('.')[0],
                description: file.description || '',
            };
        });
        return initialData;
    });

    // Update form data when files change
    useEffect(() => {
        const initialData = initializeFormData();
        setFormData(initialData);
        console.log('Form data initialized:', initialData);
    }, [initializeFormData]);

    const currentFile = files[currentStep - 1];

    // Log when current step changes
    useEffect(() => {
        if (currentFile) {
            console.log('Current file changed:', {
                step: currentStep,
                fileId: currentFile.id,
                fileName: currentFile.file.name,
                title: currentFile.title,
                description: currentFile.description,
                formData: formData[currentFile.id],
            });
        }
    }, [currentStep, currentFile, formData]);
    const currentFormData = currentFile 
        ? (formData[currentFile.id] || { 
            title: currentFile.title || currentFile.file.name.split('.')[0], 
            description: currentFile.description || '' 
          })
        : { title: '', description: '' };

    const handleTitleChange = (value: string) => {
        if (currentFile) {
            const currentData = formData[currentFile.id] || { 
                title: currentFile.title || currentFile.file.name.split('.')[0], 
                description: currentFile.description || '' 
            };
            const updated = { ...currentData, title: value };
            setFormData({ ...formData, [currentFile.id]: updated });
            onFileUpdate(currentFile.id, updated);
            
            // Log the change
            console.log('Title changed:', {
                fileId: currentFile.id,
                fileName: currentFile.file.name,
                oldTitle: currentData.title,
                newTitle: value,
                formData: { ...formData, [currentFile.id]: updated },
            });
        }
    };

    const handleDescriptionChange = (value: string) => {
        if (currentFile) {
            const currentData = formData[currentFile.id] || { 
                title: currentFile.title || currentFile.file.name.split('.')[0], 
                description: currentFile.description || '' 
            };
            const updated = { ...currentData, description: value };
            setFormData({ ...formData, [currentFile.id]: updated });
            onFileUpdate(currentFile.id, updated);
            
            // Log the change
            console.log('Description changed:', {
                fileId: currentFile.id,
                fileName: currentFile.file.name,
                oldDescription: currentData.description,
                newDescription: value,
                formData: { ...formData, [currentFile.id]: updated },
            });
        }
    };

    const handleNext = () => {
        if (currentStep < files.length) {
            console.log('Moving to next step:', {
                fromStep: currentStep,
                toStep: currentStep + 1,
                totalFiles: files.length,
            });
            setCurrentStep(currentStep + 1);
        } else {
            console.log('Completing file upload process:', {
                totalFiles: files.length,
                allFiles: files.map(f => ({
                    id: f.id,
                    fileName: f.file.name,
                    title: formData[f.id]?.title || f.title,
                    description: formData[f.id]?.description || f.description,
                })),
            });
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else if (onBack) {
            onBack();
        }
    };

    const isStepCompleted = (step: number) => {
        const file = files[step - 1];
        if (!file) return false;
        const data = formData[file.id];
        return data?.title.trim().length > 0;
    };

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="w-120">
            {/* Stepper Navigation */}
            <Stepper value={currentStep} onValueChange={setCurrentStep} orientation="horizontal">
                {files.map((file, index) => (
                    <div key={file.id} className="flex items-center">
                        <StepperItem step={index + 1}>
                            <StepperTrigger>
                                <StepperIndicator>
                                    {isStepCompleted(index + 1) ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </StepperIndicator>
                                <StepperTitle className="text-xs max-w-[80px] truncate">
                                    {(() => {
                                        const fileData = formData[file.id];
                                        const displayTitle = fileData?.title || file.title || file.file.name.split('.')[0];
                                        return displayTitle.length > 10
                                            ? `${displayTitle.substring(0, 10)}...`
                                            : displayTitle;
                                    })()}
                                </StepperTitle>
                            </StepperTrigger>
                        </StepperItem>
                        {index < files.length - 1 && <StepperSeparator />}
                    </div>
                ))}
            </Stepper>

            {/* Current File Form */}
            {currentFile && (
                <div className="space-y-6 p-6 bg-white rounded-2xl border">
                    <div className="flex items-center gap-4">
                        {currentFile.preview ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                    src={currentFile.preview}
                                    alt={currentFile.file.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                    {currentFile.file.name.split('.').pop()?.toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {currentFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={currentFormData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Enter file title"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={currentFormData.description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Enter file description (optional)"
                                className="w-full min-h-[100px]"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 1 && !onBack}
                        >
                            {currentStep === 1 ? 'Back' : 'Previous'}
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!currentFormData.title.trim()}
                        >
                            {currentStep === files.length ? 'Done' : 'Next'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

