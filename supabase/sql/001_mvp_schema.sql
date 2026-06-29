-- ProperRide V2 MVP Schema
-- Safe to run on a fresh Supabase project.

create extension if not exists "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================

do $$ begin
  create type public.visibility_type as enum ('public', 'private');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.motorcycle_status as enum ('in_progress', 'completed', 'on_hold');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.post_status as enum ('published', 'archived', 'deleted');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.post_media_type as enum ('image', 'video');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.timeline_action as enum (
    'part_added',
    'part_removed',
    'gallery_added',
    'motorcycle_updated'
  );
exception
  when duplicate_object then null;
end $$;

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  garage_name text,
  avatar_url text,
  location text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  brand text not null,
  model text not null,
  year text not null,
  engine_cc integer,
  engine_info text,
  image_url text,
  status public.motorcycle_status not null default 'in_progress',
  visibility public.visibility_type not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint motorcycles_engine_cc_check check (
    engine_cc is null or engine_cc > 0
  )
);

create table if not exists public.motorcycle_parts (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  brand text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.motorcycle_gallery_items (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.motorcycle_timeline_items (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action public.timeline_action not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  motorcycle_id uuid references public.motorcycles(id) on delete set null,
  caption text not null,
  visibility public.visibility_type not null default 'public',
  status public.post_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  media_url text not null,
  media_type public.post_media_type not null default 'image',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),

  constraint post_media_order_index_check check (order_index >= 0)
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint post_likes_unique unique (post_id, user_id)
);

create table if not exists public.post_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint post_saves_unique unique (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint comments_body_not_empty check (length(trim(body)) > 0)
);

-- =========================================================
-- TRIGGERS
-- =========================================================

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_motorcycles_updated_at on public.motorcycles;
create trigger set_motorcycles_updated_at
before update on public.motorcycles
for each row execute function public.set_updated_at();

drop trigger if exists set_motorcycle_parts_updated_at on public.motorcycle_parts;
create trigger set_motorcycle_parts_updated_at
before update on public.motorcycle_parts
for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists profiles_username_idx
on public.profiles(username);

create index if not exists motorcycles_user_id_idx
on public.motorcycles(user_id);

create index if not exists motorcycles_visibility_idx
on public.motorcycles(visibility);

create index if not exists motorcycle_parts_motorcycle_id_idx
on public.motorcycle_parts(motorcycle_id);

create index if not exists motorcycle_parts_user_id_idx
on public.motorcycle_parts(user_id);

create index if not exists motorcycle_gallery_items_motorcycle_id_idx
on public.motorcycle_gallery_items(motorcycle_id);

create index if not exists motorcycle_gallery_items_user_id_idx
on public.motorcycle_gallery_items(user_id);

create index if not exists motorcycle_timeline_items_motorcycle_id_created_at_idx
on public.motorcycle_timeline_items(motorcycle_id, created_at desc);

create index if not exists posts_user_id_created_at_idx
on public.posts(user_id, created_at desc);

create index if not exists posts_motorcycle_id_idx
on public.posts(motorcycle_id);

create index if not exists posts_feed_idx
on public.posts(visibility, status, created_at desc);

create index if not exists post_media_post_id_order_idx
on public.post_media(post_id, order_index asc);

create index if not exists post_likes_post_id_idx
on public.post_likes(post_id);

create index if not exists post_saves_user_id_idx
on public.post_saves(user_id);

create index if not exists comments_post_id_created_at_idx
on public.comments(post_id, created_at asc);

-- =========================================================
-- RLS ENABLE
-- =========================================================

alter table public.profiles enable row level security;
alter table public.motorcycles enable row level security;
alter table public.motorcycle_parts enable row level security;
alter table public.motorcycle_gallery_items enable row level security;
alter table public.motorcycle_timeline_items enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_saves enable row level security;
alter table public.comments enable row level security;

-- =========================================================
-- RLS POLICIES: PROFILES
-- =========================================================

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================================================
-- RLS POLICIES: MOTORCYCLES
-- =========================================================

drop policy if exists "Public motorcycles are readable" on public.motorcycles;
create policy "Public motorcycles are readable"
on public.motorcycles
for select
using (
  visibility = 'public'
  or auth.uid() = user_id
);

drop policy if exists "Users can insert their own motorcycles" on public.motorcycles;
create policy "Users can insert their own motorcycles"
on public.motorcycles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own motorcycles" on public.motorcycles;
create policy "Users can update their own motorcycles"
on public.motorcycles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own motorcycles" on public.motorcycles;
create policy "Users can delete their own motorcycles"
on public.motorcycles
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: MOTORCYCLE PARTS
-- =========================================================

drop policy if exists "Parts are readable for public motorcycles or owners" on public.motorcycle_parts;
create policy "Parts are readable for public motorcycles or owners"
on public.motorcycle_parts
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_parts.motorcycle_id
      and m.visibility = 'public'
  )
);

drop policy if exists "Users can insert their own parts" on public.motorcycle_parts;
create policy "Users can insert their own parts"
on public.motorcycle_parts
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_parts.motorcycle_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own parts" on public.motorcycle_parts;
create policy "Users can update their own parts"
on public.motorcycle_parts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own parts" on public.motorcycle_parts;
create policy "Users can delete their own parts"
on public.motorcycle_parts
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: MOTORCYCLE GALLERY
-- =========================================================

