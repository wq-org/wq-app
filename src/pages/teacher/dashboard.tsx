import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/TableView';
import bgImage from '@/assets/img/bg-silver.jpeg';
import { useState } from 'react';

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
        teacherAvatar: 'https://randomuser.me/api/portraits/thumb/men/20.jpg',
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

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('modules');

    const handleClickTab = (id: string) => {
        const currentTab = getDashboardTabs('teacher').filter(
            (tab) => tab.id === id
        )[0].id;
        setSelectedTab(currentTab);
    };

    function handleCardView(id: string) {
        console.log('id :>> ', id);
    }

    return (
        <>
            <DashboardLayout
                imageUrl="https://github.com/hngngn.png"
                userName="John Doe"
                description="Software Engineer passionate about web development and teaching. this is the new feature"
                role="teacher"
                onClickTab={(tabId: string) => handleClickTab(tabId)}
            >
                {selectedTab === 'modules' && (
                    <CourseCardList
                        courses={dummyCourses}
                        onCourseView={handleCardView}
                    />
                )}

                {selectedTab === 'files' && <TableView />}
                {selectedTab === 'students' && <section>students</section>}
                {selectedTab === 'todos' && <section>todos</section>}
            </DashboardLayout>

            <CommandPalette role="teacher" />
        </>
    );
}
