import { useParams } from 'react-router-dom'
import { DotWaveLoader } from '@/components/shared'
import { useProfile } from '../hooks/useProfile'
import { TeacherProfileContent } from './TeacherProfileContent'
import { StudentProfileContent } from './StudentProfileContent'
import { InstitutionProfileContent } from './InstitutionProfileContent'

export function ProfileView() {
  const { id } = useParams<{ id: string }>()
  const { profile, loading, error } = useProfile(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DotWaveLoader />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  // Route to appropriate content component based on role
  // institutionAdmin and superAdmin roles - treat as teacher for now
  const role = profile.role?.toLowerCase()

  if (role === 'teacher') {
    return (
      <TeacherProfileContent
        profile={profile}
        userId={profile.user_id}
      />
    )
  }

  if (role === 'student') {
    return <StudentProfileContent profile={profile} />
  }

  if (role === 'institution') {
    return <InstitutionProfileContent institutionId={profile.user_id} />
  }

  // If role doesn't match, show error
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Invalid profile type</p>
    </div>
  )
}
