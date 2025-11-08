import { supabase } from '@/lib/supabase';
import type { Lesson } from '../types/lesson.types';

/**
 * Get all lessons for a topic
 */
export async function getLessonsByTopicId(topicId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, description, topic_id, course_id')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
  
  return (data || []) as Lesson[];
}

/**
 * Get all lessons for a course (across all topics)
 */
export async function getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, description, topic_id, course_id')
    .eq('course_id', courseId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
  
  return (data || []) as Lesson[];
}

