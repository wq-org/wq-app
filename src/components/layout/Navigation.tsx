import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const Navigation = () => {
    return (
        <nav className="w-full flex justify-end py-4 px-12 gap-2">
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
        </nav>
    );
};

export default Navigation;
