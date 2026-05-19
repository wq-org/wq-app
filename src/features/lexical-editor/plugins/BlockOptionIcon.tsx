import { ICON_URLS, type BlockOption } from './blockOptions'

export function BlockOptionIcon({ option }: { option: BlockOption }) {
  const Icon = option.Icon
  if (Icon) {
    return (
      <Icon
        aria-hidden
        className="h-4 w-4 shrink-0 opacity-70"
        strokeWidth={2}
      />
    )
  }

  if (!option.iconKey) {
    return null
  }

  return (
    <span
      className="inline-block h-4 w-4 shrink-0 bg-contain bg-center bg-no-repeat opacity-70 dark:invert"
      style={{
        backgroundImage: `url('${ICON_URLS[option.iconKey]}')`,
      }}
    />
  )
}
