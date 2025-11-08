import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { upsertProfile } from '@/features/auth/api/authApi';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import SuccessPage from './SuccessPage';

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
        id: string;
        name: string;
        description?: string | null;
        email?: string | null;
        website?: string | null;
    }>;
}

export default function StepFinish({ onBack, onFinish, accountData, institutions }: StepFinishProps) {
    const { session, pendingRole, refreshProfile } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Generate signed URL for displaying avatar (accountData.avatar.src is just the path)
    const { url: signedAvatarUrl } = useAvatarUrl(accountData.avatar.src);

    const handleFinish = async () => {
        if (!session?.user) {
            console.error('No authenticated user found');
            return;
        }

        setIsSubmitting(true);

        if (!pendingRole) {
            setIsSubmitting(false);
            // Show error or prevent submission if role is not selected
            console.error('Role must be selected before finishing onboarding.');
                return;
        }

        await refreshProfile();

        try {
            // Upsert profile with all onboarding data
            await upsertProfile(session.user.id, {
                email: session.user.email,
                description: accountData.description,
                display_name: accountData.displayName,
                avatar_url: accountData.avatar.src,
                role: pendingRole,
                is_onboarded: true,
            });

            // Link selected institutions to user
            if (institutions.length > 0) {
                const rows = institutions.map((inst) => ({
                    user_id: session.user.id,
                    institution_id: inst.id,
                }));

                // Use upsert to avoid duplicate key errors
                const { error: linkErr } = await supabase
                    .from('user_institutions')
                    .upsert(rows, { 
                        onConflict: 'user_id,institution_id',
                        ignoreDuplicates: false  // Update joined_at if already exists
                    });

                if (linkErr) {
                    console.error('Error linking institutions:', linkErr);
                    // Don't fail onboarding if institution linking fails
                }
            }

            // Show success dialog which will trigger confetti
            setShowSuccess(true);

            // Call onFinish callback after dialog closes
            setTimeout(() => {
                onFinish();
            }, 7000);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            setIsSubmitting(false);
            // TODO: Show error to user
        }
    };

    return (
        <>
            <SuccessPage
                isOpen={showSuccess}
                title="Welcome to WQ Health! 🎉"
                description="Your account has been set up successfully. You are now ready to start your journey with us."
                onClickHandler={onFinish}
            />

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
                        <Avatar className="w-20 h-20">
                            <AvatarImage
                                src={signedAvatarUrl || accountData.avatar.src}
                                alt={accountData.avatar.name}
                                className="object-cover"
                            />
                            <AvatarFallback>
                                {accountData.avatar.name.charAt(0)}
                            </AvatarFallback>
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Finish Setup 🎉'}
                </Button>
            </div>
        </div>
        </>
    );
}

