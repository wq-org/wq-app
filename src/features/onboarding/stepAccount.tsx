import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import avatars
import AishaAvatar from '@/assets/img/avatars/Aisha.png';
import AstridAvatar from '@/assets/img/avatars/Astrid.png';
import BrittneyAvatar from '@/assets/img/avatars/Brittney.png';
import FlowAvatar from '@/assets/img/avatars/Flow.png';
import HieveAvatar from '@/assets/img/avatars/Hieve.png';
import TobiasAvatar from '@/assets/img/avatars/Tobias.png';

const avatars = [
    { name: 'Aisha', src: AishaAvatar, emoji: '🎉' },
    { name: 'Astrid', src: AstridAvatar, emoji: '🥳' },
    { name: 'Brittney', src: BrittneyAvatar, emoji: '✨' },
    { name: 'Flow', src: FlowAvatar, emoji: '🚀' },
    { name: 'Hieve', src: HieveAvatar, emoji: '💫' },
    { name: 'Tobias', src: TobiasAvatar, emoji: '🎯' },
];

interface StepAccountProps {
    onNext: (data: {
        username: string;
        displayName: string;
        description: string;
        avatar: typeof avatars[0];
    }) => void;
    initialData?: {
        username: string;
        displayName: string;
        description: string;
        avatarIndex: number;
    };
}

export default function StepAccount({ onNext, initialData }: StepAccountProps) {
    const [username, setUsername] = useState(initialData?.username || '');
    const [displayName, setDisplayName] = useState(initialData?.displayName || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(initialData?.avatarIndex || 0);

    const handlePreviousAvatar = () => {
        setSelectedAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
    };

    const handleNextAvatar = () => {
        setSelectedAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
    };

    const remainingChars = 120 - description.length;

    const handleContinue = () => {
        onNext({
            username,
            displayName,
            description,
            avatar: avatars[selectedAvatarIndex],
        });
    };

    return (
        <div className="flex flex-col gap-8">
     
            {/* Avatar Selection */}
            <div className="flex flex-col items-center gap-4">
                <Label className="text-base font-light">
                <h2 className="text-3xl font-light mb-2">Choose Your Avatar</h2>
                </Label>
                <div className="flex items-center gap-6">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousAvatar}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="relative flex flex-col items-center gap-3">
                        <Avatar className="w-32 h-32">
                            <AvatarImage
                                src={avatars[selectedAvatarIndex].src}
                                alt={avatars[selectedAvatarIndex].name}
                                className="object-cover"
                            />
                            <AvatarFallback>
                                {avatars[selectedAvatarIndex].name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{avatars[selectedAvatarIndex].emoji}</span>
                            <span className="text-sm font-medium text-muted-foreground">
                                {avatars[selectedAvatarIndex].name}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleNextAvatar}
                        className="rounded-full"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Avatar Indicators */}
                <div className="flex gap-2">
                    {avatars.map((avatar, index) => (
                        <button
                            key={avatar.name}
                            type="button"
                            onClick={() => setSelectedAvatarIndex(index)}
                            className={`transition-all duration-200 ${
                                index === selectedAvatarIndex
                                    ? 'text-2xl'
                                    : 'text-lg opacity-40 hover:opacity-70'
                            }`}
                        >
                            {avatar.emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="username" className="font-light">
                        Username
                    </Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="@username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-base"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="displayName" className="font-light">
                        Display Name
                    </Label>
                    <Input
                        id="displayName"
                        type="text"
                        placeholder="Your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-base"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="description" className="font-light">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Tell us about yourself (max 120 characters)"
                        value={description}
                        onChange={(e) => {
                            if (e.target.value.length <= 120) {
                                setDescription(e.target.value);
                            }
                        }}
                        maxLength={120}
                        className="resize-none"
                        rows={3}
                    />
                    <p className={`text-xs text-right ${
                        remainingChars < 20 ? 'text-orange-500' : 'text-muted-foreground'
                    }`}>
                        {remainingChars} characters remaining
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 py-11">
                <Button
                    type="button"
                    variant="default"
                    onClick={handleContinue}
                    disabled={!username || !displayName || !description}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

