import { CurvedImage } from './CurvedImage'
import { CurvedScrollbar } from './CurvedScrollbar'
import { CurvedScrollbarContent } from './CurvedScrollbarContent'
import { CurvedScrollbarFooter } from './CurvedScrollbarFooter'
import { CurvedScrollbarHeader } from './CurvedScrollbarHeader'
import { CurvedScrollbarViewport } from './CurvedScrollbarViewport'
import { CurvedText } from './CurvedText'
import { CurvedTitle } from './CurvedTitle'

const DEMO_PARAGRAPHS = [
  'Interfaces feel better when the invisible parts are cared for: the friction in a scroll, the way a thumb follows content, and the rhythm between motion and reading.',
  'This panel keeps the browser scroll behavior intact while drawing a custom SVG track over the edge. The result is decorative, but the interaction still belongs to the native scroller.',
  'The geometry is recalculated when the panel changes size, so the curve remains attached to the corners even when the example is resized on desktop.',
  'Reusable UI should expose stable controls instead of leaking the original demo script. Radius, stroke, color, opacity, content, and slots are props; measurement stays inside the hook.',
  'Scroll to the end and the thumb rounds the lower corner before settling into the footer.',
]

export function CurvedScrollbarPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <CurvedScrollbar theme="dark" color="#f85922">
        <CurvedScrollbarViewport>
          <CurvedScrollbarHeader>
            <CurvedTitle>023: curved scroller.</CurvedTitle>
            <CurvedText variant="intro">
              Jhey Tompkins inspired interaction, ported as a reusable shared
              component.
            </CurvedText>
            <CurvedImage
              placement="hero"
              src="https://picsum.photos/1280/720?random=12"
              alt=""
              loading="lazy"
            />
          </CurvedScrollbarHeader>

          <CurvedScrollbarContent>
            {DEMO_PARAGRAPHS.slice(0, 3).map((paragraph) => (
              <CurvedText key={paragraph}>{paragraph}</CurvedText>
            ))}
            <CurvedImage
              src="https://picsum.photos/1280/720?random=48"
              alt=""
              loading="lazy"
            />
            {DEMO_PARAGRAPHS.slice(3).map((paragraph) => (
              <CurvedText key={paragraph}>{paragraph}</CurvedText>
            ))}
            <CurvedImage
              src="https://picsum.photos/1280/720?random=36"
              alt=""
              loading="lazy"
            />
            <CurvedText>
              Find out how to do things like this and more by subscribing.
            </CurvedText>
          </CurvedScrollbarContent>

          <CurvedScrollbarFooter>
            <CurvedText variant="footer">The Craft of UI</CurvedText>
          </CurvedScrollbarFooter>
        </CurvedScrollbarViewport>
      </CurvedScrollbar>
    </div>
  )
}
