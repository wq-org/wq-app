-- Game course links: only allow linking to courses with live (student-visible) deliveries.

DROP POLICY IF EXISTS game_course_links_insert_teacher ON public.game_course_links;

CREATE POLICY game_course_links_insert_teacher
  ON public.game_course_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM public.games WHERE teacher_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1
      FROM public.course_deliveries cd
      WHERE cd.course_id = game_course_links.course_id
        AND cd.deleted_at IS NULL
        AND cd.status IN (
          'active'::public.course_delivery_status,
          'scheduled'::public.course_delivery_status
        )
    )
  );
