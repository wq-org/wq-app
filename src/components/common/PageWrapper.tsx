import Navigation from '@/components/layout/Navigation';
import Container from './Container';
import { cn } from '@/lib/utils';

export default function PageWrapper({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <>
            <div>
                <Navigation />
                <div className="flex flex-col gap-8"></div>
                <Container className={cn(className)}>{children}</Container>
            </div>
        </>
    );
}
