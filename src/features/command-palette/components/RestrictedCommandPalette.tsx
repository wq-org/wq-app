import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Fallback component displayed when user role is invalid or missing
 * Prevents rendering a broken CommandPalette and guides user to resolve the issue
 */
export default function RestrictedCommandPalette() {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="fixed inset-x-0 bottom-8 z-50 mx-auto flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border bg-background/80 backdrop-blur shadow-xl px-6 py-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        No features available due to role error. Please consider logging in.
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoginRedirect}
                        className="h-8"
                    >
                        Log In
                    </Button>
                </div>
            </div>
        </div>
    );
}

