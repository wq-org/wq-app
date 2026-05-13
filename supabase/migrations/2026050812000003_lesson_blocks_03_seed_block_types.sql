-- =============================================================================
-- LESSON BLOCKS — seed core block types
-- Requires: 20260508120000_lesson_blocks_01_tables.sql
-- =============================================================================
-- Deterministic seed of the 13 Lexical core block types. Idempotent via ON
-- CONFLICT. Adding new block types in future migrations follows the same
-- pattern (no schema change required). Per db_principles §10 data seeds live
-- in their own file, separate from schema.
-- =============================================================================

INSERT INTO public.lesson_block_type_registry (
  block_type,
  category,
  is_lexical_core,
  plugin_key
)
VALUES
  ('HeadingOne', 'heading', TRUE, NULL),
  ('HeadingTwo', 'heading', TRUE, NULL),
  ('HeadingThree', 'heading', TRUE, NULL),
  ('Paragraph', 'content', TRUE, NULL),
  ('BulletedList', 'content', TRUE, NULL),
  ('NumberedList', 'content', TRUE, NULL),
  ('Quote', 'content', TRUE, NULL),
  ('Divider', 'layout', TRUE, NULL),
  ('Image', 'media', TRUE, NULL),
  ('Video', 'media', TRUE, NULL),
  ('Callout', 'content', TRUE, NULL),
  ('Code', 'content', TRUE, NULL),
  ('Custom', 'custom', FALSE, NULL)
ON CONFLICT (block_type) DO NOTHING;
