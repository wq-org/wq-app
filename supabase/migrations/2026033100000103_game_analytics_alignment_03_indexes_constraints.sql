-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — indexes & constraints
-- Requires: 20260331000001_game_analytics_alignment_02_tables.sql
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_institutions'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_institutions
      FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_games'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_games
      FOREIGN KEY (game_id) REFERENCES public.games (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_game_versions'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_game_versions
      FOREIGN KEY (game_id, game_version_id) REFERENCES public.game_versions (game_id, id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_classrooms'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_classrooms
      FOREIGN KEY (classroom_id) REFERENCES public.classrooms (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_course_deliveries'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_course_deliveries
      FOREIGN KEY (course_delivery_id) REFERENCES public.course_deliveries (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_lessons'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_lessons
      FOREIGN KEY (lesson_id) REFERENCES public.lessons (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_created_by_profiles'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_created_by_profiles
      FOREIGN KEY (created_by) REFERENCES public.profiles (user_id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_deliveries' AND constraint_name = 'fk_game_deliveries_updated_by_profiles'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT fk_game_deliveries_updated_by_profiles
      FOREIGN KEY (updated_by) REFERENCES public.profiles (user_id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_game_deliveries_archive_lifecycle'
  ) THEN
    ALTER TABLE public.game_deliveries
      ADD CONSTRAINT chk_game_deliveries_archive_lifecycle
      CHECK (
        archived_at IS NULL
        OR status IN ('archived'::public.game_delivery_status, 'canceled'::public.game_delivery_status)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_runs' AND constraint_name = 'fk_game_runs_game_deliveries'
  ) THEN
    ALTER TABLE public.game_runs
      ADD CONSTRAINT fk_game_runs_game_deliveries
      FOREIGN KEY (game_delivery_id) REFERENCES public.game_deliveries (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_game_runs_delivery_assigned_requires_delivery'
  ) THEN
    ALTER TABLE public.game_runs
      ADD CONSTRAINT chk_game_runs_delivery_assigned_requires_delivery
      CHECK (
        run_context IS NULL
        OR run_context <> 'delivery_assigned'::public.game_run_context
        OR game_delivery_id IS NOT NULL
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'learning_events' AND constraint_name = 'fk_learning_events_game_deliveries'
  ) THEN
    ALTER TABLE public.learning_events
      ADD CONSTRAINT fk_learning_events_game_deliveries
      FOREIGN KEY (game_delivery_id) REFERENCES public.game_deliveries (id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_institutions'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_institutions
      FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_profiles'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles (user_id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_games'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_games
      FOREIGN KEY (game_id) REFERENCES public.games (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_game_versions'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_game_versions
      FOREIGN KEY (game_id, game_version_id) REFERENCES public.game_versions (game_id, id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_game_deliveries'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_game_deliveries
      FOREIGN KEY (game_delivery_id) REFERENCES public.game_deliveries (id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'game_run_stats_scoped' AND constraint_name = 'fk_game_run_stats_scoped_best_run'
  ) THEN
    ALTER TABLE public.game_run_stats_scoped
      ADD CONSTRAINT fk_game_run_stats_scoped_best_run
      FOREIGN KEY (best_run_id) REFERENCES public.game_runs (id) ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_game_deliveries_institution_id ON public.game_deliveries (institution_id);
CREATE INDEX IF NOT EXISTS idx_game_deliveries_game_id ON public.game_deliveries (game_id);
CREATE INDEX IF NOT EXISTS idx_game_deliveries_game_version_id ON public.game_deliveries (game_version_id);
CREATE INDEX IF NOT EXISTS idx_game_deliveries_classroom_id ON public.game_deliveries (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_deliveries_course_delivery_id ON public.game_deliveries (course_delivery_id) WHERE course_delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_deliveries_lesson_id ON public.game_deliveries (lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_deliveries_status ON public.game_deliveries (status);
CREATE INDEX IF NOT EXISTS idx_game_deliveries_institution_id_status ON public.game_deliveries (institution_id, status);
CREATE INDEX IF NOT EXISTS idx_game_deliveries_course_delivery_id_status ON public.game_deliveries (course_delivery_id, status) WHERE course_delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_deliveries_classroom_id_status ON public.game_deliveries (classroom_id, status) WHERE classroom_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_deliveries_game_id_game_version_id ON public.game_deliveries (game_id, game_version_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_deliveries_course_delivery_scope_active
  ON public.game_deliveries (course_delivery_id, game_id, game_version_id)
  WHERE course_delivery_id IS NOT NULL
    AND archived_at IS NULL
    AND status IN ('draft'::public.game_delivery_status, 'published'::public.game_delivery_status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_deliveries_classroom_scope_active
  ON public.game_deliveries (classroom_id, game_id, game_version_id)
  WHERE classroom_id IS NOT NULL
    AND archived_at IS NULL
    AND status IN ('draft'::public.game_delivery_status, 'published'::public.game_delivery_status);

CREATE INDEX IF NOT EXISTS idx_game_runs_game_delivery_id ON public.game_runs (game_delivery_id) WHERE game_delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_runs_run_context ON public.game_runs (run_context) WHERE run_context IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_runs_institution_id_game_id_game_version_id
  ON public.game_runs (institution_id, game_id, game_version_id)
  WHERE game_version_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_events_game_delivery_id
  ON public.learning_events (game_delivery_id)
  WHERE game_delivery_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_institution_id ON public.game_run_stats_scoped (institution_id);
CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_user_id ON public.game_run_stats_scoped (user_id);
CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_game_id ON public.game_run_stats_scoped (game_id);
CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_game_version_id ON public.game_run_stats_scoped (game_version_id);
CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_game_delivery_id ON public.game_run_stats_scoped (game_delivery_id) WHERE game_delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_run_stats_scoped_last_run_at ON public.game_run_stats_scoped (last_run_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_run_stats_scoped_unique_version_scope
  ON public.game_run_stats_scoped (institution_id, user_id, game_id, game_version_id)
  WHERE game_delivery_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_run_stats_scoped_unique_delivery_scope
  ON public.game_run_stats_scoped (institution_id, user_id, game_id, game_version_id, game_delivery_id)
  WHERE game_delivery_id IS NOT NULL;
