# The Definitive Clean UX/UI Design & Animation Guide for Web Interfaces

## Overview

Building user-friendly interfaces that feel polished and responsive requires mastering two pillars: clean design fundamentals and intentional motion. This guide distills principles from the industry's most respected practitioners — Rauno Freiberg (Staff Design Engineer at Vercel, designer of Arc browser), Emil Kowalski (creator of animations.dev), Apple's Human Interface Guidelines, and Nielsen Norman Group's usability heuristics — into an actionable framework for building production-grade interfaces.[^1][^2][^3][^4]

The 2026 design landscape prioritizes **calmness, clarity, and predictable patterns** over novelty. Products like Linear, Notion, and Vercel succeed because they use classic, efficient layouts that feel polished and intuitive, balancing familiarity with thoughtful motion and speed.[^5]

---

## Rauno Freiberg's Web Interface Guidelines

Rauno Freiberg maintains an open-source document titled _Web Interface Guidelines_ — a non-exhaustive list of details that make a good web interface. These rules are used at Vercel and reflect the craft philosophy behind products like the Arc browser. Below is the complete guideline set, organized by category.[^6]

### Interactivity

- Clicking the input label should focus the input field[^7]
- Inputs should be wrapped with a `<form>` to submit by pressing Enter[^7]
- Inputs should have an appropriate `type` like `password`, `email`, etc.[^7]
- Inputs should disable `spellcheck` and `autocomplete` attributes most of the time[^7]
- Inputs should leverage HTML form validation by using the `required` attribute when appropriate[^7]
- Input prefix and suffix decorations (icons) should be absolutely positioned on top of the text input with padding, not placed next to it, and should trigger focus on the input[^7]
- Toggles should immediately take effect, not require confirmation[^7]
- Buttons should be disabled after submission to avoid duplicate network requests[^7]
- Interactive elements should disable `user-select` for inner content[^7]
- Decorative elements (glows, gradients) should disable `pointer-events` to not hijack events[^7]
- Interactive elements in a list should have no dead areas between them — increase their `padding` instead[^7]

### Typography

- Apply `-webkit-font-smoothing: antialiased` for better legibility[^7]
- Apply `text-rendering: optimizeLegibility` for better legibility[^7]
- Subset fonts based on content, alphabet, or relevant language(s)[^7]
- Font weight should not change on hover or selected state to prevent layout shift[^7]
- Never use font weights below 400[^7]
- Medium-sized headings generally look best at font weight 500–600[^7]
- Use CSS `clamp()` for fluid values, e.g., `clamp(48px, 5vw, 72px)` for heading `font-size`[^7]
- Apply `font-variant-numeric: tabular-nums` for tables, timers, and anywhere layout shifts are undesirable[^7]
- Prevent text resizing in landscape mode on iOS with `-webkit-text-size-adjust: 100%`[^7]

### Motion

- Switching themes should **not** trigger transitions and animations on elements[^7]
- Animation duration should not exceed 200ms for interactions to feel immediate[^7]
- Animation values should be proportional to the trigger size: don't animate dialog scale from 0 → 1 (fade from ~0.8); don't scale buttons from 1 → 0.8 (use ~0.96 or ~0.9)[^7]
- **Frequent, low-novelty actions** should avoid extraneous animations: opening a right-click menu, deleting/adding list items, hovering trivial buttons[^7]
- Looping animations should pause when not visible on screen to offload CPU/GPU usage[^7]
- Use `scroll-behavior: smooth` for in-page anchor navigation, with an appropriate offset[^7]

### Touch

- Hover states should not be visible on touch press — use `@media (hover: hover)`[^7]
- Input font size should not be smaller than 16px to prevent iOS zooming on focus[^7]
- Inputs should not auto-focus on touch devices (it opens the keyboard and covers the screen)[^7]
- Apply `muted` and `playsinline` to `<video />` tags to auto-play on iOS[^7]
- Disable `touch-action` for custom components implementing pan/zoom gestures[^7]
- Disable the default iOS tap highlight with `-webkit-tap-highlight-color: rgba(0,0,0,0)`, but always replace it with an appropriate alternative[^7]

### Optimizations

