import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import SignUp from './pages/auth/signUp'
import RoleAuth from './pages/auth/role-auth'
function App() {
    return (
        <Routes>
            <Route path="/" element={<RoleAuth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
    )
}

export default App
