/**
 * Left gutter only: repeating indent guides are clipped so they do not tile across
 * label text (full-width `before:inset-0` + repeat looked like "| | |" under names).
 */
export const crmTreeIndentGuideClassName =
  'relative h-fit min-h-0 self-start before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:-ms-1 before:w-[min(100%,calc(var(--tree-indent)*12))] before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]'
