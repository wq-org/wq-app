import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import SignUp from './pages/auth/signUp';
import RoleAuth from './pages/auth/role-auth';
import StudentDashboard from './pages/student/dashboard';
import TeacherDashboard from './pages/teacher/dashboard';

import UserContextProvider from './store/UserContext';
function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path="/" element={<RoleAuth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/teacher">
                    <Route path="dashboard" element={<TeacherDashboard />} />
                </Route>
                <Route path="/student">
                    <Route path="dashboard" element={<StudentDashboard />} />
                </Route>
            </Routes>
        </UserContextProvider>
    );
}

export default App;
