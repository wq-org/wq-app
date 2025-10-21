import Container from '@/components/common/Container';
import PageWrapper from '@/components/common/PageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface InstitutionProps {
    imageUrl?: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    titleText?: string;
    lighterFirst?: string;
    lighterSecond?: string;
    street?: string;
    onFollowClick?: () => void;
    children?: React.ReactNode;
}

export default function Institution({
    avatarUrl = '#',
    titleText = 'Better tools smooth',
    lighterFirst = 'Be workflow',
    lighterSecond = 'including same great deal, annually.',
    street = 'Musterstraße 10 12345 Musterstadt',
    onFollowClick,
    children,
}: InstitutionProps) {
    return (
        <PageWrapper className="flex flex-col gap-8 items-start w-fit">
            <div className="flex flex-col gap-4 items-start ">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{'WQ'}</AvatarFallback>
                </Avatar>
                <div className="text-6xl w-fit">
                    <span className="pr-2">{titleText}</span>
                    <span className="text-gray-300">{lighterFirst}</span>
                    <span className="px-2">{lighterSecond}</span>
                </div>
                <Badge variant="secondary" className="flex py-2 px-3">
                    <MapPin className=" h-4 w-4" />
                    <p>{street}</p>
                </Badge>
            </div>

            <Button
                variant="default"
                className="gap-2 w-fit"
                onClick={onFollowClick}
            >
                Follow
            </Button>

            <Container className="flex flex-col gap-4 w-full border min-h-[400px] rounded-3xl">
                <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl text-center">Teachers</h3>
                        <div>
                            {/* Teachers content can be passed as children or props */}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl text-center">Students</h3>
                        <div>
                            {/* Students content can be passed as children or props */}
                        </div>
                    </div>
                </div>
                {children}
            </Container>
        </PageWrapper>
    );
}
