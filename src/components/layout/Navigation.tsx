import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const Navigation = () => {
    return (
        <nav className="w-full flex  justify-end py-4 px-12 ">
            <Popover>
                <PopoverTrigger>
                    <Button size="icon" variant="ghost" className="w-12 h-12">
                        <Bell className="w-9 h-9" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <p className="text-lg">Notification</p>
                    <section>
                        <p>Test notification content</p>
                    </section>
                </PopoverContent>
            </Popover>

            <Button size="icon" variant="ghost" className="w-12 h-12">
                <LogOut className="w-9 h-9" />
            </Button>
        </nav>
    );
};

export default Navigation;
