import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import { useState } from 'react';
import { StudentCardList } from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import AstridAvatar from '@/assets/img/avatars/Astrid.png';

const dummyCourses: any = [
   
];

const dummyStudents: any = [
 
];

const dummyFiles: any = [
 
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
                imageUrl={AstridAvatar}
                userName="@Astrid"
                email="astrid@wq-health.com"
                linkedInUrl="linkedin.com/in/astrid"
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
                    <TableView files={dummyFiles} />
                )}
                {selectedTab === 'students' && (
                    <StudentCardList students={dummyStudents} />
                )}
            </DashboardLayout>

            <CommandPalette role="teacher" />
        </>
    );
}
