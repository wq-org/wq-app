ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS theme_id TEXT NOT NULL DEFAULT 'blue';

ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS theme_id TEXT NOT NULL DEFAULT 'blue';

ALTER TABLE public.courses
DROP CONSTRAINT IF EXISTS courses_theme_id_check;

ALTER TABLE public.courses
ADD CONSTRAINT courses_theme_id_check
CHECK (theme_id IN ('violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'darkblue'));

ALTER TABLE public.games
DROP CONSTRAINT IF EXISTS games_theme_id_check;

ALTER TABLE public.games
ADD CONSTRAINT games_theme_id_check
CHECK (theme_id IN ('violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'darkblue'));
