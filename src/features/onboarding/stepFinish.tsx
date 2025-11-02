import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';

interface StepFinishProps {
    onBack: () => void;
    onFinish: () => void;
    accountData: {
        username: string;
        displayName: string;
        description: string;
        avatar: {
            name: string;
            src: string;
            emoji: string;
        };
    };
    institutions: Array<{
        id: number;
        name: string;
        description: string;
        location: string;
    }>;
}

export default function StepFinish({ onBack, onFinish, accountData, institutions }: StepFinishProps) {
    const handleFinish = () => {
        // Trigger confetti animation
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Small delay to let confetti animation play before navigating
        setTimeout(() => {
            onFinish();
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl font-light mb-2">All Set! 🎉</h2>
                <p className="text-muted-foreground text-sm">
                    Review your information before finishing
                </p>
            </div>

            {/* Summary Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 border-2 border-primary/20">
                            <AvatarImage src={accountData.avatar.src} alt={accountData.avatar.name} />
                            <AvatarFallback>{accountData.avatar.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl">{accountData.displayName}</CardTitle>
                                <span className="text-xl">{accountData.avatar.emoji}</span>
                            </div>
                            <p className="text-muted-foreground">@{accountData.username}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                    {/* Description */}
                    <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground text-sm">{accountData.description}</p>
                    </div>

                    <Separator />

                    {/* Institutions */}
                    <div>
                        <h3 className="font-semibold mb-3">
                            Following Institutions ({institutions.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {institutions.map((institution) => (
                                <Badge key={institution.id} variant="secondary" className="text-sm px-3 py-1">
                                    {institution.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Account Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Username</p>
                            <p className="font-medium">@{accountData.username}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Display Name</p>
                            <p className="font-medium">{accountData.displayName}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground mb-1">Avatar</p>
                            <p className="font-medium">{accountData.avatar.name} {accountData.avatar.emoji}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 py-11">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button 
                    type="button" 
                    variant="default" 
                    onClick={handleFinish} 
                    className="gap-2"
                >
                    Finish Setup 🎉
                </Button>
            </div>
        </div>
    );
}

