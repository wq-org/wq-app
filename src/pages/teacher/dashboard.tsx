import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/CourseCardList';
import {getDashboardTabs} from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import {useState, useEffect, useCallback} from 'react';
import {StudentCardList} from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import {useUser} from '@/contexts/UserContext';
import {useAvatarUrl} from '@/hooks/useAvatarUrl';
import {AVATAR_PLACEHOLDER_SRC} from '@/lib/constants';
import Spinner from '@/components/ui/spinner';
import {getTeacherCourses} from '@/features/auth/api/authApi';
import {useNavigate} from 'react-router-dom';
import DotWaveLoader from '@/components/common/DotWaveLoader';

const dummyStudents: any = [

];

const dummyFiles: any = [

];


export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');
    const [courses, setCourses] = useState<any[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const {profile, loading} = useUser();
    const {url: signedAvatarUrl} = useAvatarUrl(profile?.avatar_url || '');
    const navigate = useNavigate();
    // Fetch courses for the teacher
    const fetchCourses = useCallback(async () => {
        if (!profile?.user_id) return;

        setCoursesLoading(true);
        try {
            const data = await getTeacherCourses(profile.user_id);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setCoursesLoading(false);
        }
    }, [profile?.user_id]);

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
        console.log('id :>> ', id);
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
