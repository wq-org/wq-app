import { Button } from '@/components/ui/button';
import { Bell, LogOut, ChevronLeft } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import NotificationPanel from '@/features/notification/components/NotificationPanel';

interface NavigationProps {
    currentPageName?: string;
    children?: React.ReactNode;
    className?: string;
}

const Navigation = ({ currentPageName, className }: NavigationProps) => {
    const navigate = useNavigate();
    const handleOnClickLogout = () => {
        navigate('/');
    };

    return (
        <div
            className={cn(
                'sticky top-0 z-40 w-full',
               

                className
            )}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Back button and Title */}
                    <div className="flex items-center gap-3 rounded-full border bg-card/50 backdrop-blur px-4 py-2 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.history.back()}
                            className="h-8 w-8 rounded-full hover:bg-accent"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </Button>
                        <div className="h-6 w-px bg-border" />
                        <h1 className="text-lg font-normal text-gray-700">
                            {currentPageName || 'Page Title'}
                        </h1>
                    </div>

                    {/* Right Section - Notification and Logout */}
                    <div className="flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur px-2 py-2 shadow-sm">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-full hover:bg-accent"
                                >
                                    <Bell className="h-5 w-5 text-gray-600" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-90 h-120 rounded-4xl backdrop-blur overflow-hidden mr-20 mt-4">
                              <NotificationPanel />
                            </PopoverContent>
                        </Popover>
                        <div className="h-6 w-px bg-border" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOnClickLogout}
                            className="h-10 w-10 rounded-full hover:bg-accent hover:text-red-600"
                        >
                            <LogOut className="h-5 w-5 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navigation;
