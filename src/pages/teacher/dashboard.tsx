import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import { getDashboardTabs } from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import { useState } from 'react';
import { StudentCardList } from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import { useUser } from '@/contexts/UserContext';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants';
import PulsarLoading from '@/components/ui/pulsar-loading';

const dummyCourses: any = [
   
];

const dummyStudents: any = [
 
];

const dummyFiles: any = [
 
];


export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');
    const { profile, loading } = useUser();
    const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '');

    const handleClickTab = (id: string) => {
        const currentTab = getDashboardTabs('teacher').filter(
            (tab) => tab.id === id
        )[0].id;
        setSelectedTab(currentTab);
    };

    function handleCardView(id: string) {
        console.log('id :>> ', id);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <PulsarLoading variant="gray" size="xl" speed={1750} />
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
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
