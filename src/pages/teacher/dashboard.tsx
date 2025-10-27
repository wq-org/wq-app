import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';

import bgImage from '@/assets/img/bg-silver.jpeg';

export default function Dashboard() {
    const handleCardView = (id: string) => {
        alert(`View course: ${id}`);
        // navigate(`/courses/${id}`);
    };
    const dummyCourses = [
        {
            id: '1',
            title: 'React Essentials',
            description:
                'Learn the basics of React and modern frontend development.',
            image: bgImage,
            teacherAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            teacherInitials: 'RG',
        },
        {
            id: '2',
            title: 'Advanced TypeScript',
            description:
                'Deep dive into TypeScript types, generics, and best practices.',
            image: bgImage,
            teacherAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
            teacherInitials: 'JM',
        },
        {
            id: '3',
            title: 'Fullstack with Supabase',
            description: 'Build real-world apps using Supabase and React.',
            image: bgImage,
            teacherAvatar: 'https://github.com/shadcn.png',
            teacherInitials: 'AS',
        },
        {
            id: '3',
            title: 'Fullstack with Supabase',
            description: 'Build real-world apps using Supabase and React.',
            image: bgImage,
            teacherAvatar:
                'https://randomuser.me/api/portraits/thumb/men/20.jpg',
            teacherInitials: 'AS',
        },
        {
            id: '3',
            title: 'Fullstack with Supabase',
            description: 'Build real-world apps using Supabase and React.',
            image: bgImage,
            teacherAvatar: 'https://github.com/evilrabbit.png',
            teacherInitials: 'AS',
        },
    ];
    return (
        <>
            <DashboardLayout
                imageUrl="https://github.com/hngngn.png"
                userName="John Doe"
                description="Software Engineer passionate about web development and teaching. this is the new feature"
                role="teacher"
            >
                <CourseCardList
                    courses={dummyCourses}
                    onCourseView={handleCardView}
                />
            </DashboardLayout>

            <CommandPalette role="teacher" />
        </>
    );
}
