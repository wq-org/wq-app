import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator } from '@/components/ui/stepper';
import { Check } from 'lucide-react';
import type { UploadedFile } from '../types/upload.types';

interface FileStepperFormProps {
    files: UploadedFile[];
    onFileUpdate: (id: string, updates: { title: string }) => void;
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
    const initializeFormData = useCallback((): Record<string, { title: string }> => {
        const initialData: Record<string, { title: string }> = {};
        files.forEach((file) => {
            initialData[file.id] = {
                title: file.title || file.file.name.split('.')[0],
            };
        });
        return initialData;
    }, [files]);

    const [formData, setFormData] = useState<Record<string, { title: string }>>(() => {
        const initialData: Record<string, { title: string }> = {};
        files.forEach((file) => {
            initialData[file.id] = {
                title: file.title || file.file.name.split('.')[0],
            };
        });
        return initialData;
    });

    // Update form data when files change
    useEffect(() => {
        const initialData = initializeFormData();
        setFormData(initialData);
    }, [initializeFormData]);

    const currentFile = files[currentStep - 1];

    
    const currentFormData = currentFile 
        ? (formData[currentFile.id] || { 
            title: currentFile.title || currentFile.file.name.split('.')[0]
          })
        : { title: '' };

    const handleFilenameChange = (value: string) => {
        if (currentFile) {
            // Always update formData with the new value, even if empty
            const updated = { title: value };
            setFormData((prev) => ({ ...prev, [currentFile.id]: updated }));
            onFileUpdate(currentFile.id, updated);            
        }
    };

    const handleNext = () => {
        if (currentStep < files.length) {
       
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    }

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
                                        // Use original filename for stepper title, not the form input
                                        const displayTitle = file.file.name.split('.')[0];
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
                            <Label htmlFor="filename">Filename *</Label>
                            <Input
                                id="filename"
                                value={currentFormData.title}
                                onChange={(e) => handleFilenameChange(e.target.value)}
                                placeholder="Enter filename"
                                className="w-full"
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

