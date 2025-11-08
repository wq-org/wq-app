export interface Lesson {
    id: string;
    title: string;
    description: string;
    topic_id?: string;
    course_id?: string;
}

export interface CreateLessonData {
    title: string;
    description: string;
    topic_id?: string;
    course_id?: string;
}

