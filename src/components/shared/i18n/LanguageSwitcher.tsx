import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const flags: Record<string, string> = {
  US: '🇺🇸',
  DE: '🇩🇪',
}

const languages = [
  { code: 'de', flag: 'DE' },
  { code: 'en', flag: 'US' },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('shared.languageSwitcher')
  const currentLanguage =
    languages.find(
      (lang) => i18n.language === lang.code || i18n.language.startsWith(`${lang.code}-`),
    ) || languages[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-accent gap-1"
          aria-label={t('triggerLabel', {
            language: t(`languages.${currentLanguage.code}.name`),
          })}
          title={t(`languages.${currentLanguage.code}.name`)}
        >
          <Text
            as="span"
            variant="small"
            className="text-base"
          >
            {flags[currentLanguage.flag]}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2 rounded-2xl  mt-4"
        align="end"
      >
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={t(`languages.${lang.code}.switchLabel`)}
              title={t(`languages.${lang.code}.name`)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2',
                (i18n.language === lang.code || i18n.language.startsWith(`${lang.code}-`)) &&
                  'bg-accent',
              )}
            >
              <Text
                as="span"
                variant="small"
              >
                {flags[lang.flag]}
              </Text>
              <Text
                as="span"
                variant="small"
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
