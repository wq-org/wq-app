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
  TRUE,
  0
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.feature_definitions (key, name, category, value_type, default_enabled) VALUES
  ('institution', 'Institution', 'core', 'boolean', TRUE),
  ('student', 'Student', 'core', 'boolean', TRUE),
  ('teacher', 'Teacher', 'core', 'boolean', TRUE),
  ('classroom', 'Classroom', 'core', 'boolean', TRUE),
  ('reward_system', 'Reward System', 'engagement', 'boolean', FALSE),
  ('course', 'Course', 'learning', 'boolean', TRUE),
  ('game_studio', 'Game Studio', 'learning', 'boolean', FALSE),
  ('task', 'Task', 'learning', 'boolean', TRUE),
  ('calendar', 'Calendar', 'scheduling', 'boolean', FALSE),
  ('cloud_storage', 'Cloud storage', 'infrastructure', 'boolean', TRUE),
  ('note', 'Note', 'collaboration', 'boolean', TRUE),
  ('chat', 'Chat', 'collaboration', 'boolean', FALSE),
  ('notification', 'Notification', 'collaboration', 'boolean', TRUE),
  ('max_teachers', 'Max teachers', 'limits', 'integer', FALSE),
  ('max_students', 'Max students', 'limits', 'integer', FALSE),
  ('max_classrooms', 'Max classrooms', 'limits', 'integer', FALSE),
  ('storage_quota_mb', 'Storage quota (MB)', 'limits', 'integer', FALSE)
ON CONFLICT (key) DO NOTHING;
