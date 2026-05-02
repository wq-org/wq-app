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
    id: '2026-05-02-teacher-dashboard-shell-loading-course-experience',
    date: '2 May 2026',
    title:
      'Refresh teacher workspace layout, navigation, and loading—plus tighter course and Game Studio pages',
    summary:
      'This batch simplifies shells after retiring the standalone profile area, rebuilds the teacher dashboard into clear sections with expandable cards and better routing to classrooms, courses, schedule, and cloud. It also adds smoother loading states (Zoomies), polishes page titles and empty states, and renames the student course screen for clarity.',
    bullets: [
      'Layout: app shells were simplified and the old profile feature removed so navigation stays focused on role workspaces',
      'Layout: the header separates back navigation from the profile block for clearer wayfinding',
      'Teacher dashboard: teacher home now uses sectioned layout with animated cards, optional “expand” actions on dashboard sections, and improved spacing on the main content column',
      'Teacher dashboard: compact course and game cards, dashboard tabs, and institution-aware settings hooks improve scanning and organization',
      'Navigation: classroom hub, courses listing, schedule, and cloud surfaces are wired from the dashboard with clearer route logic',
      'Schedule: dedicated schedule page plus dashboard rows that can expand into the full schedule experience',
      'Cloud: teacher-facing cloud/storage area landed with UI labels aligned to “Cloud” terminology',
      'Shared UI: SelectTabs now drives real tab panels; DashboardSection supports expandable destinations; scrollbar styling got visibility controls where needed',
      'Loading: many dashboards and classroom sections now use the Zoomies-based LoadingPage instead of bare spinners for clearer, branded feedback',
      'Courses & classroom: student course view lives in a dedicated course detail page; classroom and course titles can be centered where intended',
      'Teacher Courses & Game Studio: hero titles stay centered while primary actions stay right-aligned; Game Studio empty state matches dark theme better and includes a clear create action',
      'Small UX polish: classroom card lists, readonly card typing fixes, and minor dashboard animation and offset tweaks',
    ],
    badges: ['feature', 'change', 'improvement'],
  },
  {
    id: '2026-05-01-institution-programme-cohort-classroom-polish',
    date: '1 May 2026',
    title: 'Tighten programmes, cohorts, class groups, and classrooms end-to-end',
    summary:
      'Institution setup now walks faculty → programme → offerings → cohort → class group → classroom with clearer guards, smarter defaults, and consistent badges. Creation dialogs auto-fill names, descriptions, and academic years where it saves time, and classroom assignment is safer and easier to scan.',
    bullets: [
      'Structure: stepped timeline from faculty through programmes, offerings, cohorts (auto-active), class groups, and classrooms—single-faculty create dialog plus cohort shortcuts from faculty views',
      'Programmes: reliable half-year decimals; debounced description from title/faculty/duration; scrollable year popovers and compact panels; offerings pick smarter term codes, likely years first, and calendar-aware start defaults',
      'Cohorts: grey-out faculties with no programmes; auto titles (e.g. MD-2027) and templated descriptions; academic-year combobox picks the next sensible year',
      'Cohort offerings: invalid combinations disabled; quick default fill; range hints turn blue when valid, orange when off',
      'Class groups: faculty guards; optional auto codes (NS-1A…); descriptions refresh when inputs change; cards badge programme indigo and cohort teal',
      'Class group offerings: one-click path to open classroom creation; assigned users disabled in pickers; avatars in lists',
      'Classrooms: assign UI shows avatar, email, role; block duplicates; students via combobox; reassign main teacher; remove users; rename classroom',
      'Badge rules: blue for dates; indigo/teal for faculty, programme, cohort, and class-group chips so structure stays scannable',
    ],
    badges: ['feature', 'fix', 'improvement', 'change'],
  },
  {
    id: '2026-04-26-institution-admin-structure-and-offerings-refresh',
    date: '26 April 2026',
    title: 'Improve institution structure, offerings, and classroom management flows',
    summary:
      'This branch delivered a full institution-admin workflow refresh: cleaner faculty/programme/cohort/class-group creation, dedicated offering dialogs, stronger programme settings with archive controls, and classroom page improvements backed by RLS and UX fixes.',
    bullets: [
      'Features: added dedicated create dialogs for Programmes, Cohorts, and Class Groups with dependency linking (faculty -> programme -> cohort) and page-specific CTA labels',
      'Features: added dedicated create dialogs and orchestration hooks for Programme Offerings, Cohort Offerings, and Class Group Offerings',
      'Features: added year selection support in programme creation and programme settings via reusable year popover controls',
      'Features: added programme archive flow in settings using hold-to-confirm UX with archive icon and soft-delete semantics',
      'Features: added classroom list and classroom detail flows, plus classroom creation with suggestions and improved membership handling',
      'Fixes: resolved combobox type/selection issues affecting dialog selection behavior and improved create form reliability',
      'Fixes: addressed Supabase RLS recursion and membership policy issues for classrooms/classroom_members to stabilize data access',
      'Improvements: refactored offerings views from table-heavy layouts to timeline-first UX and modularized timeline/table components',
      'Improvements: aligned institution-admin feature structure with architecture rules (thinner pages, reusable dialog components, clearer hook orchestration)',
      'Improvements: expanded English and German translation coverage for dialogs, offering flows, settings states, and validation messages',
    ],
    badges: ['feature', 'fix', 'change', 'improvement'],
  },
  {
    id: '2026-04-14-admin-institution-dashboard-db-redesign',
    date: '14 April 2026',
    title: 'Launch admin and institution dashboards with complete database redesign',
    summary:
      'Major platform update bringing comprehensive administrative tools and institution management features with a fully redesigned database schema for better scalability and data integrity.',
    bullets: [
      'admin dashboard now provides system-wide oversight with audit logs, institution management, and entitlements configuration',
      'institution admin dashboard enables schools to manage subscriptions, billing, licenses, usage quotas, and GDPR compliance',
      'database schema fully redesigned with type-safe migrations, including super_admin, institution_admin, and lms domains with complete RLS policies',
      'new document editor with slash commands, color formatting, and rich-text support for course content creation',
      'enhanced institution invite system with email-based invitations, token redemption, and role-based access control',
      'subscription and plan entitlements system allows configurable features per institution with override capabilities',
      'cloud storage management with quota enforcement, file versioning, and asset tracking across institutions',
      'GDPR data subject requests now supported with full erasure and portability workflows',
      'game version publish model refactored to use pointer-based truth with preservation of historical run data',
    ],
    badges: ['feature', 'change', 'improvement', 'breaking'],
  },
  {
    id: '2026-03-27-feature-folder-standardization',
    date: '27 March 2026',
    title: 'Standardize feature folder naming conventions',
    summary:
      'Refactored feature folder structure to follow consistent naming conventions, improving code organization and reducing import friction across the codebase.',
    bullets: [
      'renamed institutionAdmin to institution-admin for kebab-case consistency across multi-word feature folders',
      'renamed profiles to profile to reflect singular domain naming convention',
      'updated all cross-feature imports to use stable barrel paths at feature boundaries',
      'aligned ESLint restricted-feature configuration with actual folder names for predictable boundary enforcement',
    ],
    badges: ['change', 'improvement'],
  },
  {
    id: '2026-03-14-auth-reset-flow-refresh',
    date: '14 March 2026',
    title: 'Improve password recovery and auth screen flow',
    summary:
      'Signing in and recovering an account now feels clearer. Reset links are validated earlier, auth feedback is more consistent, and the entry screens use a cleaner shared layout.',
    bullets: [
      'password reset now detects invalid or expired recovery links before showing the reset form',
      'forgot password, login, and sign-up screens now give clearer validation and status feedback',
      'auth cards and supporting backgrounds were refined so entry flows feel more consistent across screens',
      'auth and onboarding copy was updated in English and German to match the new reset and success states',
      'Added dark mode option',
    ],
    badges: ['fix', 'improvement'],
  },
  {
    id: '2026-03-13-dashboard-shell-command-add-refactor',
    date: '13 March 2026',
    title: 'Unify dashboard shells and simplify the add flow',
    summary:
      'Dashboard layouts now share a cleaner structure, and the command palette add flow is split into smaller, easier-to-follow steps for a more consistent workspace experience.',
    bullets: [
      'admin and institution dashboard areas now use one shared shell, which removes layout duplication and keeps navigation more consistent',
      'the command palette add flow was split into focused selection and form steps, making the create flow clearer for users',
      'command availability and role-based action rules were centralized so commands appear more predictably across workspaces',
      'file upload and related page wiring were aligned with the shared command flow to reduce friction when adding new content',
    ],
    badges: ['change', 'improvement'],
  },
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
