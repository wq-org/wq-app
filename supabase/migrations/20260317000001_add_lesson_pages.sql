ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS pages JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.lessons
SET pages = jsonb_build_array(
  jsonb_build_object(
    'id', uuid_generate_v4()::text,
    'order', 0,
    'content', content
  )
)
WHERE jsonb_typeof(pages) <> 'array'
   OR jsonb_array_length(pages) = 0;
