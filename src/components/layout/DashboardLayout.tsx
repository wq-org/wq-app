import Navigation from './Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Mail, MessageCircleIcon } from 'lucide-react';
import { Button } from '../ui/button';
import Container from '../common/Container';
import { useState } from 'react';
import { getDashboardTabs } from '@/lib/dashboard-config';

interface DashboardLayoutProps {
    imageUrl?: string;
    userName: string;
    description: string;
    children?: React.ReactNode;
    role: string;
}

export default function DashboardLayout({
    imageUrl,
    userName,
    description,
    children,
    role,
}: DashboardLayoutProps) {
    const [activeTab, setActiveTab] = useState('modules');
    const dashboardTabs = getDashboardTabs(role as 'teacher' | 'student');

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleFollowClick = () => {
        console.log('followed');
    };

    const handleMailClick = () => {
        console.log('mail clicked');
    };

    const handleLinkedInClick = () => {
        console.log('linkedin clicked');
    };

    return (
        <div>
            <Navigation />
            <div className="flex flex-col gap-8">
                <section className="rounded-2xl px-6 h-full">
                    <Container className="flex flex-col gap-4">
                        <div className="flex flex-col gap-5 max-w-[600px]">
                            <Avatar className="w-24 h-24">
                                <AvatarImage
                                    src={
                                        imageUrl ||
                                        'https://github.com/shadcn.png'
                                    }
                                />
                                <AvatarFallback>
                                    {userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-5xl">{userName}</p>
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Badge variant="secondary">
                                Reutlingen University
                            </Badge>
                            <Badge variant="secondary">1.200 Contacts</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="default"
                                className="gap-2"
                                onClick={handleFollowClick}
                            >
                                Follow
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={handleMailClick}
                            >
                                <Mail className="text-gray-400" />
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={handleLinkedInClick}
                            >
                                <Linkedin className="text-gray-400" />
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <MessageCircleIcon className="text-gray-400" />
                            </Button>
                        </div>
                    </Container>
                    <section className="pt-8 rounded-2xl bg-gray-100 min-h-[calc(95vh-400px)] pb-8">
                        <Container className="h-full">
                            <div className="flex flex-wrap gap-12">
                                {dashboardTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <span
                                            key={tab.id}
                                            onClick={() =>
                                                handleTabClick(tab.id)
                                            }
                                            className={`text-xl flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
                                                activeTab === tab.id
                                                    ? 'text-black border-b-2 border-black'
                                                    : 'text-black/40 hover:text-black/60'
                                            }`}
                                        >
                                            <Icon />
                                            <p>{tab.label}</p>
                                        </span>
                                    );
                                })}
                            </div>

                            <section className="mt-8 flex-1">
                                {children || 'content ' + activeTab}
                            </section>
                        </Container>
                    </section>
                </section>
            </div>
        </div>
    );
}
