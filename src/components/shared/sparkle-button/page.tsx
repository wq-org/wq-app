import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { SparkleButton } from './SparkleButton'
import type { SparkleButtonHue, SparkleButtonSize } from './sparkle-button.types'

const HUES: SparkleButtonHue[] = [
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'pink',
  'orange',
]

const SIZES: SparkleButtonSize[] = ['sm', 'default', 'lg']

const HUE_VALUE: Record<SparkleButtonHue, number> = {
  violet: 260,
  indigo: 275,
  blue: 220,
  cyan: 190,
  teal: 175,
  green: 145,
  pink: 330,
  orange: 35,
}

export function SparkleButtonPage() {
  const [hue, setHue] = useState<SparkleButtonHue>('violet')
  const [size, setSize] = useState<SparkleButtonSize>('default')
  const [label, setLabel] = useState('Generate Site')

  return (
    <div
      data-slot="sparkle-button-stage"
      style={{ ['--sparkle-button-stage-hue' as string]: HUE_VALUE[hue] }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 py-16">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
            shared / sparkle-button
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-white">Sparkle button</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
            A hover-activated pill button with conic spark, orbiting particles, and gradient label
            text. Ported from{' '}
            <a
              href="https://codepen.io/jh3y/pen/LYJMPBL"
              className="underline underline-offset-2 hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              jh3y&apos;s CodePen
            </a>
            .
          </p>
        </header>

        <section className="flex flex-col items-center gap-10">
          <SparkleButton
            hue={hue}
            size={size}
          >
            {label}
          </SparkleButton>

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/50">
                  hue
                </p>
                <div className="flex flex-wrap gap-2">
                  {HUES.map((h) => (
                    <Button
                      key={h}
                      size="sm"
                      variant={hue === h ? 'default' : 'outline'}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setHue(h)}
                    >
                      {h}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/50">
                  size
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={size === s ? 'default' : 'outline'}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/50">
                  label
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Generate Site', 'Launch', 'Create magic'].map((text) => (
                    <Button
                      key={text}
                      size="sm"
                      variant={label === text ? 'default' : 'outline'}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setLabel(text)}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-white/50">
            Variants
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HUES.map((h) => (
              <li
                key={h}
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8"
              >
                <SparkleButton
                  hue={h}
                  size="sm"
                >
                  {h}
                </SparkleButton>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
