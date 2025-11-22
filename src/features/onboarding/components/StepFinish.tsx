import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { upsertProfile } from '@/features/auth/api/authApi';
import { useUser } from '@/contexts/user';
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl';
import SuccessPage from './SuccessPage';
import { linkUserInstitutions } from '../api/onboardingApi';
import type { StepFinishProps } from '../types/onboarding.types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {Button} from '@/components/ui/button';

export default function StepFinish({ onBack, onFinish, accountData, institutions }: StepFinishProps) {
  const { session, pendingRole, refreshProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation('features.onboarding');

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
      // Show error or prevent submission if role is not selected using the sonner toast
      toast.error(t('finish.errors.missingRole'));
      return;
    }

    try {
      // Upsert profile with all onboarding data
      await upsertProfile(session.user.id, {
        email: session.user.email,
        username: accountData.username,
        description: accountData.description,
        display_name: accountData.displayName,
        avatar_url: accountData.avatar.src,
        role: pendingRole,
        is_onboarded: true,
      });

      // Link selected institutions to user
      if (institutions.length > 0) {
        const institutionIds = institutions.map((inst) => inst.id);
        try {
          await linkUserInstitutions(session.user.id, institutionIds);
        } catch (linkErr) {
          console.error('Error linking institutions:', linkErr);
          // Don't fail onboarding if institution linking fails
        }
      }

      // Refresh profile to get the updated is_onboarded status
      await refreshProfile();
      
      // Small delay to ensure context state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Show success dialog which will trigger confetti
      setShowSuccess(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
      toast.error(t('finish.errors.completionTitle'), {
        description: t('finish.errors.completionDescription'),
      });
    }
  };

  return (
    <>
      <SuccessPage
        isOpen={showSuccess}
        title={t('finish.successDialog.title')}
        description={t('finish.successDialog.description')}
        onClickHandler={onFinish}
      />

      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-light mb-2">
            {t('finish.header.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('finish.header.subtitle')}
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
              <h3 className="font-semibold mb-2">
                {t('finish.about.title')}
              </h3>
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