- Large `blur()` values for `filter` and `backdrop-filter` may be slow[^7]
- Scaling and blurring filled rectangles causes banding — use radial gradients instead[^7]
- Sparingly enable GPU rendering with `transform: translateZ(0)` for unperformant animations[^7]
- Toggle `will-change` on unperformant scroll animations for the duration only (using it pre-emptively can have the opposite effect)[^7]
- Auto-playing too many videos on iOS will choke the device — pause or unmount off-screen videos[^7]
- Bypass React's render lifecycle with refs for real-time values that can commit to the DOM directly[^7]
- Detect and adapt to the hardware and network capabilities of the user's device[^7]

### Accessibility

- Disabled buttons should not have tooltips (they are not in the tab order, so keyboard users will never see them)[^7]
- Use box-shadow for focus rings, not outline (which may not respect `border-radius`)[^7]
- Focusable elements in sequential lists should be navigable with ↑ ↓[^7]
- Focusable elements in sequential lists should be deletable with ⌘ Backspace[^7]
- Dropdown menus should trigger on `mousedown`, not `click`, to open immediately on press[^7]
- Use an SVG favicon with a `<style>` tag that adheres to the system theme via `prefers-color-scheme`[^7]
- Icon-only interactive elements should define an explicit `aria-label`[^7]
- Tooltips triggered by hover should not contain interactive content[^7]
- Images should always use `<img>` for screen readers and ease of right-click copying[^7]
- Illustrations built with HTML should have an explicit `aria-label`[^7]
- Gradient text should unset the gradient on `::selection` state[^7]
- Nested menus should use a "prediction cone" to prevent the pointer from accidentally closing the menu[^7]

### Design Patterns

- Optimistically update data locally and roll back on server error with feedback[^7]
- Authentication redirects should happen on the server before the client loads to avoid janky URL changes[^7]
- Style the document selection state with `::selection`[^7]
- Display feedback relative to its trigger: show a temporary inline checkmark on successful copy (not a toast notification); highlight relevant input(s) on form error(s)[^7]
- Empty states should prompt to create a new item, with optional templates[^7]

---

## The Easing Blueprint: Designing Better Animations

The Easing Blueprint, authored by Reuben Rapose as part of the animations.dev curriculum, and complemented by Emil Kowalski's practical animation tips, provides a complete framework for choosing the right animation easing for every interaction.[^8][^9]

### Why Easing Matters

Easing describes the rate at which something changes over a period of time. It is the single most important variable that determines how an animation _feels_. The perception of speed is often more important than actual performance — two animations with identical duration can feel dramatically different when different easing curves are applied.[^8]

### The Four Core Easing Types

| Easing Type     | When to Use                                                                     | When to Avoid          | CSS Example                              |
| --------------- | ------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| **Ease-Out**    | Enter/exit transitions, user-initiated interactions (opening modals, dropdowns) | Continuous loops       | `cubic-bezier(0.23, 1, 0.32, 1)`         |
| **Ease-In-Out** | On-screen element movement, morphing between states                             | Enter/exit animations  | `cubic-bezier(0.86, 0, 0.07, 1)`         |
| **Ease-In**     | Almost never for UI — makes interfaces feel sluggish                            | User-initiated actions | `cubic-bezier(0.55, 0.055, 0.675, 0.19)` |
| **Linear**      | Loading spinners, marquees, continuous loops                                    | Any user interaction   | `linear`                                 |

**Ease-out is the default choice for UI work.** The acceleration at the beginning gives users a feeling of responsiveness. Emil Kowalski recommends using ease-out for enter and exit transitions with a duration no longer than 0.3–0.4 seconds.[^10][^9][^8]

### Custom Cubic-Bezier Curves (Benjamin De Cock)

The built-in CSS easing curves are usually not strong enough. These custom curves by Benjamin De Cock provide more energetic, professional motion:[^9]

```css
:root {
  /* Ease Out variants */
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-circ: cubic-bezier(0.075, 0.82, 0.165, 1);

  /* Ease In variants */
  --ease-in-quad: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --ease-in-cubic: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --ease-in-quart: cubic-bezier(0.895, 0.03, 0.685, 0.22);
  --ease-in-quint: cubic-bezier(0.755, 0.05, 0.855, 0.06);

  /* Ease In-Out variants */
  --ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
  --ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
  --ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
```

### Spring Animations for Natural Motion

