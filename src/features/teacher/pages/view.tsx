import { Navigate } from 'react-router-dom'

const TeacherViewPage = () => (
  <Navigate
    to="/teacher/dashboard"
    replace
  />
)

export { TeacherViewPage }
