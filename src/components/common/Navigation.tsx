import { Button } from '@/components/ui/button';
import { Bell, LogOut, ChevronRight } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface NavigationProps {
    currentPageName?: string;
    children?: React.ReactNode;
}
const Navigation = ({ currentPageName }: NavigationProps) => {
    return (
        <nav className="w-full flex justify-between py-4 px-12 gap-2">
            <div className="flex items-center gap-3">
                <ChevronRight className=" text-gray-400" />
                <h1 className="text-2xl font-light text-gray-400">
                    {currentPageName || 'Page Name'}
                </h1>
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-12 h-12 [&_svg]:size-6"
                        >
                            <Bell className="size-6 text-gray-400" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <p className="text-lg">Notification</p>
                        <section>
                            <p>Test notification content</p>
                        </section>
                    </PopoverContent>
                </Popover>
                <Button
                    size="icon"
                    variant="ghost"
                    className="w-12 h-12 [&_svg]:size-6"
                >
                    <LogOut className="size-6 text-gray-400" />
                </Button>
            </div>
        </nav>
    );
};

export default Navigation;