Spring-based animations are becoming the standard for natural-feeling motion. Unlike cubic-bezier curves, springs are physics-based — they model real-world properties like tension, friction, and mass. iOS uses spring-physics-based animation instead of bezier curves for most system animations. Libraries like Framer Motion (now Motion) and react-spring make spring animations accessible in React.[^11][^12][^13]

### Emil Kowalski's 7 Practical Animation Rules

1. **Scale buttons on press** — Add a subtle `scale(0.97)` on `:active` for instant responsiveness[^9]
2. **Never animate from `scale(0)`** — Start from 0.9+ for a natural, gentle feel (like a balloon that never fully disappears)[^9]
3. **Don't delay subsequent tooltips** — Once one tooltip is open, others in the same group should appear instantly with no animation[^9]
4. **Choose ease-out as default easing** — It starts fast, giving the feeling of responsiveness. Avoid ease-in for UI[^9]
5. **Make animations origin-aware** — Set `transform-origin` to scale from the trigger element, not `center`[^9]
6. **Keep animations fast** — UI animations should generally stay under 300ms. Remove animations entirely for high-frequency interactions[^9]
7. **Use blur to mask imperfections** — Adding 2px of `filter: blur()` during crossfade transitions smooths the visual gap between states[^9]

---

## Invisible Details of Interaction Design

Rauno Freiberg's essay _Invisible Details of Interaction Design_ deconstructs the _why_ behind great interaction patterns, primarily from iOS. These principles apply directly to web applications.[^14]

### Metaphors and Gesture Reuse

Great interaction design reuses metaphors. iOS teaches swiping once (swipe up to unlock), and that knowledge compounds across the entire interface — swiping down reveals system controls, swiping horizontally navigates pages (like turning a book page). Interactions modeled after real-world properties, like interruptibility, feel intuitive because they mirror the physical world.[^14]

### Frequency vs. Novelty

Actions performed hundreds of times daily should have **no animation**. The native macOS right-click menu appears without motion because its usage frequency is extremely high and novelty is low. The App Switcher (Cmd+Tab) also appears instantly. However, the right-click menu subtly _fades out_ — a brief blink of accent color confirms selection, and fading makes the dismissal feel graceful rather than abrupt.[^14]

This is a critical principle for the wq-Health Game Studio: core editing interactions (node creation, deletion, keyboard shortcuts) should avoid extraneous animation, while novel interactions (first-time game previews, achievement unlocks) can include thoughtful motion.

### Kinetic Physics and Responsiveness

Truly fluid gestures are immediately responsive. A naive implementation waits for a threshold before triggering an animation. A great implementation applies the gesture delta _immediately_, then performs the snap animation past a threshold. This gives the user confidence and makes the interface feel alive.[^14]

### Fitts's Law in Practice

The time to click a target depends on its distance and size. Operating systems place menus in corners because the target area is "infinitely large" — the pointer can't overshoot past a screen edge. For web interfaces, this means placing frequent actions (submit buttons, primary navigation) where they're easiest to reach and as large as practical.[^14]

---

## Nielsen's 10 Usability Heuristics

Jakob Nielsen's heuristics remain the gold standard for evaluating interface usability:[^15][^4]

| #   | Heuristic                               | Application                                                                               |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | **Visibility of system status**         | Always show loading states, progress indicators, success/error feedback                   |
| 2   | **Match between system and real world** | Use familiar language and concepts, not technical jargon                                  |
| 3   | **User control and freedom**            | Provide clear "emergency exits" — undo, redo, cancel, back                                |
| 4   | **Consistency and standards**           | Follow platform conventions; maintain internal consistency in colors, spacing, typography |
| 5   | **Error prevention**                    | Confirm destructive actions; use validation before submission                             |
| 6   | **Recognition rather than recall**      | Make options visible; don't force users to memorize information                           |
| 7   | **Flexibility and efficiency of use**   | Provide keyboard shortcuts and accelerators for expert users                              |
| 8   | **Aesthetic and minimalist design**     | Every element should earn its place; remove what doesn't serve the task                   |
| 9   | **Help users recover from errors**      | Express error messages in plain language with constructive solutions                      |
| 10  | **Help and documentation**              | Provide contextual, searchable help; keep it task-oriented                                |

[^4][^15]

---

## Apple Human Interface Guidelines: Motion Principles

