import { Container, PageWrapper } from '@/components/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface InstitutionLinks {
  website?: string
  twitter?: string
  facebook?: string
  instagram?: string
}

interface InstitutionProps {
  imageUrl?: string
  name?: string
  description?: string
  avatarUrl?: string
  titleText?: string
  lighterFirst?: string
  lighterSecond?: string
  street?: string
  links?: InstitutionLinks
  onFollowClick?: () => void
  children?: React.ReactNode
}

export default function Institution({
  avatarUrl = '#',
  titleText = 'Better tools smooth',
  lighterFirst = 'Be workflow',
  lighterSecond = 'including same great deal, annually.',
  street = 'Masterstroke 10 12345 Berlin',
  links,
  onFollowClick,
  children,
}: InstitutionProps) {
  const { t } = useTranslation('features.institution')
  // Helper function to clean URLs (remove angle brackets if present)
  const cleanUrl = (url?: string): string | undefined => {
    if (!url) return undefined
    return url.replace(/^<|>$/g, '')
  }

  // Get all available links
  const availableLinks = [
    { key: 'website', label: t('links.website'), url: cleanUrl(links?.website) },
    { key: 'twitter', label: t('links.twitter'), url: cleanUrl(links?.twitter) },
    { key: 'facebook', label: t('links.facebook'), url: cleanUrl(links?.facebook) },
    { key: 'instagram', label: t('links.instagram'), url: cleanUrl(links?.instagram) },
  ].filter((link) => link.url)
  return (
    <PageWrapper className="flex flex-col gap-8 items-start w-fit">
      <div className="flex flex-col gap-4 items-start ">
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
          className="flex py-2 px-3"
        >
          <MapPin className=" h-4 w-4" />
          <Text
            as="p"
            variant="body"
          >
            {street}
          </Text>
        </Badge>

        {availableLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {availableLinks.map((link) => (
              <Button
                key={link.key}
                variant="link"
                asChild
                className="p-0 h-auto text-sm"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="default"
        className="gap-2 w-fit"
        onClick={onFollowClick}
      >
        {t('actions.follow')}
      </Button>

      <Container className="flex flex-col gap-4 w-full border min-h-[400px] rounded-3xl">
        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-2">
            <Text
              as="h3"
              variant="h3"
              className="text-xl text-center"
            >
              {t('tabs.teachers')}
            </Text>
            <div>{/* Teachers content can be passed as children or props */}</div>
          </div>
          <div className="flex flex-col gap-2">
            <Text
              as="h3"
              variant="h3"
              className="text-xl text-center"
            >
              {t('tabs.students')}
            </Text>
            <div>{/* Students content can be passed as children or props */}</div>
          </div>
        </div>
        {children}
      </Container>
    </PageWrapper>
  )
}
