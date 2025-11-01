import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import SignUp from './pages/auth/signUp';
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
import Lession from './pages/teacher/lession';
function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path="/" element={<RoleAuth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/teacher">
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="course" element={<Course />} />
                    <Route path="lession" element={<Lession />} />
                    <Route path="settings" element={<TeacherSettings />} />
                    <Route path="game-studio" element={<GameStudio />} />
                    <Route path="institution" element={<Institution />} />
                </Route>
                <Route path="/student">
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="settings" element={<StudentSettings />} />
                    <Route path="institution" element={<Institution />} />
                </Route>
                <Route path="/test" element={<Test />} />
                <Route path="*" element={<Error404 />} />
            </Routes>
        </UserContextProvider>
    );
}

export default App;
