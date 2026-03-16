import { Navigate, useParams } from 'react-router-dom'

const TeacherViewPage = () => {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      to={id ? `/profile/${id}` : '/teacher/dashboard'}
      replace
    />
  )
}

export { TeacherViewPage }
