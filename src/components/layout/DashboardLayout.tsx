import Navigation from '../common/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Linkedin, Mail, Presentation } from 'lucide-react';
import { Button } from '../ui/button';
import Container from '../common/Container';
import { useState } from 'react';
import { getDashboardTabs } from '@/lib/dashboard-config';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { QuoteOfTheDay } from '@/components/ui/quote';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
    imageUrl?: string;
    userName: string;
    username?: string;
    description: string;
    children?: React.ReactNode;
    role: string;
    email?: string;
    linkedInUrl?: string;
    handleFollowClick?: () => void;
    handleMailClick?: () => void;
    handleLinkedInClick?: () => void;
    onClickTab?: (tabId: string) => void;
}

export default function DashboardLayout({
    imageUrl,
    userName,
    username,
    description,
    children,
    role,
    email = 'john.doe@example.com',
    linkedInUrl = 'linkedin.com/in/johndoe',
    handleFollowClick,
    handleMailClick,
    handleLinkedInClick,
    onClickTab,
}: DashboardLayoutProps) {
    const [activeTab, setActiveTab] = useState('courses');
    const dashboardTabs = getDashboardTabs(role as 'teacher' | 'student');

    function handleTabClick(tabId: string) {
        setActiveTab(tabId);
        if (onClickTab) {
            onClickTab(tabId);
        }
    }

    // Sample quote - can be replaced with a hook later
    const sampleQuote = {
        text: "Education is the kindling of a flame, not the filling of a vessel.",
        author: "Socrates",
        source: "Anecdotal"
    };

    return (
        <div>
            <Navigation />
            <div className="flex flex-col gap-8 mb-8">
                <section className="rounded-2xl  h-full">
                    <Container className="flex flex-col gap-4">
                        <div className="flex gap-4 items-start">
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
                                <div className="flex flex-col gap-1">
                                    <p className="text-5xl">{userName}</p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        {username && (
                                            <>
                                                <span className="text-sm">@{username}</span>
                                                <Separator orientation="vertical" className="h-4" />
                                            </>
                                        )}
                                        <span className="text-sm">{description}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Quote of the Day - aligned to the right */}
                            <div className="flex-1 flex justify-end">
                                <QuoteOfTheDay
                                    quote={sampleQuote.text}
                                    author={sampleQuote.author}
                                    source={sampleQuote.source}
                                    className="max-w-md"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Badge variant="secondary">
                                Reutlingen University
                            </Badge>
                            <Badge variant="secondary">1.200 Contacts</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="gap-2"
                                        onClick={handleFollowClick}
                                    >
                                        Connect
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Connect with {userName}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={handleMailClick}
                                    >
                                        <Mail className="text-gray-400" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {email}
                                </TooltipContent>
                            </Tooltip>
                     

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={handleLinkedInClick}
                                    >
                                        <Linkedin className="text-gray-400" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {linkedInUrl}
                                </TooltipContent>
                            </Tooltip>

                            {role?.toLowerCase() === 'teacher' ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex items-center justify-center p-2" aria-label="Teacher">
                                            <Presentation className="text-gray-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Your Role is Teacher
                                    </TooltipContent>
                                </Tooltip>
                            ) : role?.toLowerCase() === 'student' ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="flex items-center justify-center p-2" aria-label="Student">
                                            <GraduationCap className="text-gray-400" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Your Role is Student
                                    </TooltipContent>
                                </Tooltip>
                            ) : null}
                        </div>
                    </Container>
                    <section className="pt-8 rounded-2xl bg-gray-100 min-h-[calc(95vh-400px)] pb-8">
                        <Container className="h-full">
                            <div className="flex flex-wrap justify-between items-center">
                                <div className="flex flex-wrap gap-12">
                                    {dashboardTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <span
                                                key={tab.id}
                                                onClick={() =>
                                                    handleTabClick(tab.id)
                                                }
                                                className={`text-xl border-b-2  flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
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
                            </div>

                            <Container className="flex  w-full px-0 flex-1">
                                {children}
                            </Container>
                        </Container>
                    </section>
                </section>
            </div>
        </div>
    );
}
