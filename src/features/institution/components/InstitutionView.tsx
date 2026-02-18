import { useState } from 'react'
import Spinner from '@/components/ui/spinner'
import { Container } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Presentation, Users2, Globe, Twitter, Facebook, Instagram } from 'lucide-react'
import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'
import EmptyTeachersView from './EmptyTeachersView'
import EmptyStudentView from '@/features/student/components/EmptyStudentView'
import { Text } from '@/components/ui/text'

const InstitutionView = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>('teachers')

  const avatarUrl = '#'
  const titleText = 'Better tools smooth'
  const lighterFirst = 'Be workflow'
  const lighterSecond = 'including same great deal, annually.'
  const street = 'Masterstroke 10 12345 Berlin'
  const availableLinks = [
    { key: 'website', label: 'Website', url: '#', icon: Globe },
    { key: 'twitter', label: 'Twitter', url: '#', icon: Twitter },
    { key: 'facebook', label: 'Facebook', url: '#', icon: Facebook },
    { key: 'instagram', label: 'Instagram', url: '#', icon: Instagram },
  ]
  const onFollowClick = () => {
    console.log('Follow clicked')
  }
  const loading = false

  const tabs: TabItem[] = [
    { id: 'teachers', icon: Presentation, title: 'Teachers' },
    { id: 'students', icon: Users2, title: 'Students' },
  ]

  //   const getInitials = (name: string | null, email: string | null) => {
  //     if (name) {
  //       return name
  //         .split(' ')
  //         .map((word) => word[0])
  //         .join('')
  //         .toUpperCase()
  //         .slice(0, 2)
  //     }
  //     if (email) {
  //       return email.charAt(0).toUpperCase()
  //     }
  //     return 'U'
  //   }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 mb-8 w-full">
      <section className="rounded-2xl h-full">
        <Container className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{'WQ'}</AvatarFallback>
            </Avatar>
            <div className="text-6xl w-fit">
              <Text
                as="span"
                variant="small"
                className="pr-2"
              >
                {titleText}
              </Text>
              <Text
                as="span"
                variant="small"
                className="text-gray-300"
              >
                {lighterFirst}
              </Text>
              <Text
                as="span"
                variant="small"
                className="px-2"
              >
                {lighterSecond}
              </Text>
            </div>
            <Badge
              variant="secondary"
              className="flex py-2   px-3"
            >
              <MapPin className=" h-4 w-4" />
              <Text
                as="p"
                variant="body"
              >
                {street}
              </Text>
            </Badge>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                variant="default"
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
              {children}
            </Container>
          </Container>
        </section>
      </section>
    </div>
  )
}

export default InstitutionView
