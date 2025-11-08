import Container from '../common/Container';
import Navigation from '../common/Navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const AVATAR_PLACEHOLDER_SRC = "https://github.com/shadcn.png";


interface SettingsLayoutProps {
    children?: React.ReactNode;
}

const handleOnClickEditImage = () => {
    console.log('pick image clicked');
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <>
            <Navigation />
            <div className="w-screen h-screen">
                <section>
                    <Container className="flex flex-col items-start  w-full gap-3">
                        <div className="relative">
                            <Avatar className="w-24 h-24 rounded-full">
                                <AvatarImage
                                    src={AVATAR_PLACEHOLDER_SRC}
                                    alt="avatar"
                                />
                                <AvatarFallback className="text-xl">
                                    A
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
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="name">Username</Label>
                                <Input
                                    type="text"
                                    id="username"
                                    placeholder="Username"
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    disabled
                                    type="link"
                                    id="name"
                                    placeholder="wq-health@serious-game.com"
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="email">LinkedIn</Label>
                                <Input
                                    type="link"
                                    id="name"
                                    placeholder="linkedin.com/in/username"
                                />
                            </div>
                            <div className="w-full flex flex-col  gap-3">
                                <Label htmlFor="email">About me</Label>

                                <Textarea
                                    placeholder="a text about you"
                                    className="w-full rounded-lg resize-none "
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
