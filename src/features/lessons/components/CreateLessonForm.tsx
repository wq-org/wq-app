import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface CreateLessonFormProps {
    topicId?: string;
    courseId?: string;
    onLessonCreated?: () => void;
}

export function CreateLessonForm({ topicId, courseId, onLessonCreated }: CreateLessonFormProps) {
    const [newLesson, setNewLesson] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateLesson = async () => {
        if (!newLesson.trim()) return;

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to lesson page with the new lesson title
        const lessonId = Date.now().toString();
        navigate(`/teacher/lesson/${lessonId}`, {
            state: {
                title: newLesson.trim(),
                topicId,
                courseId,
            },
        });

        setNewLesson('');
        setLoading(false);
        onLessonCreated?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCreateLesson();
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Input
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Neue Lektion hinzufügen"
                className="flex-1 px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
            />
            <Button
                variant="default"
                size="icon"
                onClick={handleCreateLesson}
                disabled={loading || !newLesson.trim()}
                className="rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-50 duration-300"
            >
                {loading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                    <Plus className="w-6 h-6 text-white" />
                )}
            </Button>
        </div>
    );
}

