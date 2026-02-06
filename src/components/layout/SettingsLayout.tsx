import { useState, useEffect } from 'react'
import { Container, Navigation } from '@/components/shared'
import { PageTitle } from './PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import type { Profile } from '@/contexts/user'
import Spinner from '../ui/spinner'
import AvatarDrawer from './AvatarDrawer'
import { Text } from '@/components/ui/text'

interface SettingsLayoutProps {
  children?: React.ReactNode
  profile?: Profile | null
  loading?: boolean
  onNameChange?: (value: string) => void
  onLinkedInChange?: (value: string) => void
  onAboutMeChange?: (value: string) => void
  onSave?: () => void
  hasChanges?: boolean
  linkedInError?: string | null
  avatarOptions?: Array<{ name: string; src: string; emoji: string }>
  onAvatarSelect?: (avatarPath: string) => void
  linkedInValue?: string
}

export default function SettingsLayout({
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
  linkedInValue = '',
}: SettingsLayoutProps) {
  const [name, setName] = useState(profile?.display_name || '')
  const [linkedIn, setLinkedIn] = useState(linkedInValue)
  const [aboutMe, setAboutMe] = useState(profile?.description || '')

  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const avatarSrc = signedAvatarUrl || profile?.avatar_url || AVATAR_PLACEHOLDER_SRC
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
        <Navigation>
          <PageTitle />
        </Navigation>
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
      <Navigation>
        <PageTitle />
      </Navigation>
      <div className="w-screen h-screen">
        <section>
          <Container className="flex flex-col items-start w-full gap-3">
            <div className="relative">
              <AvatarDrawer
                avatarSrc={avatarSrc}
                displayNameInitial={displayNameInitial}
                displayName={profile?.display_name}
                avatarOptions={avatarOptions}
                onAvatarSelect={handleAvatarSelect}
              />
            </div>
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-4 w-[400px]"
            >
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  disabled
                  id="username"
                  placeholder="Username"
                  value={profile?.username || ''}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  disabled
                  type="email"
                  id="email"
                  placeholder="wq-health@serious-game.com"
                  value={profile?.email || ''}
                />
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  type="url"
                  id="linkedin"
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedIn}
                  onChange={(e) => handleLinkedInChange(e.target.value)}
                  className={linkedInError ? 'border-red-500' : ''}
                />
                {linkedInError && <Text as="p" variant="body" className="text-sm text-red-500">{linkedInError}</Text>}
              </div>
              <div className="w-full flex flex-col gap-3">
                <Label htmlFor="description">About me</Label>
                <Textarea
                  id="description"
                  placeholder="a text about you"
                  className="w-full rounded-lg resize-none"
                  value={aboutMe}
                  onChange={(e) => handleAboutMeChange(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={!hasChanges}
              >
                Save Changes
              </Button>
            </form>
          </Container>
        </section>

        {children}
      </div>
    </>
  )
}