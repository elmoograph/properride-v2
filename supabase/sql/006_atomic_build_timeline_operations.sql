-- ProperRide V2 atomic Gallery and Motorcycle timeline operations.

create or replace function public.create_gallery_items_with_timeline(
  p_motorcycle_id uuid,
  p_media_items jsonb,
  p_related_post_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_motorcycle public.motorcycles%rowtype;
  v_media_item jsonb;
  v_media_count integer;
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

  if p_media_items is null
    or jsonb_typeof(p_media_items) <> 'array'
    or jsonb_array_length(p_media_items) = 0 then
    raise exception 'Pilih minimal satu media Gallery.'
      using errcode = '22023';
  end if;

  if p_related_post_id is not null and not exists (
    select 1
    from public.posts p
    where p.id = p_related_post_id
      and p.user_id = auth.uid()
      and p.motorcycle_id = v_motorcycle.id
  ) then
    raise exception 'Post terkait tidak valid.'
      using errcode = '42501';
  end if;

  for v_media_item in
    select value from jsonb_array_elements(p_media_items)
  loop
    if nullif(trim(v_media_item->>'url'), '') is null
      or (v_media_item->>'media_type') not in ('image', 'video') then
      raise exception 'Data media Gallery tidak valid.'
        using errcode = '22023';
    end if;

    insert into public.motorcycle_gallery_items (
      motorcycle_id,
      user_id,
      image_url,
      media_type,
      caption,
      related_post_id,
      status
    )
    values (
      v_motorcycle.id,
      auth.uid(),
      v_media_item->>'url',
      (v_media_item->>'media_type')::public.gallery_media_type,
      nullif(trim(v_media_item->>'caption'), ''),
      p_related_post_id,
      'active'
    );
  end loop;

  v_media_count := jsonb_array_length(p_media_items);

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
    'gallery_added',
    'Gallery diperbarui',
    v_media_count || ' media ditambahkan ke Gallery '
      || coalesce(v_motorcycle.name, v_motorcycle.brand || ' ' || v_motorcycle.model) || '.'
  );
end;
$$;

create or replace function public.update_motorcycle_with_timeline(
  p_motorcycle_id uuid,
  p_brand text,
  p_model text,
  p_year text,
  p_engine_cc integer,
  p_engine_info text,
  p_image_url text,
  p_name text
)
returns public.motorcycles
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_motorcycle public.motorcycles%rowtype;
begin
  update public.motorcycles
  set
    brand = p_brand,
    model = p_model,
    year = p_year,
    engine_cc = p_engine_cc,
    engine_info = nullif(trim(p_engine_info), ''),
    image_url = nullif(trim(p_image_url), ''),
    name = nullif(trim(p_name), '')
  where id = p_motorcycle_id
    and user_id = auth.uid()
    and archived_at is null
  returning * into v_motorcycle;

  if not found then
    raise exception 'Build tidak ditemukan atau tidak dapat diubah.'
      using errcode = '42501';
  end if;

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
    'motorcycle_updated',
    coalesce(v_motorcycle.name, v_motorcycle.brand || ' ' || v_motorcycle.model),
    'Detail motor diperbarui.'
  );

  return v_motorcycle;
end;
$$;

revoke execute on function public.create_gallery_items_with_timeline(
  uuid,
  jsonb,
  uuid
) from public, anon;

grant execute on function public.create_gallery_items_with_timeline(
  uuid,
  jsonb,
  uuid
) to authenticated;

revoke execute on function public.update_motorcycle_with_timeline(
  uuid,
  text,
  text,
  text,
  integer,
  text,
  text,
  text
) from public, anon;

grant execute on function public.update_motorcycle_with_timeline(
  uuid,
  text,
  text,
  text,
  integer,
  text,
  text,
  text
) to authenticated;
