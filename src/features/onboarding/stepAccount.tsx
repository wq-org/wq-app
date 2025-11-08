import {useState, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import PulsarLoading from '@/components/ui/pulsar-loading';
import {useAvatarUrl} from '@/hooks/useAvatarUrl';

interface AvatarOption {
    name: string;
    src: string;
    emoji: string;
    description?: string;
}

interface StepAccountProps {
    onNext: (data: {
        username: string;
        displayName: string;
        description: string;
        avatar: AvatarOption;
    }) => void;
    initialData?: {
        username: string;
        displayName: string;
        description: string;
        avatarIndex: number;
    };
}

export default function StepAccount({onNext, initialData}: StepAccountProps) {
    const [username, setUsername] = useState(initialData?.username || '');
    const [displayName, setDisplayName] = useState(initialData?.displayName || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(initialData?.avatarIndex || 0);
    const [avatars, setAvatars] = useState<AvatarOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Calculate safe avatar index and get signed URL
    // Must be at the top level, before any conditional returns
    const safeAvatarIndex = Math.min(selectedAvatarIndex, avatars.length - 1);
    const selectedAvatar = avatars[safeAvatarIndex];
    const { url: signedAvatarUrl } = useAvatarUrl(selectedAvatar?.src);

    // Fetch avatars from Supabase storage
    useEffect(() => {
        async function fetchAvatars() {
            try {
                const {data: files, error} = await supabase.storage
                    .from('avatars')
                    .list('meta_data', {
                        limit: 100,
                        offset: 0,
                    });

                    console.log('files', files);
                if (error || !files) {
                    console.error('Error fetching avatars:', error);
                    setAvatars([
                        {name: 'Willfryd', src: 'https://github.com/shadcn.png', emoji: '🎉'},
                    ]);
                    return;
                }

                // Filter for JSON metadata files only
                const jsonFiles = files.filter(file => file.name.endsWith('.json'));

                if (jsonFiles.length === 0) {
                    console.error('No JSON metadata files found in avatars/meta_data/');
                    setAvatars([
                        {name: 'Willfryd', src: 'https://github.com/shadcn.png', emoji: '🎉'},
                    ]);
                    return;
                }

                // Fetch metadata and pair with PNG images
                const avatarPromises = jsonFiles.map(async (jsonFile) => {
                    try {
                        // Download and parse the JSON metadata
                        const {data: fileData, error: downloadError} = await supabase.storage
                            .from('avatars')
                            .download(`meta_data/${jsonFile.name}`);

                        if (downloadError || !fileData) {
                            console.error(`Error downloading ${jsonFile.name}:`, downloadError);
                            return null;
                        }

                        const text = await fileData.text();
                        const metadata = JSON.parse(text);
                        console.log('metadata', metadata);

                        // Get the corresponding PNG file (same name, different extension)
                        const imageName = jsonFile.name.replace('.json', '.png');
                        
                        // Store just the path, not the signed URL
                        // We'll create signed URLs when displaying
                        return {
                            name: metadata.name || imageName,
                            src: `faces/${imageName}`,  // ← just the path
                            emoji: metadata.emoji || '🎉',
                            description: metadata.description || '',
                        };
                    } catch (parseError) {
                        console.error(`Error parsing ${jsonFile.name}:`, parseError);
                        return null;
                    }
                });

                const avatarResults = await Promise.all(avatarPromises);
                console.log('avatarResults', avatarResults);
                // Filter out any nulls from failed parses
                const validAvatars = avatarResults.filter(avatar => avatar !== null);

                if (validAvatars.length === 0) {
                    console.error('No valid avatars could be loaded');
                    setAvatars([
                        {name: 'Willfryd', src: 'https://github.com/shadcn.png', emoji: '🎉'},
                    ]);
                } else {
                    setAvatars(validAvatars);
                }
            } catch (err) {
                console.error('Error loading avatars:', err);
                setAvatars([
                    {name: 'Willfryd', src: 'https://github.com/shadcn.png', emoji: '🎉'},
                ]);
            } finally {
                setIsLoading(false);
            }
        }

     
        fetchAvatars();

    }, []);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <PulsarLoading variant="light" size="xl" speed={1750} />
            </div>
        );
    }

    // ✅ ADD THIS: Check if avatars array is empty after loading
    if (!avatars || avatars.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <p className="text-muted-foreground">No avatars available.</p>
                <p className="text-sm text-gray-500">
                    Please check your Supabase storage bucket: avatars/meta_data/ and avatars/faces/
                </p>
            </div>
        );
    }

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
                                src={signedAvatarUrl || selectedAvatar.src}
                                alt={selectedAvatar.name}
                                className="object-cover"
                            />
                            <AvatarFallback>
                                {selectedAvatar.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedAvatar.emoji}</span>
                                <span className="text-sm font-medium text-foreground">
                                    {selectedAvatar.name}
                                </span>
                            </div>
                            {selectedAvatar.description && (
                                <p className="text-xs text-muted-foreground text-center max-w-xs">
                                    {selectedAvatar.description}
                                </p>
                            )}
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
                            className={`transition-all duration-200 ${index === selectedAvatarIndex
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
                        value={username.toLowerCase()}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
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
                    <p className={`text-xs text-right ${remainingChars < 20 ? 'text-orange-500' : 'text-muted-foreground'
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
