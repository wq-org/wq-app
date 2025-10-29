import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/TableView';
import bgImage from '@/assets/img/bg-silver.jpeg';
import { useState } from 'react';
import { StudentCardList } from '@/features/student/StudentCardList';
import filesJson from '@/data/files.json';
import type { FileItem } from '@/features/files/data/files';

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

const dummyStudents = [
    {
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        imgSrc: 'https://github.com/hngngn.png',
    },
    {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        imgSrc: 'https://github.com/evilrabbit.png',
    },
    {
        name: 'Alex Müller',
        username: 'alexmuller',
        email: 'alex.mueller@example.com',
        imgSrc: 'https://github.com/shadcn.png',
    },
    {
        name: 'Mia Chen',
        username: 'miachen',
        email: 'mia.chen@example.com',
        imgSrc: 'https://github.com/unovue.png',
    },
];

// replaced local sample files with JSON data from src/data/files.json

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

                {selectedTab === 'files' && (
                    <TableView files={filesJson as unknown as FileItem[]} />
                )}
                {selectedTab === 'students' && (
                    <StudentCardList students={dummyStudents} />
                )}
            </DashboardLayout>

            <CommandPalette role="teacher" />
        </>
    );
}
