import Navigation from './Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Linkedin, Mail, Shapes, Users2 } from 'lucide-react';
import { Button } from '../ui/button';
import Container from '../common/Container';

const DashboardLayout = () => {
    return (
        <div>
            <Navigation />
            <div className="flex flex-col gap-8">
                <Container className="flex flex-col gap-4">
                    <div className="flex flex-col gap-5 max-w-[600px]">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className="text-5xl">Willfryd_</p>
                        <p className="text-sm text-muted-foreground">
                            Analyze this woman room through the lens of feminine
                            psychology and archetypal symbolism. What do the
                            colors, textures, organization, lighting, and
                            personal items reveal about her inner world, a
                            (connection, validation, novelty, or safety).
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Badge variant="secondary">Reutlingen University</Badge>
                        <Badge variant="secondary">1.200 Contacts</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="default" className="gap-2">
                            Follow
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Mail className="text-gray-400" />
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Linkedin className="text-gray-400" />
                        </Button>
                    </div>
                </Container>
                <section className="rounded-2xl px-6 h-full">
                    <section className="min-h-[500px] pt-8 rounded-2xl bg-gray-100">
                        <Container>
                            <div className="flex gap-12">
                                <span className="text-2xl text-black/40 flex gap-2 items-center pb-2">
                                    <Shapes />
                                    <p>Modules</p>
                                </span>
                                <span className="text-2xl text-black/40 flex gap-2 items-center pb-2">
                                    <HardDrive />
                                    <p>Database</p>
                                </span>
                                <span className="text-2xl text-black/40 flex gap-2 items-center pb-2">
                                    <Users2 />
                                    <p>Students</p>
                                </span>
                            </div>

                            <section className="mt-8">
                                <p>view list section</p>
                            </section>
                        </Container>
                    </section>
                </section>
            </div>
        </div>
    );
};

export default DashboardLayout;
