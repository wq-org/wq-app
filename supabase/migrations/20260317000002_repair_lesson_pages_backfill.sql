UPDATE public.lessons
SET pages = jsonb_build_array(
  jsonb_build_object(
    'id', uuid_generate_v4()::text,
    'order', 0,
    'content', content
  )
)
WHERE jsonb_typeof(pages) IS DISTINCT FROM 'array'
   OR (
     jsonb_typeof(pages) = 'array'
     AND (
       jsonb_array_length(pages) = 0
       OR jsonb_typeof(pages -> 0) IS DISTINCT FROM 'object'
       OR NOT ((pages -> 0) ? 'content')
       OR pages -> 0 -> 'content' IS NULL
       OR pages -> 0 -> 'content' = 'null'::jsonb
     )
   );
