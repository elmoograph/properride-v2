-- ProperRide V2 indexes for active/archived builds and gallery relations.

create index if not exists motorcycles_active_user_created_at_idx
on public.motorcycles (user_id, created_at desc)
where archived_at is null;

create index if not exists motorcycles_archived_user_archived_at_idx
on public.motorcycles (user_id, archived_at desc)
where archived_at is not null;

create index if not exists motorcycle_parts_active_motorcycle_created_at_idx
on public.motorcycle_parts (motorcycle_id, created_at desc)
where archived_at is null;

create index if not exists motorcycle_gallery_active_motorcycle_created_at_idx
on public.motorcycle_gallery_items (motorcycle_id, created_at desc)
where status = 'active';

create index if not exists motorcycle_gallery_related_post_id_idx
on public.motorcycle_gallery_items (related_post_id)
where related_post_id is not null;
