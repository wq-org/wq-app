import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import { useState } from 'react';
import { StudentCardList } from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import { useFullProfile } from '@/hooks/useFullProfile';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';

const dummyCourses: any = [
   
];

const dummyStudents: any = [
 
];

const dummyFiles: any = [
 
];

// replaced local sample files with JSON data from src/data/files.json

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');
    const { profile, loading } = useFullProfile();
    const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url);

    const handleClickTab = (id: string) => {
        const currentTab = getDashboardTabs('teacher').filter(
            (tab) => tab.id === id
        )[0].id;
        setSelectedTab(currentTab);
    };

    function handleCardView(id: string) {
        console.log('id :>> ', id);
    }

    if (loading) return null;

    return (
        <>
            <DashboardLayout
                imageUrl={signedAvatarUrl || undefined}
                userName={profile?.display_name || profile?.username || '@Teacher'}
                email={profile?.email || undefined}
                description={profile?.description || 'Welcome to your dashboard'}
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
