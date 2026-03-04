export type SiteChangelogEntryBadge = {
  label: string
  tone?: string
}

export type SiteChangelogEntry = {
  id: string
  date: string
  branch: string
  title: string
  summary: string
  bullets: string[]
  user: string
  email: string
  metaNote?: string
  badges?: SiteChangelogEntryBadge[]
}

export const changelogEntries: SiteChangelogEntry[] = [
  {
    id: '2026-03-04-refine-game-cards',
    date: '04.03.2026',
    branch: 'develop',
    title: 'Refine game cards and add translated lesson pages',
    summary:
      'Improve shared lesson and profile navigation with translated language switcher labels, richer lesson page loading, and more consistent game card data across studio and play views. This aligns course, profile, and game surfaces around the same metadata and localization flow.',
    bullets: [
      'update lesson page loading and editor support so lesson content can render with stronger page-level context and improved editing behavior',
      'extend game studio API and types to carry the extra fields needed for refreshed game card rendering',
      'rework studio and play game cards plus the game card list so both surfaces reuse a more consistent structure instead of diverging',
      'connect game play list updates to the revised game card data flow',
      'add translated labels to the language switcher and expand i18n setup so shared language controls use localized copy',
      'surface the richer game and lesson metadata in student and teacher profile views for more consistent profile previews across roles',
    ],
    user: 'goddi1999',
    email: 'godfredasefa@icloud.com',
    metaNote: 'nvm use was run before git inspection and completed successfully.',
    badges: [
      { label: 'develop', tone: 'improved' },
      { label: 'goddi1999', tone: 'docs' },
    ],
  },
  {
    id: '2026-03-03-lesson-preview-toc',
    date: '03.03.2026',
    branch: 'develop',
    title: 'Polish lesson preview TOC and shared selection UI',
    summary:
      'Refine lesson preview navigation and tighten up shared selection primitives so long preview outlines stay readable and new radio-based controls reuse the same tone system.',
    bullets: [
      'update the lesson preview table of contents so long headings clamp cleanly after two lines and stay readable in a fixed-height scroll container',
      'polish hover behavior and visual hierarchy in the preview TOC so navigation remains compact without losing scan-ability',
      'add shared radio tone helpers that centralize the 10 OKLCH color tokens used across selection controls',
      'introduce reusable radio card components for card-style single-choice selections',
      'add a soft-tone radio group variant so standard radio controls can match the shared color system without duplicating styling logic',
      'keep the new selection pieces under shared ui components so future forms and settings screens can reuse the same patterns',
    ],
    user: 'goddi1999',
    email: 'godfredasefa@icloud.com',
    metaNote: 'nvm use was run before git inspection and completed successfully.',
    badges: [
      { label: 'develop', tone: 'improved' },
      { label: 'UI', tone: 'new' },
    ],
  },
  {
    id: '2026-03-02-avatar-onboarding',
    date: '02.03.2026',
    branch: 'main',
    title: 'Redesign avatar onboarding and shared avatar UI',
    summary:
      'Split avatar choice into its own onboarding step and unify avatar presentation across onboarding, settings, and game stats. This makes the selection flow clearer, adds reusable UI primitives, and removes visual artifacts from avatar previews.',
    bullets: [
      'add a dedicated avatar onboarding step and update the stepper flow so account details and avatar selection are handled separately',
      'create a reusable carousel primitive and use it in the new onboarding avatar selector with a focused hero preview and selectable thumbnails',
      'add shared avatar display metadata types so name, description, and emoji are modeled once and reused in onboarding and avatar drawer UIs',
      'redesign the settings avatar drawer into wrapped avatar tiles with darkblue active state styling and cleaner cropped thumbnails',
      'restore blurred image treatment in the onboarding avatar selection preview and thumbnail surfaces while removing unwanted square framing',
      'extend the heart UI with shared color and size variants plus external animation triggers, then update StatsDisplay to show the user avatar and animate on score increases',
      'update onboarding avatar fallbacks, locale copy, and related settings plumbing so avatar data stays consistent across the full flow',
    ],
    user: 'goddi1999',
    email: 'godfredasefa@icloud.com',
    metaNote: 'nvm use was run before git inspection and completed successfully.',
    badges: [
      { label: 'main', tone: 'fix' },
      { label: 'Onboarding', tone: 'new' },
    ],
  },
]
