import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { BlurredImage } from '@/components/ui/blurred-image'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { fetchAvatars } from '../api/onboardingApi'
import { createDefaultOnboardingAvatar, DEFAULT_ONBOARDING_AVATAR_SRC } from '../constants'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import type {
  AvatarDisplayAttributes,
  AvatarOption,
  StepAvatarProps,
} from '../types/onboarding.types'

type AvatarSlideProps = {
  avatar: AvatarOption
  isSelected: boolean
  onSelect: () => void
}

function AvatarMetaText({
  avatar,
  centered = false,
}: {
  avatar: AvatarDisplayAttributes
  centered?: boolean
}) {
  return (
    <div className={cn('space-y-2', centered && 'text-center')}>
      <div className={cn('flex items-center gap-2', centered && 'justify-center')}>
        <Text
          as="span"
          variant="small"
          className="text-2xl"
        >
          {avatar.emoji}
        </Text>
        <Text
          as="span"
          variant="small"
          className="text-base font-medium"
        >
          {avatar.name}
        </Text>
      </div>
      {avatar.description ? (
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {avatar.description}
        </Text>
      ) : null}
    </div>
  )
}

function AvatarSlide({ avatar, isSelected, onSelect }: AvatarSlideProps) {
  const { url: signedAvatarUrl } = useAvatarUrl(avatar.src)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [avatar.src, signedAvatarUrl])

  const imageSrc = imageFailed
    ? DEFAULT_ONBOARDING_AVATAR_SRC
    : signedAvatarUrl || DEFAULT_ONBOARDING_AVATAR_SRC

  return (
    <CarouselItem className="basis-[40%] sm:basis-[32%] md:basis-[24%]">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'block w-full cursor-pointer transition-all duration-500',
          isSelected
            ? 'scale-100 opacity-100'
            : 'scale-[0.68] opacity-55 hover:scale-[0.74] hover:opacity-75',
        )}
        aria-label={`Select ${avatar.name}`}
      >
        <div className="mx-auto aspect-square w-full max-w-28 overflow-hidden rounded-full">
          <img
            src={imageSrc}
            alt={avatar.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </button>
    </CarouselItem>
  )
}

export function StepAvatar({ onNext, onBack, initialAvatarSrc }: StepAvatarProps) {
  const { t } = useTranslation('features.onboarding')
  const defaultAvatar = useMemo(
    () =>
      createDefaultOnboardingAvatar(
        t('avatarStep.default.name'),
        t('avatarStep.default.description'),
      ),
    [t],
  )
  const [api, setApi] = useState<CarouselApi>()
  const [avatars, setAvatars] = useState<AvatarOption[]>([defaultAvatar])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const selectedAvatar = avatars[selectedIndex] ?? defaultAvatar
  const { url: selectedAvatarUrl } = useAvatarUrl(selectedAvatar.src)

  useEffect(() => {
    let cancelled = false

    async function loadAvatars() {
      try {
        const fetchedAvatars = await fetchAvatars()
        if (cancelled) {
          return
        }

        setAvatars(fetchedAvatars.length > 0 ? fetchedAvatars : [defaultAvatar])
      } catch (error) {
        console.error('Error loading avatars:', error)
        if (!cancelled) {
          setAvatars([defaultAvatar])
        }
      }
    }

    setAvatars([defaultAvatar])
    void loadAvatars()

    return () => {
      cancelled = true
    }
  }, [defaultAvatar])

  useEffect(() => {
    if (avatars.length === 0) {
      return
    }

    const initialIndex = initialAvatarSrc
      ? avatars.findIndex((avatar) => avatar.src === initialAvatarSrc)
      : 0

    setSelectedIndex(initialIndex >= 0 ? initialIndex : 0)
  }, [avatars, initialAvatarSrc])

  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    handleSelect()
    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || avatars.length === 0) {
      return
    }

    api.scrollTo(Math.min(selectedIndex, avatars.length - 1))
  }, [api, avatars.length, selectedIndex])

  useEffect(() => {
    setHeroImageFailed(false)
  }, [selectedAvatar.src, selectedAvatarUrl])

  const heroImageSrc = heroImageFailed
    ? DEFAULT_ONBOARDING_AVATAR_SRC
    : selectedAvatarUrl || DEFAULT_ONBOARDING_AVATAR_SRC

  const handleSelectAvatar = (index: number) => {
    setSelectedIndex(index)
    api?.scrollTo(index)
  }

  const handleContinue = () => {
    onNext(selectedAvatar)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <Text
            as="h2"
            variant="h2"
            className="text-3xl font-light"
          >
            {t('avatarStep.header.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('avatarStep.header.subtitle')}
          </Text>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <div
            key={heroImageSrc}
            className="relative mx-auto aspect-square w-full max-w-62 shrink-0 animate-in fade-in-0 slide-in-from-bottom-4 rounded-full border border-border/60 bg-background duration-300 ease-out"
          >
            <BlurredImage
              src={heroImageSrc}
              alt={selectedAvatar.name}
              isBlurred
              onError={() => setHeroImageFailed(true)}
              className="h-full w-full rounded-full object-cover"
              containerClassName="h-full w-full overflow-visible"
              backdropClassName="rounded-full scale-125 opacity-75"
            />
          </div>
          <AvatarMetaText
            avatar={selectedAvatar}
            centered
          />
        </div>

        {avatars.length > 1 ? (
          <div className="w-full max-w-xl px-10">
            <Carousel
              className="w-full"
              opts={{ align: 'center', loop: avatars.length > 2 }}
              setApi={setApi}
            >
              <CarouselContent className="py-3">
                {avatars.map((avatar, index) => (
                  <AvatarSlide
                    key={avatar.src}
                    avatar={avatar}
                    isSelected={index === selectedIndex}
                    onSelect={() => handleSelectAvatar(index)}
                  />
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 bg-background/80 backdrop-blur-sm" />
              <CarouselNext className="-right-3 bg-background/80 backdrop-blur-sm" />
            </Carousel>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between gap-4 py-11">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
        >
          {t('avatarStep.actions.back')}
        </Button>
        <Button
          type="button"
          variant="darkblue"
          onClick={handleContinue}
        >
          {t('avatarStep.actions.continue')}
        </Button>
      </div>
    </div>
  )
}
