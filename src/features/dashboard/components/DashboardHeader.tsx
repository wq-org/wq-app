import { useState } from 'react'
import { QuoteOfTheDay } from '@/components/ui/QuoteOfTheDay'
import { Text } from '@/components/ui/text'
import { BlurredImage } from '@/components/ui/blurred-image'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

type DashboardHeaderProps = {
  imageUrl?: string
  userName: string
  username?: string
  description: string
}

export function DashboardHeader({
  imageUrl,
  userName,
  username,
  description,
}: DashboardHeaderProps) {
  const [useFaviconFallback, setUseFaviconFallback] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const avatarSrc = useFaviconFallback || !imageUrl ? DEFAULT_INSTITUTION_IMAGE : imageUrl

  return (
    <section className="container flex flex-col gap-4 py-8">
      <div className="flex gap-4 items-start">
        <div className="flex flex-col gap-5 max-w-[600px]">
          <div className="relative h-24 w-24">
            {!avatarFailed ? (
              <BlurredImage
                src={avatarSrc}
                alt={userName}
                isBlurred
                className="h-full w-full rounded-full object-cover"
                containerClassName="h-full w-full overflow-visible"
                backdropClassName="rounded-full scale-125 opacity-75"
                onError={() => {
                  if (!useFaviconFallback && imageUrl) {
                    setUseFaviconFallback(true)
                    return
                  }
                  setAvatarFailed(true)
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Text
              as="p"
              variant="body"
              className="text-5xl"
            >
              {userName}
            </Text>
            {username ? (
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                @{username}
              </Text>
            ) : null}
            <Text
              as="p"
              variant="body"
              className="text-muted-foreground"
            >
              {description}
            </Text>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <QuoteOfTheDay className="max-w-md" />
        </div>
      </div>
    </section>
  )
}
