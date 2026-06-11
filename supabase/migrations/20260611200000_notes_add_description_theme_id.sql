-- Add description and theme_id columns to the notes table.
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS theme_id text;

COMMENT ON COLUMN public.notes.description IS 'Optional description for personal notes.';
COMMENT ON COLUMN public.notes.theme_id IS 'ThemeId color identifier for the note visual accent.';
