import { Navigate, useParams } from 'react-router-dom'

export default function TeacherViewPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      to={id ? `/profile/${id}` : '/teacher/dashboard'}
      replace
    />
  )
}