Apple's motion guidelines emphasize restraint and purpose:[^1]

- **Use motion to communicate** — Show how things change, what will happen, and what users can do next[^1]
- **Add motion purposefully** — Don't add motion for the sake of it. Gratuitous animation makes people feel disconnected[^1]
- **Make motion optional** — Respect `prefers-reduced-motion`. Never use animation as the only way to communicate important information[^1]
- **Strive for realism** — Motion that defies physical laws disorients users. If a view slides down from the top, dismissing it should slide it back up[^1]
- **Prefer quick, precise animations** — The system favors snappy, physics-based springs over long, drawn-out curves[^1]

Microsoft's Fluent Design follows similar principles with its easing system: `cubic-bezier(0, 0, 0, 1)` (fast out, slow in) for elements entering the scene, providing immediate visual response that decelerates to rest.[^16]

---

## Clean Design Fundamentals

### The Six Core Principles

1. **White space is intentional** — It guides attention, separates sections, and makes content scannable. When in doubt, remove something and step back[^17]
2. **Two fonts maximum** — One for headings, one for body. A bold sans-serif paired with a clean serif is a reliable combination[^17]
3. **Limited color palette** — One or two main colors, a few neutrals, and maybe one accent. Start with grayscale, add color only where it supports function (buttons, alerts)[^17]
4. **Content minimalism** — Short sentences, clear headings, bullet points. Most people scan rather than read[^17]
5. **Consistent layout** — If one button has rounded corners, all buttons should. Menus shouldn't jump between positions across screens[^18]
6. **Consistent animations** — Use the same type of animation across similar elements. Match timing and easing. Avoid flashy effects unless they have a clear function[^17]

### 2026 Trends Reinforcing These Principles

Visual design in 2026 emphasizes calmness, inclusivity, and clarity — larger typography, softer edges, increased spacing, and thoughtful color contrast. Products like Headspace, Calm, Canva, and Google Workspace lead this movement. The broader trend is a return to **predictable design patterns** that users recognize and trust, reducing cognitive overload.[^5]

---

## Essential Resources and Tools

### Design Systems to Study

| Design System              | Company   | Focus Area                               | URL                         |
| -------------------------- | --------- | ---------------------------------------- | --------------------------- |
| Material Design            | Google    | Comprehensive cross-platform system      | material.io                 |
| Human Interface Guidelines | Apple     | Platform-native design for iOS/macOS     | developer.apple.com/design  |
| Fluent Design              | Microsoft | Cross-platform adaptive design           | microsoft.com/design/fluent |
| Polaris                    | Shopify   | Commerce-focused component system        | polaris.shopify.com         |
| Carbon                     | IBM       | Enterprise application design            | carbondesignsystem.com      |
| Spectrum                   | Adobe     | Creative tool design patterns            | spectrum.adobe.com          |
| Vercel Design              | Vercel    | Modern web aesthetic (the "Linear look") | vercel.com/design           |

[^19]

### Animation and Motion Resources

| Resource                           | Type                            | Focus                                              |
| ---------------------------------- | ------------------------------- | -------------------------------------------------- |
| **animations.dev** (Emil Kowalski) | Course + interactive playground | Complete web animation curriculum[^20]             |
| **The Easing Blueprint**           | Guide (animations.dev)          | When and how to use each easing type[^8]           |
| **easings.net**                    | Visual reference                | Easing function cheat sheet with curves            |
| **cubic-bezier.com**               | Tool                            | Interactive cubic-bezier curve builder             |
| **Motion (framer-motion)**         | Library                         | React animation library with spring physics[^10]   |
| **spring-easing**                  | Library                         | Spring animation for any JS animation library[^12] |
| **Rauno's Craft**                  | Portfolio + essays              | Interaction design prototypes and essays[^14]      |

### UX Principles and Learning

| Resource                               | Type                  | Focus                                                     |
| -------------------------------------- | --------------------- | --------------------------------------------------------- |
| **Nielsen Norman Group** (nngroup.com) | Research articles     | Evidence-based UX research and heuristics[^21]            |
| **Laws of UX** (lawsofux.com)          | Reference             | Psychology-backed design laws                             |
| **Mobbin**                             | Pattern library       | Real app UI patterns from iOS and Android                 |
| **Rauno's Web Interface Guidelines**   | Open-source checklist | Practical implementation details[^6]                      |
| **Figma Community**                    | Templates + systems   | Design system templates and component libraries[^22]      |
| **SixArm UI/UX Design Guide**          | Book (free)           | Comprehensive one-topic-per-page design encyclopedia[^23] |

