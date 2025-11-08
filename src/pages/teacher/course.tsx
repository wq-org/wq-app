import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseLayout from '@/components/layout/CourseLayout';
import CourseSettings from '@/features/courses/CourseSettings';
import { useCourseContext } from '@/contexts/CourseContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { EmptyTopicsView } from '@/features/courses/components/EmptyTopicsView';
import { TopicBadge, type Topic } from '@/features/courses/components/TopicBadge';
import { CreateLessonForm } from '@/features/lessons/components/CreateLessonForm';
import { LessonCardList } from '@/features/lessons/components/LessonCardList';
import type { Lesson } from '@/features/lessons/types/lesson.types';

const dummyLessons: Lesson[] = [
    {
        id: '1',
        title: 'Wound Watch',
        description: 'Identify different types of wounds from clinical photos.',
    },
    {
        id: '2',
        title: 'Symptom Snap',
        description: 'Match symptoms to the correct wound type or condition.',
    },
    {
        id: '3',
        title: 'Treatment Tactics',
        description: 'Choose the best wound care intervention for each case scenario.',
    },
    {
        id: '4',
        title: 'Fact Check: Wound Edition',
        description: 'Determine whether wound care statements are true or myths.',
    },
    {
        id: '5',
        title: 'Clinical Strategy Lab',
        description: 'Make step-by-step clinical decisions in complex wound management cases.',
    },
    {
        id: '6',
        title: 'Healing Match',
        description: 'Pair wound images with the correct dressing or treatment technique.',
    },
    {
        id: '7',
        title: 'Rapid Recall',
        description: 'Answer time-limited questions to test your wound care knowledge.',
    },
    {
        id: '8',
        title: 'Patient Case Explorer',
        description: 'Analyze detailed case studies and propose optimal care plans.',
    },
    {
        id: '9',
        title: 'Treatment Sorter',
        description: 'Organize wound treatments and materials into the correct categories.',
    },
    {
        id: '10',
        title: 'Healing Timeline',
        description: 'Arrange the phases of wound healing in the proper sequence.',
    },
];
export default function Course() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchCourseById, selectedCourse } = useCourseContext();
    const [newTopic, setNewTopic] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(false);
    const [lessons] = useState<Lesson[]>(dummyLessons);

    // Fetch and store course in context when component mounts or id changes
    useEffect(() => {
        if (id) {
            // Only fetch if we don't already have this course selected
            if (!selectedCourse || selectedCourse.id !== id) {
                fetchCourseById(id);
            }
        }
    }, [id, fetchCourseById, selectedCourse]);

    const addTopic = async () => {
        if (!newTopic.trim()) return;

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const topic: Topic = {
            id: Date.now().toString(),
            name: newTopic.trim(),
        };

        setTopics(prev => [...prev, topic]);
        setNewTopic('');
        setLoading(false);
    };

    const toggleTopic = (topic: Topic) => {
        setSelectedTopic(selectedTopic?.id === topic.id ? null : topic);
    };

    const onDeleteTopic = (topicToDelete: Topic) => {
        setTopics(prev => prev.filter(t => t.id !== topicToDelete.id));
        if (selectedTopic?.id === topicToDelete.id) {
            setSelectedTopic(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addTopic();
        }
    };



    if (!id) {
        return <div>Course not found</div>;
    }

    const overviewContent = (
        <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Neues Thema hinzufügen"
                        className="flex-1   px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
                    />
                    <Button
                        variant="default"
                        size="icon"
                        onClick={addTopic}
                        disabled={loading || !newTopic.trim()}
                        className="rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-50 duration-300"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <Plus className="w-6 h-6 text-white" />
                        )}
                    </Button>
                </div>

                <p className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-2xl">
                    Themen
                </p>
                
                {/* Empty state when no topics */}
                {topics.length === 0 ? (
                    <EmptyTopicsView />
                ) : (
                    /* Topics list */
                    <div className="flex flex-wrap gap-4">
                        {topics.map((topic, index) => (
                            <TopicBadge
                                key={topic.id}
                                topic={topic}
                                isSelected={selectedTopic?.id === topic.id}
                                index={index}
                                onToggle={toggleTopic}
                                onDelete={onDeleteTopic}
                            />
                        ))}
                    </div>
                )}

                {/* Lessons Container - Only shows when a topic is selected */}
                {selectedTopic && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Lessons for: {selectedTopic.name}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Explore the available lessons for this topic
                            </p>
                        </div>

                        <div className="mb-6">
                            <CreateLessonForm
                                topicId={selectedTopic.id}
                                courseId={id}
                                onLessonCreated={() => {
                                    // Optionally refresh lessons list
                                }}
                            />
                        </div>

                        <LessonCardList
                            lessons={lessons}
                            onView={(lessonId) => {
                                navigate(`/teacher/lesson/${lessonId}`);
                            }}
                        />
                    </div>
                )}
        </div>
    );

    return (
        <CourseLayout
            courseId={id}
            overviewContent={overviewContent}
            settingsContent={<CourseSettings courseId={id} />}
        />
    );
}
