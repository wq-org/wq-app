import { useState, useEffect, useCallback } from 'react';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import SettingsLayout from '@/components/layout/SettingsLayout';
import { useUser } from '@/contexts/user';
import Spinner from '@/components/ui/spinner';
import { updateProfile } from '@/features/auth/api/authApi';
import { fetchAvatars } from '@/features/onboarding/api/onboardingApi';
import { validateLinkedInUrl } from '@/lib/validations';
import { toast } from 'sonner';
import type { AvatarOption } from '@/features/onboarding/types/onboarding.types';

export default function Settings() {
  const { profile, loading, getUserId, refreshProfile } = useUser();
  const [name, setName] = useState(profile?.display_name || '');
  const [linkedIn, setLinkedIn] = useState('');
  const [initialLinkedIn, setInitialLinkedIn] = useState('');
  const [aboutMe, setAboutMe] = useState(profile?.description || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || '');
  const [linkedInError, setLinkedInError] = useState<string | null>(null);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial values and avatars
  useEffect(() => {
    if (profile) {
      setName(profile.display_name || '');
      setAboutMe(profile.description || '');
      setSelectedAvatar(profile.avatar_url || '');
      
      // Use linkedin_url from profile (now included in Profile type)
      const linkedInValue = profile.linkedin_url || '';
      setLinkedIn(linkedInValue);
      setInitialLinkedIn(linkedInValue);
    }
  }, [profile]);

  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const avatars = await fetchAvatars();
        setAvatarOptions(avatars);
      } catch (error) {
        console.error('Error loading avatars:', error);
        toast.error('Failed to load avatars');
      }
    };

    loadAvatars();
  }, []);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!profile) return false;

    const nameChanged = name !== (profile.display_name || '');
    const linkedInChanged = linkedIn !== initialLinkedIn;
    const aboutMeChanged = aboutMe !== (profile.description || '');
    const avatarChanged = selectedAvatar !== (profile.avatar_url || '');

    return nameChanged || linkedInChanged || aboutMeChanged || avatarChanged;
  }, [profile, name, linkedIn, initialLinkedIn, aboutMe, selectedAvatar]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleLinkedInChange = useCallback((value: string) => {
    setLinkedIn(value);
    if (value.trim() && !validateLinkedInUrl(value)) {
      setLinkedInError('Please enter a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)');
    } else {
      setLinkedInError(null);
    }
  }, []);

  const handleAboutMeChange = useCallback((value: string) => {
    setAboutMe(value);
  }, []);

  const handleAvatarSelect = useCallback((avatarPath: string) => {
    setSelectedAvatar(avatarPath);
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile || !hasChanges()) {
      return;
    }

    if (linkedInError) {
      toast.error('Please fix the LinkedIn URL before saving');
      return;
    }

    setIsSaving(true);

    try {
      const userId = getUserId();
      if (!userId) {
        toast.error('User ID not found');
        setIsSaving(false);
        return;
      }

      const updatePayload: {
        display_name?: string;
        description?: string;
        avatar_url?: string;
        linkedin_url?: string;
      } = {};

      if (name !== (profile.display_name || '')) {
        updatePayload.display_name = name;
      }

      if (aboutMe !== (profile.description || '')) {
        updatePayload.description = aboutMe;
      }

      if (selectedAvatar !== (profile.avatar_url || '')) {
        updatePayload.avatar_url = selectedAvatar;
      }

      if (linkedIn !== initialLinkedIn) {
        if (linkedIn.trim() && validateLinkedInUrl(linkedIn)) {
          updatePayload.linkedin_url = linkedIn.trim();
        } else if (linkedIn.trim() === '') {
          // Allow clearing the LinkedIn URL by setting to empty string
          updatePayload.linkedin_url = '';
        }
      }

      await updateProfile(userId, updatePayload);
      await refreshProfile();
      
      // Update initial values after successful save
      setInitialLinkedIn(linkedIn);

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [profile, name, linkedIn, aboutMe, selectedAvatar, hasChanges, linkedInError, getUserId, refreshProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner variant="gray" size="xl" speed={1750} />
      </div>
    );
  }

  return (
    <>
      <SettingsLayout
        profile={profile}
        loading={loading}
        onNameChange={handleNameChange}
        onLinkedInChange={handleLinkedInChange}
        onAboutMeChange={handleAboutMeChange}
        onAvatarSelect={handleAvatarSelect}
        onSave={handleSave}
        hasChanges={hasChanges() && !isSaving}
        linkedInError={linkedInError}
        avatarOptions={avatarOptions}
        linkedInValue={linkedIn}
      />

      <CommandPalette role="teacher" />
    </>
  );
}
