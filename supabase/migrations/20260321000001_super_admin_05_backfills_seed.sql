-- =============================================================================
-- SUPER ADMIN — Backfills and seed data
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

INSERT INTO public.plan_catalog (code, name, description, billing_interval, is_active, price_amount)
VALUES (
  'trial',
  'Trial',
  'Default trial for new institutions created via create_institution_with_initial_admin.',
  'none',
  true,
  0
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.feature_definitions (key, name, category, value_type, default_enabled) VALUES
  ('institution', 'Institution', 'core', 'boolean', true),
  ('student', 'Student', 'core', 'boolean', true),
  ('teacher', 'Teacher', 'core', 'boolean', true),
  ('classroom', 'Classroom', 'core', 'boolean', true),
  ('reward_system', 'Reward System', 'engagement', 'boolean', false),
  ('course', 'Course', 'learning', 'boolean', true),
  ('game_studio', 'Game Studio', 'learning', 'boolean', false),
  ('task', 'Task', 'learning', 'boolean', true),
  ('calendar', 'Calendar', 'scheduling', 'boolean', false),
  ('cloud_storage', 'Cloud storage', 'infrastructure', 'boolean', true),
  ('note', 'Note', 'collaboration', 'boolean', true),
  ('chat', 'Chat', 'collaboration', 'boolean', false),
  ('notification', 'Notification', 'collaboration', 'boolean', true),
  ('max_teachers', 'Max teachers', 'limits', 'integer', false),
  ('max_students', 'Max students', 'limits', 'integer', false),
  ('max_classrooms', 'Max classrooms', 'limits', 'integer', false),
  ('storage_quota_mb', 'Storage quota (MB)', 'limits', 'integer', false)
ON CONFLICT (key) DO NOTHING;
