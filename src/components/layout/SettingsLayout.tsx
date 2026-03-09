import { Check } from 'lucide-react'
import { Container } from '@/components/shared/container'
import { AppNavigation } from '@/components/shared/AppNavigation'
import { PageTitle } from './PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import type { Profile } from '@/contexts/user'
import Spinner from '../ui/spinner'
import { AvatarDrawer } from './AvatarDrawer'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import type { AvatarOption } from '@/features/onboarding'
import { useState, useEffect } from 'react'

type SettingsLayoutProps = {
  children?: React.ReactNode
  profile?: Profile | null
  loading?: boolean
  onNameChange?: (value: string) => void
  onLinkedInChange?: (value: string) => void
  onAboutMeChange?: (value: string) => void
  onSave?: () => void
  hasChanges?: boolean
  linkedInError?: string | null
  avatarOptions?: AvatarOption[]
  onAvatarSelect?: (avatarPath: string) => void
  selectedAvatarPath?: string
  linkedInValue?: string
}

export function SettingsLayout({
  children,
  profile,
  loading,
  onNameChange,
  onLinkedInChange,
  onAboutMeChange,
  onSave,
  hasChanges = false,
  linkedInError,
  avatarOptions = [],
  onAvatarSelect,
  selectedAvatarPath,
  linkedInValue = '',
}: SettingsLayoutProps) {
  const { t } = useTranslation('settings')
  const [name, setName] = useState(profile?.display_name || '')
  const [linkedIn, setLinkedIn] = useState(linkedInValue)
  const [aboutMe, setAboutMe] = useState(profile?.description || '')
  const displayNameInitial = profile?.display_name?.charAt(0).toUpperCase() || 'A'

  // Update local state when profile changes
  useEffect(() => {
    setName(profile?.display_name || '')
    setLinkedIn(linkedInValue)
    setAboutMe(profile?.description || '')
  }, [profile, linkedInValue])

  const handleNameChange = (value: string) => {
    setName(value)
    onNameChange?.(value)
  }

  const handleLinkedInChange = (value: string) => {
    setLinkedIn(value)
    onLinkedInChange?.(value)
  }

  const handleAboutMeChange = (value: string) => {
    setAboutMe(value)
    onAboutMeChange?.(value)
  }

  const handleAvatarSelect = (avatarPath: string) => {
    onAvatarSelect?.(avatarPath)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasChanges && onSave) {
      onSave()
    }
  }

  if (loading) {
    return (
      <>
        <AppNavigation>
          <PageTitle />
        </AppNavigation>
        <div className="w-screen h-screen flex items-center justify-center">
          <Spinner
            variant="gray"
            size="xl"
            speed={1750}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <AppNavigation>
        <PageTitle />
      </AppNavigation>
      <div className="w-screen h-screen">
        <section className="animate-in fade-in-0 slide-in-from-bottom-4">
          <Container className="flex flex-col items-start w-full gap-3">
            <div className="relative animate-in fade-in-0 zoom-in-95">
              <AvatarDrawer
                avatarPath={selectedAvatarPath || profile?.avatar_url || ''}
                selectedAvatarPath={selectedAvatarPath || profile?.avatar_url || ''}
                displayNameInitial={displayNameInitial}
                displayName={profile?.display_name}
                avatarOptions={avatarOptions}
                onAvatarSelect={handleAvatarSelect}
              />
            </div>
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-4 w-[400px] animate-in fade-in-0 slide-in-from-bottom-3"
            >
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="name">{t('profile.fields.name.label')}</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder={t('profile.fields.name.placeholder')}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="username">{t('profile.fields.username.label')}</Label>
                <Input
                  type="text"
                  disabled
                  id="username"
                  placeholder={t('profile.fields.username.placeholder')}
                  value={profile?.username || ''}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="email">{t('profile.fields.email.label')}</Label>
                <Input
                  disabled
                  type="email"
                  id="email"
                  placeholder={t('profile.fields.email.placeholder')}
                  value={profile?.email || ''}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="linkedin">{t('profile.fields.linkedin.label')}</Label>
                <Input
                  type="url"
                  id="linkedin"
                  placeholder={t('profile.fields.linkedin.placeholder')}
                  value={linkedIn}
                  onChange={(e) => handleLinkedInChange(e.target.value)}
                  className={linkedInError ? 'border-red-500' : ''}
                />
                {linkedInError && (
                  <Text
                    as="p"
                    variant="body"
                    className="text-sm text-red-500"
                  >
                    {linkedInError}
                  </Text>
                )}
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="description">{t('profile.fields.aboutMe.label')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('profile.fields.aboutMe.placeholder')}
                  className="w-full rounded-lg resize-none"
                  value={aboutMe}
                  onChange={(e) => handleAboutMeChange(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="darkblue"
                disabled={!hasChanges}
              >
                <Check className="h-4 w-4" />
                {t('profile.actions.save')}
              </Button>
            </form>
          </Container>
        </section>

        {children}
      </div>
    </>
  )
}