drop policy if exists "Gallery items are readable for public motorcycles or owners" on public.motorcycle_gallery_items;
create policy "Gallery items are readable for public motorcycles or owners"
on public.motorcycle_gallery_items
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_gallery_items.motorcycle_id
      and m.visibility = 'public'
  )
);

drop policy if exists "Users can insert their own gallery items" on public.motorcycle_gallery_items;
create policy "Users can insert their own gallery items"
on public.motorcycle_gallery_items
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_gallery_items.motorcycle_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own gallery items" on public.motorcycle_gallery_items;
create policy "Users can delete their own gallery items"
on public.motorcycle_gallery_items
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: MOTORCYCLE TIMELINE
-- =========================================================

drop policy if exists "Timeline items are readable for public motorcycles or owners" on public.motorcycle_timeline_items;
create policy "Timeline items are readable for public motorcycles or owners"
on public.motorcycle_timeline_items
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_timeline_items.motorcycle_id
      and m.visibility = 'public'
  )
);

drop policy if exists "Users can insert their own timeline items" on public.motorcycle_timeline_items;
create policy "Users can insert their own timeline items"
on public.motorcycle_timeline_items
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.motorcycles m
    where m.id = motorcycle_timeline_items.motorcycle_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own timeline items" on public.motorcycle_timeline_items;
create policy "Users can delete their own timeline items"
on public.motorcycle_timeline_items
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: POSTS
-- =========================================================

drop policy if exists "Published public posts are readable" on public.posts;
create policy "Published public posts are readable"
on public.posts
for select
using (
  auth.uid() = user_id
  or (
    visibility = 'public'
    and status = 'published'
  )
);

drop policy if exists "Users can insert their own posts" on public.posts;
create policy "Users can insert their own posts"
on public.posts
for insert
with check (
  auth.uid() = user_id
  and (
    motorcycle_id is null
    or exists (
      select 1
      from public.motorcycles m
      where m.id = posts.motorcycle_id
        and m.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
on public.posts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
on public.posts
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: POST MEDIA
-- =========================================================

drop policy if exists "Post media is readable if post is readable" on public.post_media;
create policy "Post media is readable if post is readable"
on public.post_media
for select
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and (
        p.user_id = auth.uid()
        or (
          p.visibility = 'public'
          and p.status = 'published'
        )
      )
  )
);

drop policy if exists "Users can insert media for their own posts" on public.post_media;
create policy "Users can insert media for their own posts"
on public.post_media
for insert
with check (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "Users can update media for their own posts" on public.post_media;
create policy "Users can update media for their own posts"
on public.post_media
for update
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete media for their own posts" on public.post_media;
create policy "Users can delete media for their own posts"
on public.post_media
for delete
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.user_id = auth.uid()
  )
);

-- =========================================================
-- RLS POLICIES: POST LIKES
-- =========================================================

drop policy if exists "Likes are readable" on public.post_likes;
create policy "Likes are readable"
on public.post_likes
for select
using (true);

drop policy if exists "Users can like posts as themselves" on public.post_likes;
create policy "Users can like posts as themselves"
on public.post_likes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own likes" on public.post_likes;
create policy "Users can remove their own likes"
on public.post_likes
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: POST SAVES
-- =========================================================

drop policy if exists "Users can read their own saves" on public.post_saves;
create policy "Users can read their own saves"
on public.post_saves
for select
using (auth.uid() = user_id);

drop policy if exists "Users can save posts as themselves" on public.post_saves;
create policy "Users can save posts as themselves"
on public.post_saves
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own saves" on public.post_saves;
create policy "Users can remove their own saves"
on public.post_saves
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES: COMMENTS
-- =========================================================

drop policy if exists "Comments are readable for readable posts" on public.comments;
create policy "Comments are readable for readable posts"
on public.comments
for select
using (
  exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and (
        p.user_id = auth.uid()
        or (
          p.visibility = 'public'
          and p.status = 'published'
        )
      )
  )
);

drop policy if exists "Users can insert their own comments" on public.comments;
create policy "Users can insert their own comments"
on public.comments
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own comments" on public.comments;
create policy "Users can update their own comments"
on public.comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
on public.comments
for delete
using (auth.uid() = user_id);

-- =========================================================
-- STORAGE BUCKET
-- =========================================================

insert into storage.buckets (id, name, public)
values ('properride-media', 'properride-media', true)
on conflict (id) do nothing;

-- Storage path convention:
-- properride-media/{user_id}/avatars/...
-- properride-media/{user_id}/motorcycles/{motorcycle_id}/...
-- properride-media/{user_id}/gallery/{motorcycle_id}/...
-- properride-media/{user_id}/posts/{post_id}/...

drop policy if exists "ProperRide media is publicly readable" on storage.objects;
create policy "ProperRide media is publicly readable"
on storage.objects
for select
using (bucket_id = 'properride-media');

drop policy if exists "Users can upload their own ProperRide media" on storage.objects;
create policy "Users can upload their own ProperRide media"
on storage.objects
for insert
with check (
  bucket_id = 'properride-media'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own ProperRide media" on storage.objects;
create policy "Users can update their own ProperRide media"
on storage.objects
for update
using (
  bucket_id = 'properride-media'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'properride-media'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own ProperRide media" on storage.objects;
create policy "Users can delete their own ProperRide media"
on storage.objects
for delete
using (
  bucket_id = 'properride-media'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);