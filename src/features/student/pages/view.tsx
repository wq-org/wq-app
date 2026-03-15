import { Navigate, useParams } from 'react-router-dom'

export function StudentViewPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      to={id ? `/profile/${id}` : '/student/dashboard'}
      replace
    />
  )
}