### Design Tools for 2026

The top UX design tools include **Figma** (collaborative design and prototyping), **Miro** (user flow mapping), **Maze** (user feedback gathering), and **Notion** (design documentation and project workflows). Figma's ecosystem, including FigJam for workshops and the community template library, has become the central hub for modern design teams.[^22]

---

## Applying These Principles to React + TypeScript Projects

### Animation Implementation with Framer Motion

For React projects (like the wq-Health platform), Framer Motion (now "Motion") provides the most ergonomic animation API:

```tsx
import { motion } from 'framer-motion'

// Ease-out enter animation (the default choice)
const ModalEnter = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1], // ease-out-quint
    }}
  />
)
```

### CSS Custom Properties for Consistent Easing

Define easing curves as CSS custom properties and reference them throughout the application for consistency:

```css
:root {
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.86, 0, 0.07, 1);
}

.button {
  transition: transform var(--transition-fast) var(--ease-out);
}

.button:active {
  transform: scale(0.97);
}
```

### Respecting Reduced Motion

Always check for the user's motion preference, which is part of both Apple's HIG and web accessibility standards:[^1]

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance-Safe Animation Properties

Only animate `transform` and `opacity` — these are GPU-accelerated and avoid triggering layout recalculation. Animating `width`, `height`, or `margin` forces the browser to recalculate layout on every frame, causing jank on lower-powered devices.[^24][^25][^7]

---

## Quick Reference Cheat Sheet

### Do

- Use ease-out for 90% of UI animations[^9]
- Keep interactions under 200ms (or 300ms max for larger transitions)[^9][^7]
- Animate from scale 0.9+, never from 0[^9]
- Set `transform-origin` to the trigger element[^9]
- Respect `prefers-reduced-motion`[^1]
- Use `tabular-nums` for any changing numbers[^7]
- Provide keyboard navigation for sequential elements[^7]
- Wrap inputs in `<form>` elements[^7]
- Optimistically update UI, roll back on error[^7]

### Don't

- Animate high-frequency, low-novelty actions[^7]
- Use ease-in for UI interactions (it feels sluggish)[^8][^9]
- Use font weights below 400[^7]
- Change font weight on hover (causes layout shift)[^7]
- Auto-focus inputs on mobile (covers the screen)[^7]
- Place tooltips on disabled buttons (not accessible)[^7]
- Use `outline` for focus rings (may not follow border-radius)[^7]
- Use `will-change` preemptively (can hurt performance)[^7]

---

## References

