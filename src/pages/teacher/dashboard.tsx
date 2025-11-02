import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/TableView';
// import bgImage from '@/assets/img/bg-silver.jpeg';
import { useState } from 'react';
import { StudentCardList } from '@/features/student/StudentCardList';
import filesJson from '@/data/files.json';
import type { FileItem } from '@/features/files/data/files';
import EmptyCourseView from '@/features/courses/EmptyCourseView';

const dummyCourses: any = [
   
];

const dummyStudents: any = [
 
];

// replaced local sample files with JSON data from src/data/files.json

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');

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
                {selectedTab === 'courses' && (
                    dummyCourses.length === 0 ? (
                            <EmptyCourseView
                            />
                        ) : (
                            <CourseCardList
                                courses={dummyCourses}
                                onCourseView={handleCardView}
                            />
                        )
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
