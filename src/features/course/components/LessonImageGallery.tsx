import { ImageGallery } from '@/components/shared/media/ImageGallery'
import { DEFAULT_COURSE_BACKGROUND, DEFAULT_LESSON_BACKGROUND } from '@/lib/constants'

const LESSON_IMAGE_OPTIONS = [
  {
    url: DEFAULT_LESSON_BACKGROUND,
    title: 'Default lesson background',
  },
  {
    url: DEFAULT_COURSE_BACKGROUND,
    title: 'Default course background',
  },
]

export default function LessonImageGallery() {
  return (
    <ImageGallery
      images={LESSON_IMAGE_OPTIONS}
      className="max-w-none"
    />
  )
}