1. [Motion](https://developers.apple.com/design/human-interface-guidelines/foundations/motion) - On all platforms, beautiful, fluid motions bring the interface to life, conveying status, providing ...

2. [Devouring Details](https://devouringdetails.com) - My name is Rauno. I work as a Staff Design Engineer at Vercel on our platform, design system, market...

3. [emilkowal-animations by pproenca/dot-skills](https://skills.sh/pproenca/dot-skills/emilkowal-animations) - Discover and install skills for AI agents.

4. [Jakob Nielsen's 10 Usability Heuristics for User Interface Design](https://ux247.com/usability-principles/) - Usability Principles – Jakob Nielsen's 10 Usability Heuristics for User Interface Design

5. [UI and UX Design Trends for 2026 - Raw.Studio](https://raw.studio/blog/ui-and-ux-design-trends-for-2026-what-founders-and-designers-need-to-know/) - The digital design landscape is evolving rapidly, and the shift from 2024 UX trends to the prioritie...

6. [GitHub - raunofreiberg/interfaces: A non-exhaustive list of details that make a good web interface.](https://github.com/raunofreiberg/interfaces) - A non-exhaustive list of details that make a good web interface. - raunofreiberg/interfaces

7. [interfaces/README.md at main · raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces/blob/main/README.md) - A non-exhaustive list of details that make a good web interface. - raunofreiberg/interfaces

8. [The Easing Blueprint - Reuben Rapose](https://www.reubence.com/articles/the-easing-blueprint) - The main ingredient that influences how our animations feel is easing. It describes the rate at whic...

9. [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips) - Easing, which describes the rate at which something changes over a period of time, is the most impor...

10. [Easing functions — Adjust animation timing - Motion](https://motion.dev/docs/easing-functions) - Explore Motion's built-in easing functions to control animation speed and feel. Learn how to use cub...

11. [How I Transitioned from Ease to Spring Animations · Issue #282 · nirjan-dev/learning-to-code](https://github.com/nirjan-dev/learning-to-code/issues/282) - link to the post One strong point of react-spring is that it supports physics-based animations, espe...

12. [GitHub - okikio/spring-easing: Quick and easy spring animation. Works with other animation libraries (gsap, animejs, framer motion, motion one, @okikio/animate, etc...) or the Web Animation API (WAAPI).](http://github.com/okikio/spring-easing) - Quick and easy spring animation. Works with other animation libraries (gsap, animejs, framer motion,...

13. [iOS modal opening curve speed is different with native one · Issue #97 · jamesblasco/modal_bottom_sheet](https://github.com/jamesblasco/modal_bottom_sheet/issues/97) - modal_bottom_sheet animation seems like using a linear curve, while native's one is using an easeOut...

14. [Interview with Rauno Freiberg, Design Engineer at Vercel](https://spaces.is/loversmagazine/interviews/rauno-freiberg) - Rauno Freiberg is an Estonian interaction designer. He currently works as a Staff Design Engineer at...

15. [Checklists/10-usability-heuristics-for-user-interface-design.md at master · SteveBarnett/Checklists](https://github.com/SteveBarnett/Checklists/blob/master/10-usability-heuristics-for-user-interface-design.md) - Some handy checklists for reviewing sites, with a bit of a focus on UX and accessibility - SteveBarn...

16. [windows-dev-docs/hub/apps/design/motion/timing-and-easing.md at docs · MicrosoftDocs/windows-dev-docs](https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/apps/design/motion/timing-and-easing.md) - Conceptual and overview content for developing Windows apps - MicrosoftDocs/windows-dev-docs

17. [The 6 key UX principles of clean design - Lummi](https://www.lummi.ai/blog/clean-design-principles) - Design trends come and go, but clean design principles are always essential for designers to underst...

18. [UI/UX in 2026: Best Practices and Trends - Autonomous](https://autonomoustech.ca/blog/ui-ux-in-2026-best-practices-and-trends/) - The future of UI/UX is here. Learn the top UI/UX Trends 2026 trends, from essential Accessibility an...

19. [GitHub - saadeghi/design-systems: A list of famous design systems, design languages and guidelines](https://github.com/saadeghi/design-systems) - A list of famous design systems, design languages and guidelines - saadeghi/design-systems

20. [Animations on the Web](https://animations.dev) - This includes questions about how to animate specific UI elements, which easing to use, animation be...

21. [UX & Usability Articles from Nielsen Norman Group - NN/G](https://www.nngroup.com/articles/) - Research-based articles about user experience (UX), interaction design, web usability, user testing,...

22. [Top UX and UI Design Tools for Product Teams in 2026 | Maze](https://maze.co/collections/ux-ui-design/tools/) - Discover powerful UX UI design tools to elevate your workflow. Compare leading product design softwa...

23. [GitHub - SixArm/ui-ux-design-guide: UI/UX Design Guide: this book explains one topic per page, like a big glossary, easy wiki, quick encyclopedia, or summary notes. Edited by Joel Parker Henderson (@joelparkerhenderson).](https://github.com/SixArm/ui-ux-design-guide) - UI/UX Design Guide: this book explains one topic per page, like a big glossary, easy wiki, quick enc...

24. [best-practices/chapters/BP_039_en.md at main · cnumr/best-practices](https://github.com/cnumr/best-practices/blob/main/chapters/BP_039_en.md) - 115 Web Ecodesign Best Practices. Contribute to cnumr/best-practices development by creating an acco...

25. [CSS Transitions: The Complete Guide to Smooth Web Animations](https://dev.to/satyam_gupta_0d1ff2152dcc/css-transitions-the-complete-guide-to-smooth-web-animations-347b) - Here's a pro tip: most transitions work best between 150-400 milliseconds. Shorter transitions (like...
