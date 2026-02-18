import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const FLAGS: Record<string, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
}

const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
]

export default function AuthLanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentCode = LANGUAGES.some((lang) => lang.code === i18n.language) ? i18n.language : 'de'
  const currentFlag = FLAGS[currentCode] || FLAGS.de

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="size-10 shrink-0 rounded-full bg-white p-0 shadow-sm border border-gray-200 hover:bg-white/95 flex items-center justify-center"
          aria-label="Switch language"
        >
          <Text
            as="span"
            variant="small"
            className="text-sm"
          >
            {currentFlag}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg"
      >
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => i18n.changeLanguage(lang.code)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors',
                i18n.language === lang.code ? 'bg-gray-100' : 'hover:bg-gray-50',
              )}
            >
              <Text
                as="span"
                variant="small"
                className="text-sm"
              >
                {FLAGS[lang.code]}
              </Text>
              <Text
                as="span"
                variant="small"
                className="text-sm"
              >
                {lang.label}
              </Text>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
