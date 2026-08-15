-- 在 Supabase SQL Editor 中执行本文件。
-- 前端只使用 publishable key（旧项目可用 anon key），绝不要使用 service_role key。

create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null,
  main_activity jsonb not null,
  shared_answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  constraint submissions_submission_id_unique unique (submission_id),
  constraint submissions_main_activity_object check (jsonb_typeof(main_activity) = 'object'),
  constraint submissions_shared_answers_object check (jsonb_typeof(shared_answers) = 'object')
);

-- 兼容已经执行过旧版 SQL 的项目：把旧约束名迁移到客户端会精确识别的新名称。
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_submission_id_key'
  ) and not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_submission_id_unique'
  ) then
    alter table public.submissions
      rename constraint submissions_submission_id_key to submissions_submission_id_unique;
  elsif exists (
    select 1
    from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_submission_id_key'
  ) and exists (
    select 1
    from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_submission_id_unique'
  ) then
    alter table public.submissions
      drop constraint submissions_submission_id_key;
  elsif not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_submission_id_unique'
  ) then
    alter table public.submissions
      add constraint submissions_submission_id_unique unique (submission_id);
  end if;
end
$$;

alter table public.submissions enable row level security;

-- 清除可能存在的宽泛权限，再只开放匿名 INSERT 所需字段。
revoke all on table public.submissions from public, anon, authenticated;
grant usage on schema public to anon;
grant insert (submission_id, main_activity, shared_answers) on public.submissions to anon;

drop policy if exists "anonymous can insert submissions" on public.submissions;

create policy "anonymous can insert submissions"
on public.submissions
for insert
to anon
with check (
  jsonb_typeof(main_activity) = 'object'
  and jsonb_typeof(shared_answers) = 'object'
);

-- 故意不创建 SELECT / UPDATE / DELETE policy，也不授予对应权限。
-- Dashboard 中的项目所有者仍可正常查看数据。
