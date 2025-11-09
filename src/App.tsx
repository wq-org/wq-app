import {Routes, Route} from 'react-router-dom';
import LoginPage from './pages/auth/login';
import SignUpPage from './pages/auth/signUp';
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPasswordPage from './pages/auth/reset-password';
import VerifyEmailPage from './pages/auth/verify-email';
import RoleAuth from './pages/auth/role-auth';
import Institution from './pages/institution';
import Test from './pages/Test';

import StudentDashboard from './pages/student/dashboard';
import StudentSettings from './pages/student/settings';

import TeacherDashboard from './pages/teacher/dashboard';
import TeacherSettings from './pages/teacher/settings';
import GameStudio from './pages/teacher/game-studio';
import UserContextProvider from './store/UserContext';
import Course from './pages/teacher/course';
import Error404 from './pages/404';
import Lesson from './features/lessons/pages/Lesson';
import Onboarding from './features/onboarding/onboarding';

import AdminDashboard from './pages/admin/dashboard';

import {UserProvider} from './contexts/UserContext';
import {CourseProvider} from './contexts/CourseContext';
import {LessonProvider} from './contexts/LessonContext';
import RequireAuth from './components/auth/RequireAuth';
import RequireOnboarding from './components/auth/RequireOnboarding';
import {Toaster} from './components/ui/sonner';

function App() {
    return (
        <UserProvider>
            <CourseProvider>
                <LessonProvider>
            <UserContextProvider>
                <Toaster />
                <Routes>
                    <Route path="/" element={<RoleAuth />} />

                    {/* Auth Routes */}
                    <Route path="/auth">
                        <Route path="login" element={<LoginPage />} />
                        <Route path="signup" element={<SignUpPage />} />
                        <Route path="forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="reset-password" element={<ResetPasswordPage />} />
                        <Route path="verify-email" element={<VerifyEmailPage />} />
                    </Route>

                    {/* Legacy auth routes for backward compatibility */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    {/* Onboarding (requires auth but not onboarding status) */}
                    <Route path="/onboarding" element={

                        <Onboarding />

                    } />

                    {/* Admin Routes (require auth + onboarding) */}
                    <Route path="/admin">
                        <Route path="dashboard" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <AdminDashboard />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                    </Route>

                    {/* Teacher Routes (require auth + onboarding) */}
                    <Route path="/teacher">
                        <Route path="dashboard" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <TeacherDashboard />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
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
                        <Route path="lesson/:id" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <Lesson />
                             </RequireOnboarding>
                            </RequireAuth>
                        } />
                        <Route path="settings" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <TeacherSettings />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                        <Route path="game-studio" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <GameStudio />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                        <Route path="institution" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <Institution />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                    </Route>

                    {/* Student Routes (require auth + onboarding) */}
                    <Route path="/student">
                        <Route path="dashboard" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <StudentDashboard />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                        <Route path="settings" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <StudentSettings />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                        <Route path="institution" element={
                            <RequireAuth>
                                <RequireOnboarding>
                                    <Institution />
                                </RequireOnboarding>
                            </RequireAuth>
                        } />
                    </Route>

                    <Route path="/test" element={<Test />} />
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </UserContextProvider>
                </LessonProvider>
            </CourseProvider>
        </UserProvider>
    );
}

export default App;
