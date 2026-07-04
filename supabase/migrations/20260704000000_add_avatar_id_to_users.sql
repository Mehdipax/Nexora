alter table public.users
add column if not exists avatar_id text;

comment on column public.users.avatar_id is 'Selected Nexora avatar catalog id for the user profile.';
