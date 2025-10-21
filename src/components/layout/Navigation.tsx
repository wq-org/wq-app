import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';

const Navigation = () => {
    return (
        <nav className="w-full flex justify-end p-4">
            <Button size="icon" variant="ghost" className="w-12 h-12">
            <Bell className="w-9 h-9" />
            </Button>
            <Button size="icon" variant="ghost" className="w-12 h-12">
            <LogOut className="w-9 h-9" />
            </Button>
        </nav>
    );
};

export default Navigation;
