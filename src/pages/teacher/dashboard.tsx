import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import {getDashboardTabs} from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import {useState, useEffect} from 'react';
import {StudentCardList} from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import {useUser} from '@/contexts/UserContext';
import {useCourseContext} from '@/contexts/CourseContext';
import {useAvatarUrl} from '@/hooks/useAvatarUrl';
import {AVATAR_PLACEHOLDER_SRC} from '@/lib/constants';
import Spinner from '@/components/ui/spinner';
import {useNavigate} from 'react-router-dom';
import DotWaveLoader from '@/components/common/DotWaveLoader';

const dummyStudents: any = [

];

const dummyFiles: any = [

];


export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');
    const {profile, loading} = useUser();
    const {courses, loading: coursesLoading, fetchCourses, setSelectedCourse} = useCourseContext();
    const {url: signedAvatarUrl} = useAvatarUrl(profile?.avatar_url || '');
    const navigate = useNavigate();

    // Fetch courses when profile is loaded
    useEffect(() => {
        if (profile?.user_id && !loading) {
            fetchCourses();
        }
    }, [profile?.user_id, loading, fetchCourses]);

    const handleClickTab = (id: string) => {
        const currentTab = getDashboardTabs('teacher').filter(
            (tab) => tab.id === id
        )[0].id;
        setSelectedTab(currentTab);
    };

    function handleCardView(id: string) {
        // Find the course in the list and store it in context
        const course = courses.find(c => c.id === id);
        if (course) {
            setSelectedCourse(course);
        }
        navigate(`/teacher/course/${id}`);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <DotWaveLoader />
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
                    coursesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner variant="gray" size="lg" speed={1750} />
                        </div>
                    ) : courses.length === 0 ? (
                        <EmptyCourseView />
                    ) : (
                        <CourseCardList
                            courses={courses}
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

            <CommandPalette role="teacher" onCourseCreated={fetchCourses} />
        </>
    );
}
