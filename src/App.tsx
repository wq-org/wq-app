import { Routes, Route } from 'react-router-dom'
import {
  LoginPage,
  SignUpPage,
  VerifyEmailPage,
  RoleSelectionPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './features/auth'
import Institution from './features/institution/pages/institution'
import Test from './user/pages/test'

import StudentDashboard from './features/student/pages/dashboard'
import StudentSettings from './features/student/pages/settings'
import StudentChat from './features/student/pages/chat'
import TeacherChat from './features/teacher/pages/chat'

import TeacherDashboard from './features/teacher/pages/dashboard';
import TeacherSettings from './features/teacher/pages/settings';
import GameStudio from './features/teacher/pages/game-studio';
import Course from './features/teacher/pages/course';
import { Error404 } from './components'
import Lesson from './features/lessons/pages/lesson';
import Onboarding from './features/onboarding/pages/onboarding';

import {UserProvider} from './contexts/user';
import {CourseProvider} from './contexts/course';
import {LessonProvider} from './contexts/lesson';
import RequireAuth from './components/auth/RequireAuth';
import RequireOnboarding from './components/auth/RequireOnboarding';
import {Toaster} from './components/ui/sonner';
import AppWrapper from './components/layout/AppWrapper';
import GameEditorCanvas from './features/game-studio/components/GameEditorCanvas';
import AdminDashboard from './features/admin/pages/dashboard';  
import TeacherViewPage from './features/teacher/pages/view'
import InstitutionViewPage from './features/institution/pages/view'
import StudentViewPage from './features/student/pages/view'
import ProfileViewPage from './features/profiles/pages/view'

function App() {
  return (
    <UserProvider>
      <CourseProvider>
        <LessonProvider>
          <Toaster />
          <Routes>
            <Route
              path="/"
              element={<RoleSelectionPage />}
            />
            <Route
              path="/test"
              element={<Test />}
            />

            {/* Auth Routes */}
            <Route path="/auth">
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

            {/* Admin Routes (require auth + onboarding) */}
            <Route path="/admin">
              <Route
                path="dashboard"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <AdminDashboard />
                    </RequireOnboarding>
                  </RequireAuth>
                }
              />
            </Route>

            {/* Teacher Routes (require auth + onboarding) */}
            <Route path="/teacher">
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
                path="course/:id"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <Course />
                    </RequireOnboarding>
                  </RequireAuth>
                }
              />
              <Route
                path="lesson/:id"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <Lesson />
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
                path="canvas"
                element={
                  <RequireAuth>
                    <RequireOnboarding>
                      <AppWrapper role="teacher" commandBarContext="game-studio" className="flex flex-col h-screen">
                        <div className="flex-1 w-full">
                          <GameEditorCanvas />
                        </div>
                      </AppWrapper>
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
