-- Timeline is intentionally limited to part_added and part_removed.
-- Migration 006 was already applied, so remove its unused RPCs explicitly.

drop function if exists public.create_gallery_items_with_timeline(uuid, jsonb, uuid);

drop function if exists public.update_motorcycle_with_timeline(
  uuid,
  text,
  text,
  text,
  integer,
  text,
  text,
  text
);
