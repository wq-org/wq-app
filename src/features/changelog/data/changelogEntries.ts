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
      'Lesson pages, game cards, and profile previews now feel more consistent. Navigation labels are translated, lesson pages load with better context, and game cards show the same core details across studio and play views.',
    bullets: [
      'lesson pages now load the right data more reliably, so previews and editing feel clearer',
      'game cards now use the same structure in the studio and in play views, which makes the interface easier to scan',
      'game lists now pass the right metadata into those cards, so titles and supporting details stay in sync',
      'the language switcher now uses translated labels instead of fixed text',
      'student and teacher profile pages now show richer lesson and game previews with more consistent details',
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
    title: 'Refine onboarding avatar flow and profile avatar UI',
    summary:
      'Choosing and showing avatars is now clearer from the first sign-up step through settings and in-game stats. Avatar selection is split into its own onboarding step, and the same visual language is reused across the app.',
    bullets: [
      'avatar choice now has its own onboarding step, so account details and avatar selection no longer compete on one screen',
      'the avatar picker now uses a cleaner carousel with a stronger preview of the selected avatar',
      'avatar names, descriptions, and emoji metadata are now shared, so onboarding and profile settings show the same information',
      'the profile avatar drawer was cleaned up into clearer selectable tiles with a stronger active state',
      'avatar previews now avoid the old square framing artifacts and look cleaner in onboarding and settings',
      'the game stats pill now includes the user avatar and an animated heart that reacts when the score increases',
      'avatar fallbacks and supporting copy were aligned so missing data is handled more consistently',
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
