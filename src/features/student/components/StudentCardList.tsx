import { StudentCard } from './StudentCard'
import type { StudentCardProps } from '../types/student.types'
import { EmptyStudentView } from './EmptyStudentView'

interface StudentCardListProps {
  students: StudentCardProps[]
}

export function StudentCardList({ students }: StudentCardListProps) {
  if (students.length === 0) {
    return <EmptyStudentView />
  }

  return (
    <div className="flex flex-wrap gap-8 ">
      {students.map((student, idx) => (
        <StudentCard
          key={idx}
          {...student}
        />
      ))}
    </div>
  )
}
