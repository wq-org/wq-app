import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const LANGUAGE_FLAGS: Record<'de' | 'en', string> = {
  de: '🇩🇪',
  en: '🇺🇸',
}

const SUPPORTED_LANGUAGES = [{ code: 'de' as const }, { code: 'en' as const }] as const

type LanguageSwitcherVariant = 'default' | 'auth'

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('shared.languageSwitcher')
  const [open, setOpen] = useState(false)
  const currentLanguage =
    SUPPORTED_LANGUAGES.find(
      (lang) => i18n.language === lang.code || i18n.language.startsWith(`${lang.code}-`),
    ) || SUPPORTED_LANGUAGES[0]

  const handleLanguageChange = (languageCode: string) => {
    if (i18n.language === languageCode || i18n.language.startsWith(`${languageCode}-`)) {
      setOpen(false)
      return
    }

    i18n.changeLanguage(languageCode)
    setOpen(false)
  }

  const isAuthVariant = variant === 'auth'

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isAuthVariant ? 'outline' : 'ghost'}
          size="icon"
          className={cn(
            'h-10 w-10 rounded-full gap-1',
            isAuthVariant
              ? 'shrink-0 bg-white p-0 shadow-sm border border-gray-200 hover:bg-white/95 flex items-center justify-center'
              : 'hover:bg-accent',
          )}
          aria-label={t('triggerLabel', {
            language: t(`languages.${currentLanguage.code}.name`),
          })}
          title={t(`languages.${currentLanguage.code}.name`)}
        >
          <Text
            as="span"
            variant="small"
            className={cn(isAuthVariant ? 'text-sm' : 'text-base')}
          >
            {LANGUAGE_FLAGS[currentLanguage.code]}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          isAuthVariant
            ? 'w-72 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg'
            : 'w-48 p-2 rounded-2xl mt-4',
        )}
        align={isAuthVariant ? 'start' : 'end'}
      >
        <div className={cn(isAuthVariant ? 'space-y-2' : 'space-y-1')}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={t(`languages.${lang.code}.switchLabel`)}
              title={t(`languages.${lang.code}.name`)}
              className={cn(
                isAuthVariant
                  ? 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors'
                  : 'w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2',
                i18n.language === lang.code || i18n.language.startsWith(`${lang.code}-`)
                  ? isAuthVariant
                    ? 'bg-gray-100'
                    : 'bg-accent'
                  : isAuthVariant
                    ? 'hover:bg-gray-50'
                    : undefined,
              )}
            >
              <Text
                as="span"
                variant="small"
                className={cn(isAuthVariant && 'text-sm')}
              >
                {LANGUAGE_FLAGS[lang.code]}
              </Text>
              <Text
                as="span"
                variant="small"
                className={cn(isAuthVariant && 'text-sm')}
              >
                {t(`languages.${lang.code}.name`)}
              </Text>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
