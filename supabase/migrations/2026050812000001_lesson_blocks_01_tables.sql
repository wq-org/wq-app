-- =============================================================================
-- LESSON BLOCKS — tables, indexes, constraints, tenant-key trigger
-- =============================================================================
-- Row-per-block Lexical storage. Extensible block types via registry INSERT
-- (no ENUM migrations). RLS and seed data live in sibling _02 / _03 files.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Registry of valid block types (replaces ENUM for lesson body blocks)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_block_type_registry (
  block_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'content',
  is_lexical_core BOOLEAN NOT NULL DEFAULT TRUE,
  plugin_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_lesson_block_type_registry PRIMARY KEY (block_type),
  CONSTRAINT chk_lesson_block_type_registry_category CHECK (
    category IN ('heading', 'content', 'media', 'interactive', 'layout', 'custom')
  )
);

COMMENT ON TABLE public.lesson_block_type_registry IS
  'Registry of valid lesson block types; extend with INSERT (no schema migration). '
  'FK from lesson_blocks.block_type enables ON UPDATE CASCADE renames.';

COMMENT ON COLUMN public.lesson_block_type_registry.block_type IS
  'Stable key (matches TS CORE_BLOCK_TYPES / plugin identifiers).';
COMMENT ON COLUMN public.lesson_block_type_registry.category IS
  'Logical group for analytics: heading|content|media|interactive|layout|custom.';
COMMENT ON COLUMN public.lesson_block_type_registry.is_lexical_core IS
  'TRUE when type ships with Lexical core packages; FALSE for WQ custom plugins.';
COMMENT ON COLUMN public.lesson_block_type_registry.plugin_key IS
  'Lexical plugin / node registration key for custom blocks; NULL for core types.';
COMMENT ON COLUMN public.lesson_block_type_registry.created_at IS 'Registry row creation time.';

-- -----------------------------------------------------------------------------
-- 2. lesson_blocks — one row per top-level Lexical block
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  institution_id UUID NOT NULL,
  block_type TEXT NOT NULL,
  value JSONB NOT NULL,
  meta_order INTEGER NOT NULL,
  meta_depth INTEGER NOT NULL DEFAULT 0,
  content_schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_lesson_blocks PRIMARY KEY (id),
  CONSTRAINT fk_lesson_blocks_lessons FOREIGN KEY (lesson_id) REFERENCES public.lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_blocks_institutions FOREIGN KEY (institution_id) REFERENCES public.institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_blocks_registry FOREIGN KEY (block_type) REFERENCES public.lesson_block_type_registry (block_type) ON UPDATE CASCADE,
  CONSTRAINT uq_lesson_blocks_lesson_meta_order UNIQUE (lesson_id, meta_order) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT chk_lesson_blocks_meta_order CHECK (meta_order >= 0),
  CONSTRAINT chk_lesson_blocks_meta_depth CHECK (meta_depth >= 0),
  CONSTRAINT chk_lesson_blocks_content_schema_version CHECK (content_schema_version >= 1)
);

COMMENT ON TABLE public.lesson_blocks IS
  'Normalized Lexical lesson body: one row per persisted top-level block; JSON value is SerializedLexicalNode.';

COMMENT ON COLUMN public.lesson_blocks.id IS 'Stable block id for analytics and future CRDT/Yjs anchoring.';
COMMENT ON COLUMN public.lesson_blocks.lesson_id IS 'Parent lesson.';
COMMENT ON COLUMN public.lesson_blocks.institution_id IS 'Tenant boundary; set by trigger from course.institution_id.';
COMMENT ON COLUMN public.lesson_blocks.block_type IS 'FK into lesson_block_type_registry.';
COMMENT ON COLUMN public.lesson_blocks.value IS 'Serialized Lexical node JSON for this block.';
COMMENT ON COLUMN public.lesson_blocks.meta_order IS 'Top-level document order (0-based).';
COMMENT ON COLUMN public.lesson_blocks.meta_depth IS 'Optional nesting depth hint for lists/outlines.';
COMMENT ON COLUMN public.lesson_blocks.content_schema_version IS 'Lexical/editor schema version for migrations.';
COMMENT ON COLUMN public.lesson_blocks.created_at IS 'Row creation time.';
COMMENT ON COLUMN public.lesson_blocks.updated_at IS 'Last update time.';

-- -----------------------------------------------------------------------------
-- 3. Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lesson_blocks_lesson_meta_order
  ON public.lesson_blocks (lesson_id, meta_order);

CREATE INDEX IF NOT EXISTS idx_lesson_blocks_institution_id
  ON public.lesson_blocks (institution_id);

CREATE INDEX IF NOT EXISTS idx_lesson_blocks_value_gin
  ON public.lesson_blocks
  USING gin (value jsonb_path_ops);

-- -----------------------------------------------------------------------------
-- 4. Triggers: tenant key + updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lesson_blocks_before_insert_set_institution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_institution_id uuid;
BEGIN
  SELECT c.institution_id INTO v_institution_id
  FROM public.lessons l
  INNER JOIN public.topics t ON t.id = l.topic_id
  INNER JOIN public.courses c ON c.id = t.course_id
  WHERE l.id = NEW.lesson_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'lesson_blocks: missing institution for lesson % (course.institution_id null)', NEW.lesson_id;
  END IF;

  NEW.institution_id := v_institution_id;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.lesson_blocks_before_insert_set_institution() IS
  'Sets institution_id from lessons→topics→courses; SECURITY DEFINER; prevents client spoofing tenant.';

DROP TRIGGER IF EXISTS trg_lesson_blocks_before_insert_set_institution ON public.lesson_blocks;
CREATE TRIGGER trg_lesson_blocks_before_insert_set_institution
  BEFORE INSERT ON public.lesson_blocks
  FOR EACH ROW EXECUTE FUNCTION public.lesson_blocks_before_insert_set_institution();

DROP TRIGGER IF EXISTS trg_lesson_blocks_set_updated_at ON public.lesson_blocks;
CREATE TRIGGER trg_lesson_blocks_set_updated_at
  BEFORE UPDATE ON public.lesson_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
