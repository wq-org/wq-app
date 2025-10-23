import Container from '../common/Container';
import Navigation from '../common/Navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

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
            <Container className="w-screen h-screen">
                <section className="flex justify-start mb-8">
                    <Container className="flex flex-col justify-center w-full items-center gap-3">
                        <div className="relative">
                            <Avatar className="w-24 h-24 rounded-full">
                                <AvatarImage
                                    src="https://github.com/hngngn.png"
                                    alt="avatar"
                                />
                                <AvatarFallback className="text-xl">
                                    U
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
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Name"
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="email">Email</Label>

                                <Textarea
                                    placeholder="a text about you"
                                    className="w-full rounded-lg resize-none "
                                />
                            </div>

                            <Button type="submit" variant="outline">
                                Save Changes
                            </Button>
                        </div>
                    </Container>
                </section>

                {children}
            </Container>
        </>
    );
}
