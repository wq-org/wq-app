export type ChangelogBadgeType =
  | 'new'
  | 'change'
  | 'fix'
  | 'improvement'
  | 'feature'
  | 'deprecated'
  | 'breaking'
  | 'security'
  | 'docs'

export type SiteChangelogEntry = {
  id: string
  date: string
  title: string
  summary: string
  bullets: string[]
  badges?: ChangelogBadgeType[]
}

export const changelogEntries: SiteChangelogEntry[] = [
  {
    id: '2026-03-08-topic-lesson-workspace-refresh',
    date: '8 March 2026',
    title: 'Refresh topic and lesson workspace flow',
    summary:
      'Topic and lesson management now has a cleaner structure with dedicated lesson pages, built-in filtering, and clearer title/description presentation across course and lesson screens.',
    bullets: [
      'topic pages were redesigned for a cleaner layout and better scanability while editing course content',
      'users can now filter topics directly by title and description, making larger course structures easier to navigate',
      'users can now filter lessons the same way, so finding lesson content inside a topic is much faster',
      'topic lessons were moved to a dedicated lesson page flow, improving separation between topic-level and lesson-level work',
      'course and lesson title/description UI was refined for clearer hierarchy and better readability in workspace views',
    ],
    badges: ['change', 'feature', 'improvement'],
  },
  {
    id: '2026-03-04-refine-game-cards',
    date: '4 March 2026',
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
    badges: ['improvement', 'feature'],
  },
  {
    id: '2026-03-03-lesson-preview-toc',
    date: '3 March 2026',
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
    badges: ['change', 'feature'],
  },
  {
    id: '2026-03-02-avatar-onboarding',
    date: '2 March 2026',
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
    badges: ['feature', 'fix'],
  },
]
