import { useState } from 'react'
import { Container, SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Presentation, Users2, Globe, Twitter, Facebook, Instagram } from 'lucide-react'
import { EmptyTeachersView } from '@/features/institution'
import { EmptyStudentView } from '@/features/student'
import { Text } from '@/components/ui/text'

interface InstitutionAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

interface Institution {
  id: string
  name: string
  description: string | null
  email: string | null
  address: InstitutionAddress | string | null
  website: string | null
  twitter_url: string | null
  facebook_url: string | null
  instagram_url: string | null
}

interface ProfileInstitutionViewProps {
  institutionId: string
}

export function ProfileInstitutionView({ institutionId }: ProfileInstitutionViewProps) {
  // Hardcoded institution data for now
  const institution: Institution = {
    id: institutionId,
    name: 'Reutlingen University',
    description: 'A leading educational institution focused on innovation and excellence.',
    email: 'info@reutlingen-university.de',
    address: {
      street: 'Masterstroke 10',
      city: 'Reutlingen',
      state: 'Baden-Württemberg',
      zip: '72762',
      country: 'Germany',
    },
    website: 'https://www.reutlingen-university.de',
    twitter_url: 'https://twitter.com/reutlingen_uni',
    facebook_url: 'https://facebook.com/reutlingenuniversity',
    instagram_url: 'https://instagram.com/reutlingenuniversity',
  }
  const [activeTab, setActiveTab] = useState<string>('teachers')

  // Format address for display
  const formatAddress = (address: InstitutionAddress | string | null): string => {
    if (!address) return 'No address'
    if (typeof address === 'string') return address
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip,
      address.country,
    ].filter(Boolean)
    return parts.join(', ') || 'No address'
  }

  const titleText = institution.name || 'Institution'
  const lighterFirst = ''
  const lighterSecond = ''
  const street = formatAddress(institution.address)
  const availableLinks = [
    institution.website && {
      key: 'website',
      label: 'Website',
      url: institution.website,
      icon: Globe,
    },
    institution.twitter_url && {
      key: 'twitter',
      label: 'Twitter',
      url: institution.twitter_url,
      icon: Twitter,
    },
    institution.facebook_url && {
      key: 'facebook',
      label: 'Facebook',
      url: institution.facebook_url,
      icon: Facebook,
    },
    institution.instagram_url && {
      key: 'instagram',
      label: 'Instagram',
      url: institution.instagram_url,
      icon: Instagram,
    },
  ].filter(Boolean) as Array<{ key: string; label: string; url: string; icon: typeof Globe }>

  const onFollowClick = () => {
    console.log('Follow clicked')
  }

  const tabs: TabItem[] = [
    { id: 'teachers', icon: Presentation, title: 'Teachers' },
    { id: 'students', icon: Users2, title: 'Students' },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col gap-8 mb-8 w-full">
      <section className="rounded-2xl h-full">
        <Container className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src="#" />
              <AvatarFallback>{getInitials(titleText)}</AvatarFallback>
            </Avatar>
            <div className="text-6xl w-fit">
              <Text
                as="span"
                variant="small"
                className="pr-2"
              >
                {titleText}
              </Text>
              {lighterFirst && (
                <Text
                  as="span"
                  variant="small"
                  className="text-gray-300"
                >
                  {lighterFirst}
                </Text>
              )}
              {lighterSecond && (
                <Text
                  as="span"
                  variant="small"
                  className="px-2"
                >
                  {lighterSecond}
                </Text>
              )}
            </div>
            <Badge
              variant="secondary"
              className="flex py-2 px-3"
            >
              <MapPin className="h-4 w-4" />
              <Text
                as="p"
                variant="body"
              >
                {street}
              </Text>
            </Badge>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="darkblue"
                className="gap-2 w-fit"
                onClick={onFollowClick}
              >
                Follow
              </Button>
              {availableLinks.length > 0 &&
                availableLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Button
                      key={link.key}
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-10 w-10"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  )
                })}
            </div>
          </div>
        </Container>
        <section className="pt-8 rounded-2xl bg-gray-100 min-h-[calc(95vh-400px)] pb-8">
          <Container className="h-full">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-wrap gap-12">
                <SelectTabs
                  tabs={tabs}
                  activeTabId={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </div>

            <Container className="flex w-full px-0 flex-1">
              <div className="flex flex-col gap-4">
                {activeTab === 'teachers' && <EmptyTeachersView />}
                {activeTab === 'students' && <EmptyStudentView />}
              </div>
            </Container>
          </Container>
        </section>
      </section>
    </div>
  )
}
