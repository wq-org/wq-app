import { StudentCard } from './StudentCard';
import type { StudentCardProps } from './StudentCard';

interface StudentCardListProps {
    students: StudentCardProps[];
}

export function StudentCardList({ students }: StudentCardListProps) {
    return (
        <div className="flex flex-wrap gap-8 ">
            {students.map((student, idx) => (
                <StudentCard key={idx} {...student} />
            ))}
        </div>
    );
}
