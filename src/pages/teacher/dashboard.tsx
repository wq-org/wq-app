import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/components/CourseCardList';
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
import type {FileItem} from '@/features/files/types/files.types';

const dummyStudents: any = [

];

const dummyFiles: FileItem[] = [
    {
        id: 1,
        filename: 'Course_Introduction.docx',
        description: 'Introduction to the course materials',
        type: 'Word',
        size: '850 KB',
    },
    {
        id: 2,
        filename: 'Lesson_Plan_Template.pptx',
        description: 'Template for creating lesson plans',
        type: 'PPT',
        size: '2.4 MB',
    },
    {
        id: 3,
        filename: 'Student_Grades.xlsx',
        description: 'Quarterly student performance data',
        type: 'Exl',
        size: '1.1 MB',
    },
    {
        id: 4,
        filename: 'Syllabus_2024.pdf',
        description: 'Course syllabus and requirements',
        type: 'PDF',
        size: '900 KB',
    },
    {
        id: 5,
        filename: 'Assignment_Guidelines.docx',
        description: 'Guidelines for student assignments',
        type: 'Word',
        size: '650 KB',
    },
    {
        id: 6,
        filename: 'Exam_Results.xlsx',
        description: 'Final exam results and statistics',
        type: 'Exl',
        size: '1.8 MB',
    },
    {
        id: 7,
        filename: 'Course_Overview.pdf',
        description: 'Overview of course objectives',
        type: 'PDF',
        size: '1.2 MB',
    },
    {
        id: 8,
        filename: 'Teaching_Resources.pptx',
        description: 'Additional teaching resources',
        type: 'PPT',
        size: '3.1 MB',
    },
    {
        id: 9,
        filename: 'Student_Feedback.docx',
        description: 'Compiled student feedback',
        type: 'Word',
        size: '450 KB',
    },
    {
        id: 10,
        filename: 'Attendance_Record.xlsx',
        description: 'Student attendance tracking',
        type: 'Exl',
        size: '750 KB',
    },
    {
        id: 11,
        filename: 'Course_Materials.pdf',
        description: 'Essential course reading materials',
        type: 'PDF',
        size: '2.3 MB',
    },
    {
        id: 12,
        filename: 'Presentation_Template.pptx',
        description: 'Reusable presentation template',
        type: 'PPT',
        size: '1.9 MB',
    },
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
