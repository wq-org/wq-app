import Container from '@/components/common/Container';
import PageWrapper from '@/components/common/PageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface InstitutionProps {
    imageUrl?: string;
    name: string;
    description: string;
    children?: React.ReactNode;
}

export default function Institution({ children }: InstitutionProps) {
    return (
        <PageWrapper className="flex flex-col gap-8 items-start w-fit">
            <div className="flex flex-col gap-4 items-start">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={'#'} />
                    <AvatarFallback>{'WQ'}</AvatarFallback>
                </Avatar>
                <div className="text-6xl w-fit">
                    <span className="pr-2">Better tools smooth</span>
                    <span className="text-gray-300">Be workflow</span>
                    <span className="px-2">
                        including same great deal, annually.
                    </span>
                </div>
                <Badge variant="secondary" className="flex py-2 px-3">
                    <MapPin className=" h-4 w-4" />
                    <p>Musterstraße 10 12345 Musterstadt </p>
                </Badge>
            </div>

            <Button variant="default" className="gap-2 w-fit">
                Follow
            </Button>

            <section>{children || 'students | teachers '}</section>
        </PageWrapper>
    );
}
