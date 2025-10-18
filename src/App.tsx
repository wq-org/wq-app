import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/login'
import SignUp from './pages/auth/signUp'
import AuthRole from './pages/auth/auth-role'
function App() {
    return (
        <Routes>
            <Route path="/" element={<AuthRole />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
    )
}

export default App
