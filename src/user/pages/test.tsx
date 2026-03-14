import { TitleDescriptionFields } from '@/components/shared/forms'
import { ClearableInput } from '@/components/shared/inputs'
import { OnboardingPage } from '@/features/onboarding'
import { QuantityStepper } from '@/components/shared/inputs'
import { ColorPicker, ImageCarousel, PdfPreview, VideoPreview } from '@/components/shared'
import { ProfileListItem } from '@/features/profiles'
import { useState, type ReactNode } from 'react'
import type { ThemeId } from '@/lib/themes'

const TEST_IMAGES = [
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/x8-VGWym1ynhFRfVPINL9w/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/i4eUoAWwFtFE--A_A-aopQ/1960x1102.jpg',
  'https://is1-ssl.mzstatic.com/image/thumb/1A5UrdlUF6-zEu5cfQvZag/2500x1406.jpg',
]
const TEST_VIDEO_URL = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'
const TEST_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const Container = ({ children }: { children: ReactNode }) => {
  return <div className="py-20 px-10 bg-gray-50 rounded-2xl">{children}</div>
}
export default function Test() {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('darkblue')

  return (
    <div className="min-h-screen flex flex-col gap-10  p-8">
      <Container>
        <ProfileListItem
          title="hallo"
          email={'hallo@email.com'}
        />
      </Container>
      <Container>
        <QuantityStepper />
      </Container>
      <Container>
        <ClearableInput />
      </Container>
      <Container>
        <TitleDescriptionFields />
      </Container>
      <Container>
        <ImageCarousel images={TEST_IMAGES} />
      </Container>
      <Container>
        <ColorPicker
          selectedId={selectedThemeId}
          onSelect={setSelectedThemeId}
        />
      </Container>
      <Container>
        <VideoPreview
          videoUrl={TEST_VIDEO_URL}
          fileName="Demo video"
        />
      </Container>
      <Container>
        <div className="h-[420px] w-full">
          <PdfPreview
            pdfUrl={TEST_PDF_URL}
            fileName="Demo PDF"
          />
        </div>
      </Container>
      <OnboardingPage />
    </div>
  )
}
