import Container from '../common/Container';
import Navigation from '../common/Navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants';
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl';
import type { Profile } from '@/contexts/user';
import Spinner from '../ui/spinner';

interface SettingsLayoutProps {
    children?: React.ReactNode;
    profile?: Profile | null;
    loading?: boolean;
}

const handleOnClickEditImage = () => {
    console.log('pick image clicked');
};

export default function SettingsLayout({ children, profile, loading }: SettingsLayoutProps) {
    const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '');
    const avatarSrc = signedAvatarUrl || profile?.avatar_url || AVATAR_PLACEHOLDER_SRC;
    const displayNameInitial = profile?.display_name?.charAt(0).toUpperCase() || 'A';

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="w-screen h-screen flex items-center justify-center">
                    <Spinner variant="gray" size="xl" speed={1750} />
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <div className="w-screen h-screen">
                <section>
                    <Container className="flex flex-col items-start  w-full gap-3">
                        <div className="relative">
                            <Avatar className="w-24 h-24 rounded-full">
                                <AvatarImage
                                    src={avatarSrc}
                                    alt={profile?.display_name || 'Avatar'}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xl">
                                    {displayNameInitial}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                onClick={handleOnClickEditImage}
                                className="absolute -bottom-2 -right-2 rounded-full"
                                aria-label="Upload image"
                            >
                                <Edit2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4 w-[400px]">
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Name"
                                    defaultValue={profile?.display_name || ''}
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    type="text"
                                    disabled
                                    id="username"
                                    placeholder="Username"
                                    defaultValue={profile?.username || ''}
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    disabled
                                    type="email"
                                    id="email"
                                    placeholder="wq-health@serious-game.com"
                                    defaultValue={profile?.email || ''}
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    type="url"
                                    id="linkedin"
                                    placeholder="linkedin.com/in/username"
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="description">About me</Label>
                                <Textarea
                                    id="description"
                                    placeholder="a text about you"
                                    className="w-full rounded-lg resize-none"
                                    defaultValue={profile?.description || ''}
                                />
                            </div>

                            <Button type="submit" variant="default">
                                Save Changes
                            </Button>
                        </div>
                    </Container>
                </section>

                {children}
            </div>
        </>
    );
}
