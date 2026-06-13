import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ComputerIcon,
  type ComputerIconAnimation,
  type ComputerIconState,
  type ComputerIconVariant,
} from './ComputerIcon'

const STATES: { state: ComputerIconState; label: string; hint: string }[] =
  [
    {
      state: 'default',
      label: 'default',
      hint: 'Idle — soft blink and gentle glance.',
    },
    {
      state: 'loading',
      label: 'loading',
      hint: 'Eyes scan while the body floats.',
    },
    {
      state: 'waiting',
      label: 'waiting',
      hint: 'Slow look-around, anticipatory.',
    },
    {
      state: 'success',
      label: 'success',
      hint: 'Quick lift, eyes perk upward.',
    },
    {
      state: 'failure',
      label: 'failure',
      hint: 'Short shake, eyes compress.',
    },
  ]

const ANIMATIONS: ComputerIconAnimation[] = [
  'idle',
  'looking',
  'thinking',
  'blink',
  'perk',
  'shake',
  'bouncing',
  'hover-float',
  'none',
]

const VARIANTS: ComputerIconVariant[] = [
  'default',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
]

export function ComputerIconPage() {
  const [state, setState] = useState<ComputerIconState>('loading')
  const [animation, setAnimation] = useState<ComputerIconAnimation | ''>(
    '',
  )
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="min-h-svh bg-background px-4 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            shared / ai-agent
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-foreground">
            Agent computer icon
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            A 24px monitor face with a GSAP-driven state machine. The eyes hold
            the personality, the screen breathes, the base grounds. Animation is
            wired to <code className="rounded bg-muted px-1">data-part</code>{' '}
            groups so motion stays stable across refactors.
          </p>
        </header>

        <section className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col items-center justify-center gap-6 border-b p-10 md:border-b-0 md:border-r">
              <div className="rounded-full bg-muted/40 p-10">
                <ComputerIcon
                  key={`${state}-${animation}-${replayKey}`}
                  size={120}
                  strokeWidth={1.4}
                  state={state}
                  animation={animation === '' ? undefined : animation}
                  variant="default"
                />
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {STATES.find((s) => s.state === state)?.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {STATES.find((s) => s.state === state)?.hint}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  state
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((s) => (
                    <Button
                      key={s.state}
                      size="sm"
                      variant={state === s.state ? 'default' : 'outline'}
                      onClick={() => {
                        setState(s.state)
                        setAnimation('')
                      }}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  animation override
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={animation === '' ? 'default' : 'outline'}
                    onClick={() => setAnimation('')}
                  >
                    auto
                  </Button>
                  {ANIMATIONS.map((a) => (
                    <Button
                      key={a}
                      size="sm"
                      variant={animation === a ? 'default' : 'outline'}
                      onClick={() => setAnimation(a)}
                    >
                      {a}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setReplayKey((n) => n + 1)}
                >
                  Replay animation
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            States
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STATES.map((s) => (
              <li
                key={s.state}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5"
              >
                <ComputerIcon size={56} strokeWidth={1.5} state={s.state} />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Variants
          </h2>
          <ul className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-6">
            {VARIANTS.map((v) => (
              <li
                key={v}
                className="flex flex-col items-center gap-2"
                title={v}
              >
                <ComputerIcon
                  size={40}
                  strokeWidth={1.6}
                  state="loading"
                  variant={v}
                />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {v}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Static
          </h2>
          <div className="flex items-center gap-6 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            <ComputerIcon size={40} state="default" animated={false} />
            <p>
              Pass <code className="rounded bg-muted px-1">animated={'{false}'}</code>{' '}
              to lock the icon in place — useful inside dense lists or when
              motion would be distracting.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
