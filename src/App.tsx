import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import SignUp from './pages/auth/signUp';
// import RoleAuth from './pages/auth/role-auth';
import Dashboard from './pages/teacher/dashboard';

import UserContextProvider from './store/UserContext';
function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="teacher/dashboard" element={<Dashboard />} />
            </Routes>
        </UserContextProvider>
    );
}

export default App;
