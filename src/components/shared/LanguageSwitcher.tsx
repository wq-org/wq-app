import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

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
          size={isAuthVariant ? 'default' : 'sm'}
          className={cn(
            'min-w-10 shrink-0 gap-1 px-2 font-medium tabular-nums',
            isAuthVariant
              ? 'h-10 rounded-full border-border bg-card text-foreground shadow-sm hover:bg-accent'
              : 'h-10 w-auto rounded-full hover:bg-accent',
          )}
          aria-label={t('triggerLabel', {
            language: t(`languages.${currentLanguage.code}.name`),
          })}
          title={t(`languages.${currentLanguage.code}.name`)}
        >
          <Text
            as="span"
            variant="small"
            className={cn('uppercase', isAuthVariant ? 'text-sm' : 'text-xs')}
          >
            {currentLanguage.code}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          isAuthVariant
            ? 'w-72 rounded-3xl border border-border bg-popover p-4 text-popover-foreground shadow-lg'
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
                  ? 'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-foreground transition-colors'
                  : 'w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2',
                i18n.language === lang.code || i18n.language.startsWith(`${lang.code}-`)
                  ? isAuthVariant
                    ? 'bg-muted'
                    : 'bg-accent'
                  : isAuthVariant
                    ? 'hover:bg-accent'
                    : undefined,
              )}
            >
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
