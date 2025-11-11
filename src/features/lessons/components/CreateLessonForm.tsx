import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useLesson } from '@/contexts/lesson';
import { Textarea } from '@/components/ui/textarea';

interface CreateLessonFormProps {
    topicId?: string;
    onLessonCreated?: () => void;
}

export function CreateLessonForm({ topicId, onLessonCreated }: CreateLessonFormProps) {
    const [newLesson, setNewLesson] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { createLesson } = useLesson();

    const bothFieldsFilled = !!newLesson.trim() && !!description.trim() && !!topicId;

    const handleCreateLesson = async () => {
        if (!bothFieldsFilled) return;

        setLoading(true);
        try {
            const createdLesson = await createLesson({
                title: newLesson.trim(),
                content: '',
                description: description.trim(),
                topic_id: topicId as string,
            });

            // Navigate to lesson page with the created lesson ID
            navigate(`/teacher/lesson/${createdLesson.id}`);
            setNewLesson('');
            setDescription('');
            onLessonCreated?.();
        } catch (error) {
            console.error('Failed to create lesson:', error);
            // TODO: Show error toast/notification
        } finally {
            setLoading(false);
        }
    };

    const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && bothFieldsFilled) {
            handleCreateLesson();
        }
    };

    const handleDescriptionKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey && bothFieldsFilled) {
            handleCreateLesson();
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <Input
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                onKeyPress={handleTitleKeyPress}
                placeholder="Neue Lektion hinzufügen"
                className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
            />
            <div className="flex flex-col w-full">
                <Textarea
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 120) {
                        setDescription(e.target.value);
                      }
                    }}
                    onKeyPress={handleDescriptionKeyPress}
                    maxLength={120}
                    placeholder="Beschreibung der Lektion (max. 120 Zeichen)"
                    className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 resize-none h-24"
                />
                <div className="text-right text-xs text-gray-400 mt-1">{description.length}/120</div>
            </div>
            <div className="flex justify-end">
                <Button
                    variant="default"
                    size="icon"
                    onClick={handleCreateLesson}
                    disabled={loading || !bothFieldsFilled}
                    className="rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-50 duration-300"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Plus className="w-6 h-6 text-white" />
                    )}
                </Button>
            </div>
        </div>
    );
}
