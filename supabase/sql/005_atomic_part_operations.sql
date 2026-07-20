-- ProperRide V2 atomic part operations.
-- Part mutations and their timeline entries succeed or roll back together.

create or replace function public.create_motorcycle_part_with_timeline(
  p_motorcycle_id uuid,
  p_category text,
  p_brand text,
  p_name text,
  p_description text,
  p_timeline_description text
)
returns public.motorcycle_parts
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_motorcycle public.motorcycles%rowtype;
  v_part public.motorcycle_parts%rowtype;
begin
  select *
  into v_motorcycle
  from public.motorcycles
  where id = p_motorcycle_id
    and user_id = auth.uid()
    and archived_at is null;

  if not found then
    raise exception 'Build tidak ditemukan atau tidak dapat diubah.'
      using errcode = '42501';
  end if;

  insert into public.motorcycle_parts (
    motorcycle_id,
    user_id,
    category,
    brand,
    name,
    description
  )
  values (
    v_motorcycle.id,
    auth.uid(),
    p_category,
    p_brand,
    p_name,
    nullif(trim(p_description), '')
  )
  returning * into v_part;

  insert into public.motorcycle_timeline_items (
    motorcycle_id,
    user_id,
    action,
    title,
    description
  )
  values (
    v_motorcycle.id,
    auth.uid(),
    'part_added',
    p_name,
    p_timeline_description
  );

  return v_part;
end;
$$;

create or replace function public.archive_motorcycle_part_with_timeline(
  p_part_id uuid
)
returns public.motorcycle_parts
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_motorcycle public.motorcycles%rowtype;
  v_part public.motorcycle_parts%rowtype;
begin
  select *
  into v_part
  from public.motorcycle_parts
  where id = p_part_id
    and user_id = auth.uid()
    and archived_at is null;

  if not found then
    raise exception 'Part tidak ditemukan atau sudah diarsipkan.'
      using errcode = '42501';
  end if;

  select *
  into v_motorcycle
  from public.motorcycles
  where id = v_part.motorcycle_id
    and user_id = auth.uid()
    and archived_at is null;

  if not found then
    raise exception 'Build tidak ditemukan atau tidak dapat diubah.'
      using errcode = '42501';
  end if;

  update public.motorcycle_parts
  set archived_at = now()
  where id = v_part.id
  returning * into v_part;

  insert into public.motorcycle_timeline_items (
    motorcycle_id,
    user_id,
    action,
    title,
    description
  )
  values (
    v_motorcycle.id,
    auth.uid(),
    'part_removed',
    v_part.name,
    v_part.brand || ' diarsipkan dari setup aktif '
      || v_motorcycle.brand || ' ' || v_motorcycle.model || '.'
  );

  return v_part;
end;
$$;

revoke execute on function public.create_motorcycle_part_with_timeline(
  uuid,
  text,
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.create_motorcycle_part_with_timeline(
  uuid,
  text,
  text,
  text,
  text,
  text
) to authenticated;

revoke execute on function public.archive_motorcycle_part_with_timeline(uuid)
from public, anon;

grant execute on function public.archive_motorcycle_part_with_timeline(uuid)
to authenticated;
