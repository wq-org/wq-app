import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom'
import {
  AuthInvitePage,
  LoginPage,
  SignUpPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  RequireAuth,
  RequireOnboarding,
  RequireRole,
  USER_ROLES,
} from '@/features/auth'
import Test from './user/pages/test'
import Home from './user/pages/home'
import LandingPage from './user/pages/landing'
import ContactPage from './user/pages/contact'
import ChangelogPage from './user/pages/changelog'
import {
  StudentDashboard,
  StudentSettingsPage,
  StudentChat,
  StudentCloudPage,
  StudentNotesPage,
  StudentTasksPage,
  StudentViewPage,
  StudentGameHistoryPage,
  StudentPublishedCourseGamePage,
  StudentPublishedCoursePage,
  StudentPublishedLessonPage,
  StudentPublishedTopicPage,
} from '@/features/student'
import {
  TeacherDashboard,
  TeacherClassroomDetailPage,
  TeacherCoursesPage,
  TeacherSchedulePage,
  TeacherSettingsPage,
  TeacherLicensePage,
  GameStudio,
  TeacherChat,
  TeacherCloudPage,
  TeacherNotesPage,
  TeacherTasksPage,
  TeacherViewPage,
  ClassroomGamePlayPage,
  ClassroomPublishedCoursePage,
  ClassroomTopicPublishedPage,
  ClassroomCourseTopicLessonPublishedPage,
  GameRunAnalyticsPage,
} from '@/features/teacher'
import { NotFoundPage } from './user/pages/not-found'
import {
  CourseDetailPage,
  CourseLayout,
  CoursePage,
  PublishedCourseLessonPage,
  PublishedCourseGamePage,
  PublishedCoursePage,
  CourseReleaseReviewPage,
  PublishedCourseTopicLessonPage,
  PublishedCourseTopicPage,
} from '@/features/course'
import { LessonRedirect, LessonRoute, LessonView } from '@/features/lesson'
import { TopicPage, TopicView } from '@/features/topic'
import { Onboarding } from '@/features/onboarding'

import { UserProvider } from './contexts/user'
import { CourseProvider } from './contexts/course'
import { LessonProvider } from './contexts/lesson'
import { TopicProvider } from './contexts/topic'
import { Toaster } from './components/ui/sonner'
import { AppShell } from './components/layout'
import { GameEditorCanvas, GamePreviewPage } from '@/features/game-studio'
import {
  AdminAuditLogs,
  AdminAnalytics,
  AdminBilling,
  AdminCourseContentPage,
  AdminCourseTopicLessonPage,
  AdminCourseTopicPage,
  AdminCoursesPage,
  AdminDashboard,
  AdminFeatureDefinitions,
  AdminFeatureDefinitionEditor,
  AdminFeatures,
  AdminGdprRequest,
  AdminInstitution,
  AdminInstitutionDetails,
  AdminInstitutionInvites,
  AdminLicenses,
  AdminGameDetailPage,
  AdminGamesPage,
  AdminPlanEntitlementsEditor,
  NewInstitution,
  AdminPlanCatalog,
  AdminSettings,
  AdminUsers,
  AdminFilesPage,
} from '@/features/admin'
import {
  InstitutionAdminDashboardPage,
  InstitutionAdminTeachersPage,
  InstitutionAdminStudentsPage,
  InstitutionAdminUsersPage,
  InstitutionAdminInviteUsersPage,
  InstitutionAdminClassroomsPage,
  InstitutionAdminClassroomDetailPage,
  InstitutionAdminLicensesPage,
  InstitutionAdminUsagePage,
  InstitutionAdminGDPRRequestPage,
  InstitutionAdminLicensePage,
  InstitutionAdminBillingPage,
  InstitutionAdminCourseContentPage,
  InstitutionAdminCourseTopicLessonPage,
  InstitutionAdminCourseTopicPage,
  InstitutionAdminCoursesPage,
  InstitutionAdminGameDetailPage,
  InstitutionAdminGamesPage,
  InstitutionAdminAnalyticsPage,
  InstitutionAdminCloudStoragePage,
  InstitutionAdminAuditLogsPage,
  InstitutionAdminSettingsPage,
} from '@/features/institution-admin'

const GameEditorCanvasWithProjectId = () => {
  const { id } = useParams<{ id: string }>()
  return <GameEditorCanvas projectId={id ?? undefined} />
}

