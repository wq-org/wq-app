import { Navigate } from 'react-router-dom'

const StudentViewPage = () => (
  <Navigate
    to="/student/dashboard"
    replace
  />
)

export { StudentViewPage }
