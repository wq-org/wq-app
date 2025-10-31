import { useState } from 'react';
import AppWrapper from '@/components/layout/AppWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, TextCursorInput, Check, X, Loader2, File } from 'lucide-react';

interface Topic {
    id: string;
    name: string;
}

interface LessonCard {
    id: string;
    title: string;
    description: string;
}

const dummyLessons: LessonCard[] = [
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
    const [newTopic, setNewTopic] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <AppWrapper role="teacher">
            <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
                {/* Add new topic input section */}
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-2xl">
                    Themen
                </p>
                
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

                <Label className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    Deine Themen
                </Label>

                {/* Empty state when no topics */}
                {topics.length === 0 ? (
                    <div className="flex  border-4xl flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
                        <div className="p-3 rounded-full bg-gray-50 border border-gray-200 animate-in zoom-in-50 duration-300 delay-150">
                            <TextCursorInput className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="mt-3 text-gray-500 text-center text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                            füge ein neues Thema hinzu
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
                            Es ist noch kein Thema vorhanden. Bitte nutzen Sie das Eingabefeld und klicken Sie auf das Plus-Symbol
                        </p>
                    </div>
                ) : (
                    /* Topics list */
                    <div className="flex flex-wrap gap-4">
                        {topics.map((topic, index) => (
                            <Button
                                key={topic.id}
                                onClick={() => toggleTopic(topic)}
                                variant="secondary"
                                className="flex items-center gap-2 rounded-full py-2 text-base font-semibold transition hover:scale-105 active:scale-95 duration-200 animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {selectedTopic?.id === topic.id && (
                                    <Badge
                                        variant="default"
                                        className="rounded-full animate-in zoom-in-50 duration-200 hover:scale-95 active:scale-90 transition-all text-white p-0.5"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </Badge>
                                )}
                                <span className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    {topic.name}
                                </span>
                                <Separator orientation="vertical" className="h-4 bg-black" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTopic(topic);
                                    }}
                                    className="rounded-full hover:scale-105 active:scale-95 transition-all duration-200 h-6 w-6"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </Button>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dummyLessons.map((lesson, index) => (
                                <Card
                                    key={lesson.id}
                                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md h-[280px] flex flex-col"
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Icon and Title */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                                                <File className="h-6 w-6 text-blue-500" />
                                            </div>
                                                <div className="flex-1 min-w-0">
                                                    <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-help">
                                                            {index + 1}. {lesson.title}
                                                        </h3>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{index + 1}. {lesson.title}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1 mb-4 min-h-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="text-sm text-gray-600 line-clamp-3 cursor-help">
                                                        {lesson.description}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{lesson.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        {/* View Button */}
                                        <div className="mt-auto">
                                            <Button
                                                variant="default"
                                                className="w-full rounded-lg  w-fit bg-gray-900 px-6 text-sm font-medium hover:bg-gray-800"
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppWrapper>
    );
}
