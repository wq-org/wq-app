import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface ConfirmationDialogProps {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    Icon?: LucideIcon;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ConfirmationDialog({
    title,
    description,
    onConfirm,
    onCancel,
    Icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'destructive',
    open: controlledOpen,
    onOpenChange,
}: ConfirmationDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    
    // Use controlled open if provided, otherwise use internal state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    const handleConfirm = () => {
        onConfirm();
        setIsOpen(false);
    };

    const handleCancel = () => {
        onCancel();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    {Icon && (
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <Icon className="h-6 w-6 text-destructive" />
                        </div>
                    )}
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

