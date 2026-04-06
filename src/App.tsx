import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import {
  LoginPage,
  SignUpPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  RequireAuth,
  RequireOnboarding,
} from '@/features/auth'
import Test from './user/pages/test'
import Home from './user/pages/home'
import LandingPage from './user/pages/landing'
import ChangelogPage from './user/pages/changelog'
import { Institution, InstitutionViewPage } from '@/features/institution'
import {
  StudentDashboard,
  StudentSettingsPage,
  StudentChat,
  StudentViewPage,
} from '@/features/student'
import {
  TeacherDashboard,
  TeacherSettingsPage,
  GameStudio,
  TeacherChat,
  TeacherViewPage,
} from '@/features/teacher'
import { PlayGamePage } from '@/features/game-play'
import { NotFoundPage } from './user/pages/not-found'
import { CourseLayout, CoursePage, CourseView } from '@/features/course'
import { LessonRedirect, LessonRoute, LessonView } from '@/features/lesson'
import { TopicPage, TopicView } from '@/features/topic'
import { Onboarding } from '@/features/onboarding'

import { UserProvider } from './contexts/user'
import { CourseProvider } from './contexts/course'
import { LessonProvider } from './contexts/lesson'
import { TopicProvider } from './contexts/topic'
import { Toaster } from './components/ui/sonner'
import { AppShell } from './components/layout'
import { GameEditorCanvas } from '@/features/game-studio'
import { ProfileViewPage } from '@/features/profile'
import {
  AdminAuditLogs,
  AdminAnalytics,
  AdminBilling,
  AdminDashboard,
  AdminFeatureDefinitions,
  AdminFeatures,
  AdminGdprRequest,
  AdminInstitution,
  AdminLicenses,
  NewInstitution,
  AdminPlanCatalog,
  AdminSystem,
  AdminUsers,
} from '@/features/admin'
import {
  InstitutionAdminDashboardPage,
  InstitutionAdminTeachersPage,
  InstitutionAdminStudentsPage,
  InstitutionAdminLicensesPage,
  InstitutionAdminBillingPage,
  InstitutionAdminCoursesPage,
  InstitutionAdminAnalyticsPage,
  InstitutionAdminSettingsPage,
} from '@/features/institution-admin'

const GameEditorCanvasWithProjectId = () => {
  const { id } = useParams<{ id: string }>()
  return <GameEditorCanvas projectId={id ?? undefined} />
}

const PlayRouteWrapper = () => {
  const { getRole } = useUser()
  const role = getRole() ?? 'student'
  return (
    <AppShell
      role={role}
      className="flex flex-col h-screen"
    >
      <PlayGamePage />
    </AppShell>
  )
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
                path="/success/end-learning-apathy"
                element={<LandingPage />}
              />
              <Route
                path="/success/intuitive-gaming"
                element={<LandingPage />}
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
                path="/platform/workspace"
                element={<LandingPage />}
              />
              <Route
                path="/platform/game-studio"
                element={<LandingPage />}
              />
              <Route
                path="/platform/analytics"
                element={<LandingPage />}
              />
              <Route
                path="/platform/collaboration"
                element={<LandingPage />}
              />
              <Route
                path="/platform/pricing"
                element={<LandingPage />}
              />
              <Route
                path="/science/wq-concept"
                element={<LandingPage />}
              />
              <Route
                path="/science/evidence"
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
                element={<LandingPage />}
              />
              <Route
                path="/success/wound-care"
                element={<LandingPage />}
              />
              <Route
                path="/science/blog"
                element={<LandingPage />}
              />
              <Route
                path="/science/help-center"
                element={<LandingPage />}
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
                path="/trust/licenses"
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

              {/* Super Admin Routes (require auth) */}
              <Route path="/super_admin">
                <Route
                  path="dashboard"
                  element={
                    <RequireAuth>
                      <AdminDashboard />
                    </RequireAuth>
                  }
                />

                <Route
                  path="institution/new-institution"
                  element={<NewInstitution />}
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
                  path="plan-catalog"
                  element={
                    <RequireAuth>
                      <AdminPlanCatalog />
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
                  path="system"
                  element={
                    <RequireAuth>
                      <AdminSystem />
                    </RequireAuth>
                  }
                />
              </Route>

              {/* Institution Admin Routes (require auth) */}
              <Route path="/institution_admin">
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
                  path="courses"
                  element={
                    <RequireAuth>
                      <InstitutionAdminCoursesPage />
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
                  path="settings"
                  element={
                    <RequireAuth>
                      <InstitutionAdminSettingsPage />
                    </RequireAuth>
                  }
                />
              </Route>

              {/* Teacher Routes (require auth + onboarding) */}
              <Route path="/teacher">
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
                  path="institution"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <Institution />
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

              {/* Student Routes (require auth + onboarding) */}
              <Route path="/student">
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
                  path="institution"
                  element={
                    <RequireAuth>
                      <RequireOnboarding>
                        <Institution />
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
                        <CourseView />
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

              {/* Institution Routes (require auth + onboarding) */}
              <Route
                path="/institution/:id"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <InstitutionViewPage />
                    </RequireOnboarding>
                  </RequireAuth>
                }
              />

              {/* Centralized Profile Routes (require auth + onboarding) */}
              <Route
                path="/profile/:id"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <ProfileViewPage />
                    </RequireOnboarding>
                  </RequireAuth>
                }
              />

              {/* Play game (student and teacher) - root level so /play/:gameId works */}
              <Route
                path="/play/:gameId"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <PlayRouteWrapper />
                    </RequireOnboarding>
                  </RequireAuth>
                }
              />

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
