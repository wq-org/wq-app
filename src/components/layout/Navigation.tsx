import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';

const Navigation = () => {
    return (
        <nav className="w-full flex justify-end p-4">
            <Button size="icon" variant="ghost">
                <LogOut />
            </Button>
            <Button size="icon" variant="ghost">
                <Bell />
            </Button>
        </nav>
    );
};

export default Navigation;
