-- ProperRide V2 schema sync
-- Records columns already used by the application and present in the live
-- database, but missing from 001_mvp_schema.sql.

do $$ begin
  create type public.gallery_media_type as enum ('image', 'video');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
add column if not exists garage_cover_url text;

alter table public.motorcycles
add column if not exists archived_at timestamptz;

alter table public.motorcycle_parts
add column if not exists description text;

alter table public.motorcycle_parts
add column if not exists archived_at timestamptz;

alter table public.motorcycle_gallery_items
add column if not exists media_type public.gallery_media_type not null default 'image';

alter table public.motorcycle_gallery_items
add column if not exists related_post_id uuid references public.posts(id) on delete set null;

alter table public.motorcycle_gallery_items
add column if not exists status text not null default 'active';

do $$ begin
  alter table public.motorcycle_gallery_items
  add constraint motorcycle_gallery_items_status_check
  check (status in ('active', 'archived', 'deleted'));
exception
  when duplicate_object then null;
end $$;
