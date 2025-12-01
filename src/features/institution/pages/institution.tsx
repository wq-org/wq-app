import { Container, PageWrapper } from '@/components/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

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
  // Helper function to clean URLs (remove angle brackets if present)
  const cleanUrl = (url?: string): string | undefined => {
    if (!url) return undefined
    return url.replace(/^<|>$/g, '')
  }

  // Get all available links
  const availableLinks = [
    { key: 'website', label: 'Website', url: cleanUrl(links?.website) },
    { key: 'twitter', label: 'Twitter', url: cleanUrl(links?.twitter) },
    { key: 'facebook', label: 'Facebook', url: cleanUrl(links?.facebook) },
    { key: 'instagram', label: 'Instagram', url: cleanUrl(links?.instagram) },
  ].filter((link) => link.url)
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
        <Badge
          variant="secondary"
          className="flex py-2 px-3"
        >
          <MapPin className=" h-4 w-4" />
          <p>{street}</p>
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
        Follow
      </Button>

      <Container className="flex flex-col gap-4 w-full border min-h-[400px] rounded-3xl">
        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-center">Teachers</h3>
            <div>{/* Teachers content can be passed as children or props */}</div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-center">Students</h3>
            <div>{/* Students content can be passed as children or props */}</div>
          </div>
        </div>
        {children}
      </Container>
    </PageWrapper>
  )
}
