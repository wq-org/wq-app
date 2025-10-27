import { Button } from '@/components/ui/button';
import { Bell, LogOut, ChevronLeft } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import Container from './Container';
import { useNavigate } from 'react-router';

interface NavigationProps {
    currentPageName?: string;
    children?: React.ReactNode;
}

const Navigation = ({ currentPageName }: NavigationProps) => {
    const navigate = useNavigate();
    const handleOnClickLogout = () => {
        navigate('/');
    };
    return (
        <Container className="w-full flex justify-between gap-2">
            <div className="flex gap-2 items-center">
                <ChevronLeft
                    className="cursor-pointer text-gray-400"
                    onClick={() => window.history.back()}
                />

                <h1 className="text-2xl font-light text-gray-400">
                    {currentPageName || 'Page Title'}
                </h1>
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-12 rounded-full h-12 [&_svg]:size-6"
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
                    onClick={handleOnClickLogout}
                    variant="ghost"
                    className="w-12 rounded-full h-12 [&_svg]:size-6"
                >
                    <LogOut className="size-6 text-gray-400" />
                </Button>
            </div>
        </Container>
    );
};

export default Navigation;
