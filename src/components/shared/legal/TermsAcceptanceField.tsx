import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { landingAgbPath } from '@/features/landing/constants/legal-paths'
import { cn } from '@/lib/utils'

export type TermsAcceptanceFieldProps = {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string | null
  className?: string
}

export function TermsAcceptanceField({
  id = 'terms-acceptance',
  checked,
  onCheckedChange,
  error,
  className,
}: TermsAcceptanceFieldProps) {
  const { t } = useTranslation('navigation')

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={Boolean(error)}
        />
        <Label
          htmlFor={id}
          className="text-sm font-normal leading-snug text-muted-foreground"
        >
          <Trans
            i18nKey="landing.legal.agbAcceptance"
            t={t}
            components={{
              1: (
                <Link
                  to={landingAgbPath}
                  className="text-foreground underline underline-offset-2 hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </Label>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
