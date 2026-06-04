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
    id: '2026-06-04-game-studio-simulation-publish-if-else',
    date: '4 June 2026',
    title:
      'Game Studio: simulate the full learning flow, publish with validation, branch on score with If/Else, and link games to courses',
    summary:
      'Game authors can now walk through an entire project from Start to End in a dedicated Game Simulation page that stacks each step in one session with a running score ring—no more previewing one node in isolation. Publishing is gated by graph and per-node checks (missing images, empty exercises, unwired If/Else branches, unreachable End nodes, and more), with clickable issues that focus the canvas. You can optionally link a published game to one of your published courses at publish time, unpublish without losing the draft, and manage course association from project cards. A new If/Else logic node routes learners by score threshold against the incoming gameplay step, with Smart Set, a beam map, and branch testing in preview. Start and End nodes that are still in beta show a clear read-only notice instead of broken editors.',
    bullets: [
      'Teachers: open Preview from the canvas toolbar to autosave and launch Game Simulation on a full page (`/teacher/canvas/:id/preview`)—the bottom command palette stays hidden so the run feels like a real play session',
      'Teachers: simulate the whole flow in order—Start intro, then each gameplay node (Image & Pin, Drag & Drop Math, Open Question), If/Else routing, and End—with one in-memory session; scores are for testing only and are not saved to the database',
      'Teachers: follow progress with a session score ring against the sum of maximum points across all gameplay nodes; completed steps stay visible in a chat-style scroll while the active step owns the sticky footer (including Image Pin drag-and-drop when needed)',
      'Teachers: see clear errors inside simulation when a node is not ready (for example Image Pin without regions) instead of a silent failure',
      'Teachers: open Publish to review game title, node count, and total achievable points before students play; hold to confirm publish when validation passes',
      'Teachers: publishing is blocked until the graph is valid—exactly one Start and one End, at least one gameplay node, no self-loops, every node reachable from Start and able to reach End, and both outputs wired on every If/Else node',
      'Teachers: per-node publish checks cover Image Pin (image, regions, questions, points), Open Question (prompts, reference answers, metadata), Drag & Drop Math (tabs, canvas content, equations, points), Start/End titles, and If/Else threshold and condition text',
      'Teachers: tap any listed publish issue to jump the canvas to that node and fix it quickly',
      'Teachers: publish with warnings when only non-blocking issues remain; errors must be cleared first',
      'Teachers: optionally link the game to a published course in the publish drawer—linking is optional and the game still publishes if you skip it; only courses you have already published appear in the picker',
      'Teachers: Unpublish from the editor menu (with confirmation) so students no longer see the live game while your Game Studio draft remains editable',
      'Teachers: project version from the database is shown in settings with a version popover (current version context and rollback entry points where available)',
      'Teachers: add an If / Else node from the Logic section to split the flow after a gameplay step based on the learner score versus a threshold—not only “correct vs wrong” copy',
      'Teachers: set the score threshold manually or use Smart Set to fill half of the incoming step maximum points (floored); the beam map shows incoming node, Node A (top), and Node B (bottom) with point ranges and quick navigation to connected nodes',
      'Teachers: in the If/Else preview tab, play the incoming gameplay step, watch your score against the threshold, see which branch fires, and preview the next connected node on that branch when it is ready',
      'Teachers: in full-game simulation, If/Else advances automatically using the score earned on the preceding gameplay segment',
      'Teachers: configure If/Else messages and which physical output counts as the route after a “correct” previous answer in the node dialog; branch settings stay separate from threshold routing',
      'Teachers: Start and End nodes (and other nodes still marked beta) show a read-only beta notice—editing and preview for those node types are not offered until they are ready, while Image & Pin and other gameplay nodes stay fully usable',
      'Teachers: on the Game Studio project list, use the card menu to open link-to-course or unlink-from-course dialogs (UI shells for associating games with courses outside the publish drawer)',
      'Students (when a game is published and linked): play flows that can branch on partial credit—for example strong work on Drag & Drop Math or Image Pin can send learners down a different path than a score below the teacher threshold',
      'Internal: centralized graph validation (`validateGameStudioGraph`), sorted publish issues, play-session advance resolver, and Vitest coverage for flow order, thresholds, and preview scoring',
      'Internal: architecture doc `principle_vite_test.md` documents layer-by-layer testing conventions (mappers, MSW, hooks, components) for future features',
    ],
    badges: ['feature', 'new', 'improvement'],
  },
  {
    id: '2026-05-27-game-studio-dnd-math-node',
    date: '27 May 2026',
    title:
      'Game Studio: Drag & Drop Math — build multi-step calculations with real units, fair scoring, and a student-style preview',
    summary:
      'Teachers can now add a Drag & Drop Math game node to a learning flow. Students drag math blocks, text, and sum rows onto a canvas, press Enter to evaluate each line, and chain results into further calculations or a final Σ total. The editor supports a rich task description, several exercise tabs in one game, and a preview that mirrors how learners will submit answers. Scoring uses partial credit (PSCA): correct intermediate steps earn points even when the final total is wrong. Settings explain the formula in plain language and let you set the maximum score for the whole activity.',
    bullets: [
      'Teachers: add the Drag & Drop Math node from Game Studio and open a three-pane workspace — editor (build), preview (test as a student), and settings (points and scoring rules)',
      'Teachers: write the task introduction in a rich text editor (Lexical), so instructions, emphasis, and structure appear in the learner chat before the first exercise title',
      'Teachers: create several exercise tabs in one game (for example 1.1, 1.2, 1.3); each tab has its own title, answer canvas, and teacher solution you build separately',
      'Teachers: drag Math Block, Sum (Σ), and Text Block chips from the palette onto the canvas; reorder rows with the grip handle; drop result chips onto Σ rows or between rows to start a new calculation line',
      'Teachers: press Enter on a math chip to evaluate the line — the engine uses math.js with custom units (€, m², kg, %, and many more) so results show with the correct unit, not just bare numbers',
      'Teachers: invalid combinations are blocked before they confuse learners — for example incompatible units or operations that are not allowed in strict school mode, with clear feedback on the row',
      'Teachers: a built-in rule set covers allowed standard operations and a strict-school matrix so only school-appropriate operator and unit combinations are accepted during authoring',
      'Teachers: optional instant color feedback turns a row blue when Enter accepts the expression and red when something is wrong (operators, numbers, or units), so you can spot mistakes while building',
      'Teachers: the add-tab control shows “+ Exercise” so it is obvious you are adding another sub-question to the same game node',
      'Preview (for teachers testing, and the pattern students will see): walk through exercise tabs one after another; each tab’s maximum points is your total game score divided evenly across tabs (10 points and 2 tabs → up to 5 points per tab)',
      'Preview: submit your canvas answer, confirm in a dialog, then see a short loading state, your submitted rows in the chat, points earned for that tab, and — when applicable — a congratulations message for a perfect tab score',
      'Preview: after a tab is scored, the next exercise title appears in the chat, the canvas resets for a fresh attempt, and a running total toward the game maximum is shown at the bottom',
      'Preview: after the last tab, a bold total summary shows how many points you earned out of the maximum you set in settings',
      'Preview: use “How to play” in the preview to see step-by-step instructions and how PSCA scoring maps to your maximum points',
      'Preview: empty canvases cannot be submitted; after submit, chips lock so the attempt cannot be changed (same idea learners will experience)',
      'Settings: set the maximum score for the entire game node (for example 10 points); that budget is shared across all exercise tabs automatically',
      'Settings: open “How is the score calculated?” to read the partial-credit formula in plain language — result (50%), steps (30%), method (15%), and error-free checks (5%) — plus an example of how a score between 0 and 1 becomes points',
      'Settings: toggle instant color feedback on or off for the whole node',
      'Settings: see the previous and next nodes in your game flow with icons, so you can jump to neighbors while editing',
      'Students (when this node is published in a game): read the task and each exercise title in a chat-style layout, build calculations by dragging blocks, submit when ready, and receive partial points when intermediate results are correct even if the final sum is wrong',
      'Students: fair scoring means a single typo on the last Σ line does not automatically erase credit for correct work on earlier lines, as long as those lines match what the teacher modeled',
      'Internal: unit categories and a TypeScript unit registry keep €, areas, rates (€/m²), and derived results consistent across validation and display',
    ],
    badges: ['feature', 'new'],
  },
  {
    id: '2026-05-23-teacher-cloud-gallery-and-expanded-file-preview',
    date: '23 May 2026',
    title: 'Teacher Cloud gallery previews files more clearly and stays easier to browse',
    summary:
      'The teacher Cloud page now behaves like a real media library instead of a cramped list. Images, PDFs, and videos open in a large preview with file details and hold-to-delete at the bottom, uploads from the command palette show up without reloading the page, and long filenames truncate cleanly with an ellipsis so card titles stay readable. Fullscreen expand grows from the center of the screen without jumping, and tall photos or vertical videos no longer push metadata off-screen.',
    bullets: [
      'Teachers: browse images, PDFs, and MP4 videos in the Cloud gallery with the same card grid used elsewhere in the app',
      'Teachers: tap a file to open an expanded preview with type, size, upload date, MIME type, and hold-to-delete in one place',
      'Teachers: use the arrow button to expand preview to full screen from the center of the dialog, then collapse back without the panel sliding downward',
      'Teachers: PDFs and videos stay inside the preview area with internal scrolling; footer details and delete stay fully visible on every file type',
      'Teachers: upload through the command palette and see new files appear in the gallery shortly after upload finishes',
      'Teachers: rename files from the expanded title when your cloud hook supports it',
      'Teachers: long filenames show up to two lines with "…" at the end and a hover tooltip with the full name',
      'Everyone: card titles across courses, topics, classrooms, and game projects use the same reliable truncation pattern',
      'Internal: shared line-clamp utility and CardTitle clampLines prop reduce one-off ellipsis CSS across the app',
      'Internal: expanded preview media uses a single flex layout for images, video, and PDF so layout bugs are easier to prevent',
    ],
    badges: ['feature', 'improvement', 'fix'],
  },
  {
    id: '2026-05-19-lesson-editor-checklists-youtube-and-link-polish',
    date: '19 May 2026',
    title: 'Lesson editor adds cleaner checklists, YouTube embeds, and tidier link tools',
    summary:
      'Lesson authors get a more complete writing surface for rich content. Checklists now behave like real editor tasks with a clear blue checked state, a visible white checkmark, better focus feedback, and no awkward left-offset click mismatch. The slash menu also gains a YouTube embed action, so teachers can paste a YouTube link or video ID and place a playable video directly in lesson content. Link and embed internals were cleaned up so the editor is easier to maintain and extend.',
    bullets: [
      'Teachers: checklist items now show a blue checked box with a visible white checkmark, making completed tasks easier to scan while editing lessons',
      'Teachers: checklist click targets now line up with the visible box, so checking and unchecking an item no longer feels offset or unreliable',
      'Teachers: focused checklist items use a clean ring-style focus state instead of a harsh border, keeping keyboard navigation clearer',
      'Teachers: the lesson slash menu now includes a Todo List option for quickly adding checkable task lists to lesson notes',
      'Teachers: the lesson slash menu now includes an Embed YouTube option, so you can paste a YouTube URL or video ID and add the video to the lesson',
      'Teachers: YouTube embeds use the privacy-friendlier youtube-nocookie player URL and keep a consistent responsive video shape inside the editor',
      'Authors: link dialog naming is clearer, separating lesson links from YouTube links so the editor actions are easier to understand',
      'Internal: checklist behavior is registered through a dedicated Lexical plugin instead of scattered editor setup code',
      'Internal: YouTube embeds now have their own Lexical node, insert utility, parser, dialog plugin, and render component for cleaner maintenance',
      'Internal: decorator block selection and alignment now use the local editor node class consistently, reducing future formatting bugs',
    ],
    badges: ['feature', 'improvement', 'fix'],
  },
  {
    id: '2026-05-19-game-studio-image-pin-settings-and-flow-preview',
    date: '19 May 2026',
    title:
      'Game Studio Image Pin is easier to set up, preview, score, and trust in a learning flow',
    summary:
      'Teachers get a clearer and more dependable Image Pin setup experience inside Game Studio. The settings area now explains the learning purpose of a game, lets you mark which learning fields it supports, shows nearby connected nodes in the game flow, and gives a more useful preview of how the activity will look for learners. The game logic is also more robust: learners can see how scoring works, retries are handled consistently, and the final attempt clearly settles the question before moving on. Students benefit from cleaner previews, fairer feedback, and more reliable image handling, so Image Pin games feel smoother when teachers prepare and test them.',
    bullets: [
      'Teachers: Image Pin settings now include a dedicated learning-field picker, so you can mark activities with LF-1 through LF-7 instead of leaving the learning goal unclear',
      'Teachers: you can select several learning fields for one Image Pin activity and remove individual choices with a compact badge control',
      'Teachers: the settings panel now shows the previous and next connected nodes with their correct icons, making it easier to understand where the Image Pin sits in the game flow',
      'Teachers: connected-node previews no longer show a red X when a real node is connected, so the flow preview is less confusing',
      'Teachers: the current Image Pin node stays visually active in the center of the mini flow preview while its settings dialog is open',
      'Teachers: new settings sections prepare the activity for scoring, retry penalties, optional time limits, and adaptive image difficulty, even though some of those controls are still being wired into gameplay',
      'Teachers: the activity description can be saved and shown as the first learner message, so students start with the context you intended',
      'Teachers: scoring is now explained inside the learner preview, including points per question, retry deductions, and what happens on the final attempt',
      'Teachers: score deduction is calculated from the value of one question, rounded down, and shown clearly so grading rules are easier to review before using the game',
      'Students: the score display now starts at 0 and sits next to the answer input, making progress easier to follow while playing',
      'Students: correct answers show how many points were earned before the next question starts',
      'Students: if the final attempt is wrong, the game now shows +0 pts before continuing, so it is clear that the question was settled with no points',
      'Students: the fourth attempt always gives 0 points, whether the pin is correct or wrong, and the next question then begins predictably',
      'Teachers: uploaded Image Pin images are handled more carefully to avoid duplicate uploads and repeated gallery entries',
      'Teachers: image galleries reuse existing pictures more cleanly, making it faster to build several related Image Pin tasks',
      'Students: game previews make better use of the dialog space, so chat-style instructions and answers are easier to read',
      'Students: Image Pin previews can show image quality and hidden-area effects more clearly, helping teachers test how challenging an activity may feel',
      'Institutions: stronger scoring and retry behavior makes Image Pin activities easier to explain, review, and use consistently across classrooms',
      'Everyone: small visual polish in the Game Studio dialog, animated beam preview, image carousel, and AI-style input bar makes the authoring experience feel smoother and less jumpy',
    ],
    badges: ['feature', 'improvement', 'fix'],
  },
  {
    id: '2026-05-15-game-studio-image-pin-chat-and-ai-building-blocks',
    date: '15 May 2026',
    title:
      'Game Studio Image Pin gets real authoring—draw regions, save images to cloud, and reuse pictures—plus richer chat and AI-style composer pieces',
    summary:
      'Game authors can now build Image Pin activities properly inside the studio: node settings save to the game flow, you can upload or replace a background image without losing your pin layout, draw several tap regions on the picture with per-region questions, and pick images from other pins on the same game or from your institution cloud library when uploads are enabled. Shared chat surfaces gained optional loading states and gentler motion, incoming and receiving bubbles can follow clearer color presets in light and dark themes, and reusable AI-style composer widgets landed for future features. Internal polish covers clearer node dialogs, textarea contrast in dark mode, and a safer image-load path when a link expires.',
    bullets: [
      'Game Studio (Image Pin): open the node editor in a roomier dialog; upload a background image, swap it later with a replace control, and clear it when you want to start over',
      'Game Studio (Image Pin): draw multiple rectangular tap zones on the image, give each zone its own prompt or question, and keep zone positions sensibly scaled when you change the picture',
      'Game Studio (Image Pin): when cloud upload is wired for your role, images can be stored in your institution cloud with a stable file reference while the editor shows a working preview (including signed links for private buckets)',
      'Game Studio (Image Pin): browse a gallery that mixes other Image Pin images from the same game with images already in your cloud folder so you can reuse artwork instead of re-uploading every time',
      'Game Studio (Image Pin): if a preview link fails (for example an expired signed URL), the editor can try to refresh the image instead of leaving you stuck on a broken thumbnail',
      'Game Studio (Image Pin): on-canvas pin labels and refreshed highlight colors make regions easier to see while you edit',
      'Creators & integrators: shared “AI composer” style inputs (Ai02 and Ai03) are available from the shared component library for consistent ask-a-question or chat-style bars across the product',
      'Chat: you can style incoming and receiving bubbles independently, the history panel behaves better inside tight layouts, and messages can show a subtle loading state before the final text appears',
      'Chat: message bubbles can fade and slide in lightly when they appear so threads feel a little more alive without distracting motion',
      'Design system: a small dot-wave loading pattern and extra separator styling options were added for loading states and future layout work',
      'Internal testing: the consolidated UI test page showcases new chat presets, staged loading, and the AI-style composers so design and QA can review behavior in one place',
      'Small fixes: form text areas in dense dialogs show clearer separators and scrollbars in dark mode, loading spinners default to a higher-contrast style, and a hold-to-delete control on another node type no longer passes an invalid button variant',
    ],
    badges: ['feature', 'improvement', 'change'],
  },
  {
    id: '2026-05-10-lesson-authoring-reliability-and-topic-polish',
    date: '10 May 2026',
    title:
      'Smoother lesson authoring, faster topic lesson lists, and clearer feedback while you work',
    summary:
      'Lesson writing is built around saving content in sensible chunks instead of one oversized blob, which helps long lessons load and autosave more reliably. Creating lessons from a topic works smoothly again, topic pages give quieter errors when something goes wrong, and small touches—steady buttons, simpler toasts, snappier lists—make everyday course editing feel less fiddly.',
    bullets: [
      'Teachers: long lessons should feel lighter to open and save because lesson material is handled in smaller pieces behind the scenes instead of one giant block',
      'Teachers: adding a new lesson from a topic page should succeed consistently again',
      'Teachers: if lessons fail to load on a topic, you get a short toast instead of a loud warning taking over the page',
      'Teachers: save and autosave messages match the normal toast style used elsewhere so status feels familiar',
      'Teachers: the create-lesson action keeps a stable layout while it works so the button does not jump around',
      'Teachers: topic lesson lists aim to load only what the screen needs so scrolling your lesson cards feels quicker',
      'Topics: the lesson search strip on topic and course preview is presented as a simple toolbar-style row—same search, clearer intent',
      'Small fixes across the lesson workspace so editing titles, descriptions, and lesson content stays dependable day to day',
    ],
    badges: ['feature', 'improvement', 'fix'],
  },
  {
    id: '2026-05-03-plans-license-faculty-and-teacher-dashboard',
    date: '3 May 2026',
    title:
      'Clearer plans for schools, a license view for teachers, and smoother faculty and course workflows',
    summary:
      'Schools get a clearer picture of which product capabilities apply to their institution, and teachers can open a dedicated License item from the profile menu when they belong to a school. Faculty administrators see programmes and faculty details on separate tabs so browsing and editing stay easy to follow. The teacher home dashboard no longer shows sample games and tasks—filters stay in place with honest empty states until your own content appears—and saving topics and lessons is more reliable for everyday course authoring.',
    bullets: [
      'Institutions: the app can reflect your school’s plan and enabled features in the product experience, so what teachers and students see stays aligned with what you subscribe to',
      'Teachers: open License from the profile menu (when you are linked to a school) to see subscription and entitlement context in one place',
      'Teachers: home dashboard keeps the same course, game, and task filters but drops placeholder rows—each tab tells you clearly when there is nothing to show yet',
      'Teachers and students: creating and editing course topics and lessons should feel more dependable, with fewer unexplained save failures during normal use',
      'Institution admins: the faculty programmes area now has an Overview tab for searching and adding programmes, and a Settings tab to update the faculty name and description with clear unsaved-change prompts',
      'Institution admins: dialogs for cohort offerings, classrooms, and class groups are a little easier to use, with smarter defaults and clearer choices when picking programmes and terms',
      'Teachers: dashboard sections can be visually toned down when a block is not meant to be interactive yet, so the page feels calmer and easier to scan',
      'Platform admins: unused Notes and Tasks shortcuts were removed from navigation so the admin area stays focused on what you actually use',
      'Small polish to classroom and profile-related screens for a tidier day-to-day experience',
    ],
    badges: ['feature', 'improvement', 'fix'],
  },
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
