import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import CourseCardList from '@/features/courses/components/CourseCardList';
import {getDashboardTabs} from '@/lib/dashboard-config';
import TableView from '@/features/files/components/TableView';
import {useState, useEffect, useCallback} from 'react';
import {StudentCardList} from '@/features/student/StudentCardList';
import EmptyCourseView from '@/features/courses/EmptyCourseView';
import {useUser} from '@/contexts/user';
import {useCourse} from '@/contexts/course';
import {useAvatarUrl} from '@/features/onboarding/hooks/useAvatarUrl';
import {AVATAR_PLACEHOLDER_SRC} from '@/lib/constants';
import Spinner from '@/components/ui/spinner';
import {useNavigate} from 'react-router-dom';
import DotWaveLoader from '@/components/common/DotWaveLoader';
import type {FileItem} from '@/features/files/types/files.types';
import {fetchFilesByRole} from '@/features/upload-files/api/uploadFilesApi';

const dummyStudents: any = [

];

// Helper function to map file extension to FileItem type
function getFileTypeFromExtension(filename: string): FileItem['type'] {
    const extension = filename.split('.').pop()?.toUpperCase() || '';
    
    if (['DOC', 'DOCX', 'TXT'].includes(extension)) {
        return 'Word';
    }
    if (extension === 'PDF') {
        return 'PDF';
    }
    if (['XLS', 'XLSX', 'CSV'].includes(extension)) {
        return 'Exl';
    }
    if (['PPT', 'PPTX'].includes(extension)) {
        return 'PPT';
    }
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(extension)) {
        return 'Image';
    }
    if (['MP4', 'AVI', 'MOV', 'WMV'].includes(extension)) {
        return 'Video';
    }
    return 'PDF'; // Default fallback
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}




export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState<string>('courses');
    const {profile, loading, getUserId, getRole} = useUser();
    const {courses, loading: coursesLoading, fetchCourses, setSelectedCourse} = useCourse();
    const {url: signedAvatarUrl} = useAvatarUrl(profile?.avatar_url || '');
    const navigate = useNavigate();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [filesLoading, setFilesLoading] = useState(false);

    // Fetch courses when profile is loaded
    useEffect(() => {
        if (profile?.user_id && !loading) {
            fetchCourses();
        }
    }, [profile?.user_id, loading, fetchCourses]);

    // Function to load files - extracted so it can be called from onFilesUploaded
    const loadFiles = useCallback(async () => {
        const userId = getUserId();
        const role = getRole()?.toLowerCase();
        
        if (!userId || !role || loading) {
            return;
        }

        setFilesLoading(true);
        try {
            const result = await fetchFilesByRole(role, userId, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' },
            });

            if (result.success && result.files) {
                const mappedFiles: FileItem[] = result.files.map((file, index) => {
                    const fileSize = (file as any).size || file.metadata?.size || 0;
                    const storagePath = `${role}/${userId}/${file.name}`;
                    return {
                        id: index + 1,
                        filename: file.name,
                        description: '',
                        type: getFileTypeFromExtension(file.name),
                        size: formatFileSize(fileSize),
                        storagePath,
                    };
                });
                setFiles(mappedFiles);
            } else {
                console.error('Failed to fetch files:', result.error);
                setFiles([]);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            setFiles([]);
        } finally {
            setFilesLoading(false);
        }
    }, [getUserId, getRole, loading]);

    // Fetch files when profile is loaded and user is on files tab
    useEffect(() => {
        if (selectedTab === 'files') {
            loadFiles();
        }
    }, [profile?.role, profile?.user_id, loading, selectedTab, loadFiles]);

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
                userName={profile?.display_name || 'Teacher'}
                username={profile?.username || undefined}
                email={profile?.email || undefined}
                linkedInUrl={profile?.linkedin_url || undefined}
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
                    filesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner variant="gray" size="lg" speed={1750} />
                        </div>
                    ) : (
                        <TableView files={files} onRefresh={loadFiles} />
                    )
                )}
                {selectedTab === 'students' && (
                    <StudentCardList students={dummyStudents} />
                )}
            </DashboardLayout>

            <CommandPalette role="teacher" onCourseCreated={fetchCourses} onFilesUploaded={loadFiles} />
        </>
    );
}
