// src/features/courses/components/CourseCardList.tsx

import CourseCard from './CourseCard';
import type { CourseCardProps } from './CourseCard';

interface CourseCardListProps {
    courses: CourseCardProps[];
    onCourseView?: (id: string) => void;
}

export default function CourseCardList({
    courses,
    onCourseView,
}: CourseCardListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
                <CourseCard
                    key={idx}
                    {...course}
                    onView={() => onCourseView?.(course.title)}
                />
            ))}
        </div>
    );
}
