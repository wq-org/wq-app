import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useUser } from './contexts/user'
import {
  LoginPage,
  SignUpPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './features/auth'
import Institution from './features/institution/pages/institution'
import Test from './user/pages/test'
import Home from './user/pages/home'
import LandingPage from './user/pages/landing'
import ChangelogPage from './user/pages/changelog'

import StudentDashboard from './features/student/pages/dashboard'
import StudentSettings from './features/student/pages/settings'
import StudentChat from './features/student/pages/chat'
import TeacherChat from './features/teacher/pages/chat'

import TeacherDashboard from './features/teacher/pages/dashboard'
import TeacherSettings from './features/teacher/pages/settings'
import GameStudio from './features/teacher/pages/game-studio'
import PlayGamePage from './features/game-play/pages/PlayGamePage'
import { Error404 } from './components'
import CourseLayout from './features/course/components/CourseLayout'
import CoursePage from './features/course/pages/course'
import LessonPage from './features/course/pages/lesson'
import CourseView from './features/course/pages/CourseView'
import LessonView from './features/course/pages/LessonView'
import LessonRedirect from './features/course/pages/LessonRedirect'
import Onboarding from './features/onboarding/pages/onboarding'

import { UserProvider } from './contexts/user'
import { CourseProvider } from './contexts/course'
import { LessonProvider } from './contexts/lesson'
import RequireAuth from './components/auth/RequireAuth'
import RequireOnboarding from './components/auth/RequireOnboarding'
import { Toaster } from './components/ui/sonner'
import AppWrapper from './components/layout/AppWrapper'
import GameEditorCanvas from './features/game-studio/components/GameEditorCanvas'
import TeacherViewPage from './features/teacher/pages/view'
import InstitutionViewPage from './features/institution/pages/view'
import StudentViewPage from './features/student/pages/view'
import ProfileViewPage from './features/profiles/pages/view'

import AdminUsers from './features/admin/pages/users'
import AdminInstitution from './features/admin/pages/institution'
import AdminAnalytics from './features/admin/pages/analytics'
import AdminDashboard from './features/admin/pages/dashboard'
import AdminBilling from './features/admin/pages/billing'
import AdminFeatures from './features/admin/pages/features'
import AdminSystem from './features/admin/pages/system'
import AdminLicenses from './features/admin/pages/licenses'
import NewInstitution from './features/admin/pages/newInstitution'

function GameEditorCanvasWithProjectId() {
  const { id } = useParams<{ id: string }>()
  return <GameEditorCanvas projectId={id ?? undefined} />
}

function PlayRouteWrapper() {
  const { getRole } = useUser()
  const role = getRole() ?? 'student'
  return (
    <AppWrapper
      role={role}
      className="flex flex-col h-screen"
    >
      <PlayGamePage />
    </AppWrapper>
  )
}

function App() {
  return (
    <UserProvider>
      <CourseProvider>
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
                  path="lesson/:lessonId"
                  element={<LessonPage />}
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
                      <TeacherSettings />
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
                      <AppWrapper
                        role="teacher"
                        commandBarContext="game-studio"
                        className="flex flex-col h-screen"
                      >
                        <div className="flex-1 w-full">
                          <GameEditorCanvasWithProjectId />
                        </div>
                      </AppWrapper>
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
                      <StudentSettings />
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
              element={<Error404 />}
            />
          </Routes>
        </LessonProvider>
      </CourseProvider>
    </UserProvider>
  )
}

export default App
