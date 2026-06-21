-- Firebase tokens are validated by the API, not by Supabase Auth. Therefore
-- clients never receive the service-role key and cannot address the bucket
-- directly. The API issues short-lived signed upload/download URLs only after
-- checking ownership or enrollment.

insert into storage.buckets (id, name, public, file_size_limit)
values ('course-assets', 'course-assets', false, 2147483648)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

alter table storage.objects enable row level security;

-- RLS is deny-by-default: no anon/authenticated policy is intentionally
-- created for course-assets. The server service role bypasses RLS solely to
-- mint time-limited signed URLs after API authorization.
