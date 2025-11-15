import {Routes, Route} from 'react-router-dom';
import { LoginPage, SignUpPage, VerifyEmailPage, RoleSelectionPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth';
import Institution from './features/institution/pages/institution';
import Test from './user/pages/test';

import StudentDashboard from './features/student/pages/dashboard';
import StudentSettings from './features/student/pages/settings';

import TeacherDashboard from './features/teacher/pages/dashboard';
import TeacherSettings from './features/teacher/pages/settings';
import GameStudio from './features/teacher/pages/game-studio';
import Course from './features/teacher/pages/course';
import Error404 from './components/404';
import Lesson from './features/lessons/pages/lesson';
import Onboarding from './features/onboarding/pages/onboarding';

import {UserProvider} from './contexts/user';
import {CourseProvider} from './contexts/course';
import {LessonProvider} from './contexts/lesson';
import RequireAuth from './components/auth/RequireAuth';
import RequireOnboarding from './components/auth/RequireOnboarding';
import {Toaster} from './components/ui/sonner';
import GameEditorCanvas from './features/game-studio/components/GameEditorCanvas';
import AdminDashboard from './features/admin/pages/dashboard';  
import { ImageTermMatchGame } from './features/games/image-term-match';
import ImagePinMarkGame from './features/games/image-pin-mark/ImagePinMarkGame';


function App() {
    return (
        <UserProvider>
            <CourseProvider>
                <LessonProvider>
                    <Toaster />
                    <Routes>
                        <Route path="/" element={<RoleSelectionPage />} />
                        <Route path="/game-studio/image-term-match" element={<ImageTermMatchGame />} />
                        <Route path="/game-studio/image-pin-mark" element={<ImagePinMarkGame />} />

                        {/* Auth Routes */}
                        <Route path="/auth">
                            <Route path="login" element={<LoginPage />} />
                            <Route path="signup" element={<SignUpPage />} />
                            <Route path="forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="reset-password" element={<ResetPasswordPage />} />
                            <Route path="verify-email" element={<VerifyEmailPage />} />
                        </Route>

                        <Route path="/onboarding" element={
                            <RequireAuth>
                                <Onboarding />
                            </RequireAuth>
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
                            <Route path="canvas" element={
                                <RequireAuth>
                                    <RequireOnboarding>
                                        <GameEditorCanvas />
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
                </LessonProvider>
            </CourseProvider>
        </UserProvider>
    );
}

export default App;