const App = () => {
  return (
    <UserProvider>
      <CourseProvider>
        <TopicProvider>
          <LessonProvider>
            <Toaster />
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/solutions/teachers"
                element={<LandingPage />}
              />
              <Route
                path="/solutions/learners"
                element={<LandingPage />}
              />
              <Route
                path="/solutions/institutions"
                element={<LandingPage />}
              />
              <Route
                path="/mission/vision"
                element={<LandingPage />}
              />
              <Route
                path="/mission/partners"
                element={<LandingPage />}
              />
              <Route
                path="/contact"
                element={<ContactPage />}
              />
              <Route
                path="/trust/security"
                element={<LandingPage />}
              />
              <Route
                path="/trust/privacy"
                element={<LandingPage />}
              />
              <Route
                path="/trust/compliance"
                element={<LandingPage />}
              />
              <Route
                path="/changelog"
                element={<ChangelogPage />}
              />
              <Route
                path="/test"
                element={<Test />}
              />

              {/* Auth Routes */}
              <Route path="/auth">
                <Route
                  index
                  element={
                    <Navigate
                      to="/auth/login"
                      replace
                    />
                  }
                />
                <Route
                  path="login"
                  element={<LoginPage />}
                />
                <Route
                  path="invite"
                  element={<AuthInvitePage />}
                />
                <Route
                  path="signup"
                  element={<SignUpPage />}
                />
                <Route
                  path="forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="verify-email"
                  element={<VerifyEmailPage />}
                />
              </Route>

              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <Onboarding />
                  </RequireAuth>
                }
              />

              {/* Super Admin Routes (require auth + super_admin role) */}
              <Route
                path="/super_admin"
                element={
                  <RequireRole role={USER_ROLES.SUPER_ADMIN}>
                    <Outlet />
                  </RequireRole>
                }
              >
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <AdminDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="files"
                  element={
                    <RequireAuth>
                      <AdminFilesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="institution/new-institution"
                  element={
                    <RequireAuth>
                      <NewInstitution />
                    </RequireAuth>
                  }
                />
                <Route
                  path="institution/institution-invites"
                  element={
                    <RequireAuth>
                      <AdminInstitutionInvites />
                    </RequireAuth>
                  }
                />
                <Route
                  path="institution/:institutionId"
                  element={
                    <RequireAuth>
                      <AdminInstitutionDetails />
                    </RequireAuth>
                  }
                />
                <Route
                  path="institution"
                  element={
                    <RequireAuth>
                      <AdminInstitution />
                    </RequireAuth>
                  }
                />
                <Route
                  path="users"
                  element={
                    <RequireAuth>
                      <AdminUsers />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId/topic/:topicId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <AdminCourseTopicLessonPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId/topic/:topicId"
                  element={
                    <RequireAuth>
                      <AdminCourseTopicPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId"
                  element={
                    <RequireAuth>
                      <AdminCourseContentPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId"
                  element={
                    <RequireAuth>
                      <AdminCourseContentPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <RequireAuth>
                      <AdminCoursesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="games/:gameId"
                  element={
                    <RequireAuth>
                      <AdminGameDetailPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="games"
                  element={
                    <RequireAuth>
                      <AdminGamesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="plan-catalog"
                  element={
                    <RequireAuth>
                      <AdminPlanCatalog />
                    </RequireAuth>
                  }
                />
                <Route
                  path="plan-catalog/:planId/entitlements"
                  element={
                    <RequireAuth>
                      <AdminPlanEntitlementsEditor />
                    </RequireAuth>
                  }
                />
                <Route
                  path="feature-definitions"
                  element={
                    <RequireAuth>
                      <AdminFeatureDefinitions />
                    </RequireAuth>
                  }
                />
                <Route
                  path="feature-definitions/:featureId"
                  element={
                    <RequireAuth>
                      <AdminFeatureDefinitionEditor />
                    </RequireAuth>
                  }
                />
                <Route
                  path="audit-logs"
                  element={
                    <RequireAuth>
                      <AdminAuditLogs />
                    </RequireAuth>
                  }
                />
                <Route
                  path="gdpr-request"
                  element={
                    <RequireAuth>
                      <AdminGdprRequest />
                    </RequireAuth>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <RequireAuth>
                      <AdminBilling />
                    </RequireAuth>
                  }
                />
                <Route
                  path="licenses"
                  element={
                    <RequireAuth>
                      <AdminLicenses />
                    </RequireAuth>
                  }
                />
                <Route
                  path="features"
                  element={
                    <RequireAuth>
                      <AdminFeatures />
                    </RequireAuth>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <RequireAuth>
                      <AdminAnalytics />
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <AdminSettings />
                    </RequireAuth>
                  }
                />
                <Route
                  path="system"
                  element={
                    <Navigate
                      to="/super_admin/settings"
                      replace
                    />
                  }
                />
              </Route>

              {/* Institution Admin Routes (require auth + institution_admin role) */}
              <Route
                path="/institution_admin"
                element={
                  <RequireRole role={USER_ROLES.INSTITUTION_ADMIN}>
                    <Outlet />
                  </RequireRole>
                }
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/institution_admin/dashboard"
                      replace
                    />
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <InstitutionAdminDashboardPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="teacher"
                  element={
                    <RequireAuth>
                      <InstitutionAdminTeachersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="students"
                  element={
                    <RequireAuth>
                      <InstitutionAdminStudentsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="licenses"
                  element={
                    <RequireAuth>
                      <InstitutionAdminLicensesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <RequireAuth>
                      <InstitutionAdminBillingPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="license"
                  element={
                    <RequireAuth>
                      <InstitutionAdminLicensePage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId/topic/:topicId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCourseTopicLessonPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId/topic/:topicId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCourseTopicPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId/published/:courseVersionId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCourseContentPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses/:courseId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCourseContentPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCoursesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="games/:gameId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminGameDetailPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="games"
                  element={
                    <RequireAuth>
                      <InstitutionAdminGamesPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <RequireAuth>
                      <InstitutionAdminAnalyticsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="users"
                  element={
                    <RequireAuth>
                      <InstitutionAdminUsersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="users/invite-users"
                  element={
                    <RequireAuth>
                      <InstitutionAdminInviteUsersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="classrooms"
                  element={
                    <RequireAuth>
                      <InstitutionAdminClassroomsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="classrooms/:classroomId"
                  element={
                    <RequireAuth>
                      <InstitutionAdminClassroomDetailPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="usage"
                  element={
                    <RequireAuth>
                      <InstitutionAdminUsagePage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="gdpr-request"
                  element={
                    <RequireAuth>
                      <InstitutionAdminGDPRRequestPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="cloud-storage"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCloudStoragePage />
                    </RequireAuth>
                  }
                />

                <Route
                  path="audit-logs"
                  element={
                    <RequireAuth>
                      <InstitutionAdminAuditLogsPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <InstitutionAdminSettingsPage />
                    </RequireAuth>
                  }
                />
              </Route>

              {/* Teacher Routes (require auth + onboarding + teacher role) */}
              <Route
                path="/teacher"
                element={
                  <RequireRole role={USER_ROLES.TEACHER}>
                    <Outlet />
                  </RequireRole>
                }
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/teacher/dashboard"
                      replace
                    />
                  }
                />
                <Route
                  path="chat"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherChat />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="cloud"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherCloudPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="files"
                  element={
                    <Navigate
                      to="/teacher/cloud"
                      replace
                    />
                  }
                />
                <Route
                  path="notes"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherNotesPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="notes/:noteId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherNotesPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="tasks"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherTasksPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/game/:gameId/analytics"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <GameRunAnalyticsPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/game/:gameId/play"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <ClassroomGamePlayPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/game/:gameId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <ClassroomGamePlayPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/topic/:topicId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <ClassroomCourseTopicLessonPublishedPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/topic/:topicId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <ClassroomTopicPublishedPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <ClassroomPublishedCoursePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherClassroomDetailPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherDashboard />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherCoursesPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="schedule"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherSchedulePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published/:courseVersionId/game/:gameId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCourseGamePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published/:courseVersionId/topic/:topicId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCourseTopicLessonPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published/:courseVersionId/topic/:topicId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCourseTopicPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published/:courseVersionId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCourseLessonPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published/:courseVersionId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCoursePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/published"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <PublishedCoursePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/release/review"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <CourseReleaseReviewPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <CourseLayout />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                >
                  <Route
                    index
                    element={<CoursePage />}
                  />
                  <Route
                    path="topic/:topicId"
                    element={<TopicPage />}
                  />
                  <Route
                    path="lesson/:lessonId"
                    element={<LessonRoute />}
                  />
                </Route>
                <Route
                  path="lesson/:id"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <LessonRedirect />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherSettingsPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="license"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherLicensePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="game-studio"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <GameStudio />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="canvas/:id"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <AppShell
                          role="teacher"
                          commandBarContext="game-studio"
                          className="flex flex-col h-screen"
                        >
                          <div className="flex-1 container">
                            <GameEditorCanvasWithProjectId />
                          </div>
                        </AppShell>
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="canvas/:id/preview"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <AppShell
                          role="teacher"
                          commandBarContext="game-studio"
                          className="box-border flex h-dvh max-h-dvh flex-col overflow-hidden pt-10"
                        >
                          <div className="container flex min-h-0 flex-1 flex-col">
                            <GamePreviewPage />
                          </div>
                        </AppShell>
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="canvas"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <Navigate
                          to="/teacher/game-studio"
                          replace
                        />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="view/:id"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TeacherViewPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
              </Route>

              {/* Student Routes (require auth + onboarding + student role) */}
              <Route
                path="/student"
                element={
                  <RequireRole role={USER_ROLES.STUDENT}>
                    <Outlet />
                  </RequireRole>
                }
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/student/dashboard"
                      replace
                    />
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentDashboard />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/game/:gameId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentPublishedCourseGamePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/game/:gameId/history"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentGameHistoryPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/topic/:topicId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentPublishedLessonPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published/topic/:topicId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentPublishedTopicPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="dashboard/classroom/:classroomId/course/:courseId/published"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentPublishedCoursePage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentSettingsPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="chat"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentChat />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="cloud"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentCloudPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="files"
                  element={
                    <Navigate
                      to="/student/cloud"
                      replace
                    />
                  }
                />
                <Route
                  path="notes"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentNotesPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="notes/:noteId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentNotesPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="tasks"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentTasksPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="view/:id"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <StudentViewPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <CourseDetailPage />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <LessonView />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
                <Route
                  path="course/:courseId/topic/:topicId"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <TopicView />
                      </RequireOnboarding>
                    </RequireAuth>
                  }
                />
              </Route>

              {/* Catch-all 404 route - must be last */}
              <Route
                path="*"
                element={<NotFoundPage />}
              />
            </Routes>
          </LessonProvider>
        </TopicProvider>
      </CourseProvider>
    </UserProvider>
  )
}

export { App }
