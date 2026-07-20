-- ProperRide V2 archive visibility policies.
-- Owners retain access to their archived data. Other users can only read
-- active content belonging to public, non-archived motorcycles.

drop policy if exists "Public motorcycles are readable" on public.motorcycles;
create policy "Public motorcycles are readable"
on public.motorcycles
for select
using (
  auth.uid() = user_id
  or (
    visibility = 'public'
    and archived_at is null
  )
);

drop policy if exists "Parts are readable for public motorcycles or owners"
on public.motorcycle_parts;
create policy "Parts are readable for public motorcycles or owners"
on public.motorcycle_parts
for select
using (
  auth.uid() = user_id
  or (
    archived_at is null
    and exists (
      select 1
      from public.motorcycles m
      where m.id = motorcycle_parts.motorcycle_id
        and m.visibility = 'public'
        and m.archived_at is null
    )
  )
);

drop policy if exists "Gallery items are readable for public motorcycles or owners"
on public.motorcycle_gallery_items;
create policy "Gallery items are readable for public motorcycles or owners"
on public.motorcycle_gallery_items
for select
using (
  auth.uid() = user_id
  or (
    status = 'active'
    and exists (
      select 1
      from public.motorcycles m
      where m.id = motorcycle_gallery_items.motorcycle_id
        and m.visibility = 'public'
        and m.archived_at is null
    )
  )
);

drop policy if exists "Timeline items are readable for public motorcycles or owners"
on public.motorcycle_timeline_items;
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
      and m.archived_at is null
  )
);
