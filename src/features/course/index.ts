export { CourseAnalyticsTab } from './components/CourseAnalyticsTab'
export type { CourseAnalyticsTabProps } from './components/CourseAnalyticsTab'
export { CourseCard } from './components/CourseCard'
export { CourseCardCompact } from './components/CourseCardCompact'
export { CourseCardList } from './components/CourseCardList'
export type { CourseCardListProps } from './components/CourseCardList'
export { CourseLayout } from './components/CourseLayout'
export { CoursePreviewTab } from './components/CoursePreviewTab'
export type { CoursePreviewTabProps } from './components/CoursePreviewTab'
export { CourseSettings } from './components/CourseSettings'
export { CoursePublishDialog } from './components/CoursePublishDialog'
export { CourseTabs } from './components/CourseTabs'
export type { CourseTabId, CourseTabItem } from './components/CourseTabs'
export { CourseFilter } from './components/CourseFilter'
export type { CourseFilterProps } from './components/CourseFilter'
export { EmptyLessonsView } from './components/EmptyLessonsView'
export { EmptyTopicsView } from './components/EmptyTopicsView'
export { useCourses } from './hooks/useCourses'
export { useCourseDetail } from './hooks/useCourseDetail'
export { COURSE_SEARCH_FIELDS } from './types/course.types'
export type {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseCardProps,
  ProfileCourseCardData,
  EnrollmentStatus,
  CourseEnrollment,
} from './types/course.types'
export type { EnrollmentCourse, CourseMemberType, CourseMember } from './api/enrollmentsApi'
export {
  createCourse,
  getTeacherCourses,
  getTeacherPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from './api/coursesApi'
export { publishCourseToClassrooms } from './api/coursePublishApi'
export type { PublishCourseToClassroomsResult } from './api/coursePublishApi'
export {
  requestCourseJoin,
  cancelCourseJoin,
  getMyAcceptedCourses,
  getMyEnrollmentStatusMap,
} from './api/enrollmentsApi'
export type { LessonHeading } from './utils/lessonHeadings'
export { getHeadingsFromLessonValue } from './utils/lessonHeadings'

export { Course as CoursePage } from './pages/course'
export { CourseDetailPage } from './pages/course-detail'
