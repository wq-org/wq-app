'use client'

import { Fragment } from 'react'
import { AlertTriangle, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { getFlowGraphNodeDisplayLabel } from '../constants/flowGraphNodeTypes'
import { getRegistryEntry } from '../nodes/_registry/GameNodeRegistry'
import type { SessionStep } from './useGamePreviewSession'

export type GamePreviewFlowProps = {
  steps: SessionStep[]
  /** Optional Start-node intro shown as the first block. */
  startTitle?: string
  startDescription?: string
}

function StepLabel({ index, total, label }: { index: number; total: number; label: string }) {
  const { t } = useTranslation('features.gameStudio')
  return (
    <div className="flex flex-col gap-1">
      <Text
        as="p"
        variant="small"
        muted
        bold
      >
        {t('previewDrawer.stepLabel', { index, total })}
      </Text>
      <Text
        as="h3"
        variant="body"
        className="text-base font-semibold text-foreground"
      >
        {label}
      </Text>
    </div>
  )
}

function InvalidNodeBanner({ errors }: { errors: string[] }) {
  const { t } = useTranslation('features.gameStudio')
  return (
    <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <Text
          as="p"
          variant="small"
          bold
        >
          {t('previewDrawer.invalidNodeTitle')}
        </Text>
        <Text
          as="p"
          variant="small"
        >
          {t('previewDrawer.invalidNodeHint')}
        </Text>
        <ul className="ml-4 list-disc space-y-0.5">
          {errors.map((error, index) => (
            <li key={index}>
              <Text
                as="span"
                variant="small"
              >
                {error}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function GamePreviewNodeSection({
  step,
  index,
  total,
}: {
  step: SessionStep
  index: number
  total: number
}) {
  const entry = step.node.type ? getRegistryEntry(step.node.type) : undefined
  const PreviewComponent = entry?.PreviewComponent ?? null
  const label = getFlowGraphNodeDisplayLabel(
    step.node.type,
    (step.node.data ?? {}) as Record<string, unknown>,
  )
  const hasErrors = step.validationErrors.length > 0

  return (
    <section
      aria-label={label}
      className="flex flex-col gap-3"
    >
      <StepLabel
        index={index + 1}
        total={total}
        label={label}
      />
      {hasErrors || !PreviewComponent ? (
        <InvalidNodeBanner errors={step.validationErrors} />
      ) : (
        <div className="h-[68vh] min-h-[28rem]">
          <PreviewComponent
            nodeId={step.node.id}
            nodeData={(step.node.data ?? {}) as Record<string, unknown>}
          />
        </div>
      )}
    </section>
  )
}

export function GamePreviewFlow({ steps, startTitle, startDescription }: GamePreviewFlowProps) {
  const { t } = useTranslation('features.gameStudio')
  const hasIntro = Boolean(startTitle?.trim() || startDescription?.trim())
  const total = steps.length

  return (
    <BlurredScrollArea
      className="min-h-0 flex-1"
      viewportClassName="min-h-0"
    >
      <div className="flex flex-col gap-4 px-1 pb-6">
        {hasIntro ? (
          <section
            aria-label={t('previewDrawer.startIntroLabel')}
            className="flex flex-col gap-2"
          >
            <Text
              as="p"
              variant="small"
              muted
              bold
            >
              {t('previewDrawer.startIntroLabel')}
            </Text>
            {startTitle?.trim() ? (
              <Text
                as="h2"
                variant="body"
                className="text-lg font-semibold text-foreground"
              >
                {startTitle}
              </Text>
            ) : null}
            {startDescription?.trim() ? (
              <Text
                as="p"
                variant="body"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {startDescription}
              </Text>
            ) : null}
          </section>
        ) : null}

        {steps.map((step, index) => (
          <Fragment key={step.node.id}>
            {(hasIntro || index > 0) && <Separator className="my-1" />}
            <GamePreviewNodeSection
              step={step}
              index={index}
              total={total}
            />
          </Fragment>
        ))}

        <Separator className="my-1" />
        <section className={cn('flex items-center gap-3 rounded-xl bg-muted/30 p-4')}>
          <Flag className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <Text
              as="p"
              variant="small"
              bold
            >
              {t('previewDrawer.completeTitle')}
            </Text>
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('previewDrawer.completeHint')}
            </Text>
          </div>
        </section>
      </div>
    </BlurredScrollArea>
  )
}
