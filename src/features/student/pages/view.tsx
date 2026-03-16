import { Navigate, useParams } from 'react-router-dom'

const StudentViewPage = () => {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      to={id ? `/profile/${id}` : '/student/dashboard'}
      replace
    />
  )
}

export { StudentViewPage }
