-- Apply only to a dedicated TechFluent Supabase project.
create schema if not exists tf_private;
revoke all on schema tf_private from public, anon, authenticated;

create table if not exists tf_private.assessments (
  curriculum text not null, concept_id text not null, step smallint not null check(step between 0 and 2),
  kind text not null check(kind in ('choice','input','order')), solutions text[] not null,
  primary key (curriculum, concept_id, step)
);
create table if not exists public.tf_attempts (
  sequence bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null, curriculum text not null, concept_id text not null, step smallint not null,
  response text[] not null, hinted boolean not null, correct boolean not null,
  occurred_ms bigint not null, received_at timestamptz not null default clock_timestamp(),
  unique(user_id,event_id),
  foreign key(curriculum,concept_id,step) references tf_private.assessments(curriculum,concept_id,step)
);
create index if not exists tf_attempts_user_seq on public.tf_attempts(user_id,sequence);
create index if not exists tf_attempts_received on public.tf_attempts(user_id,received_at);
alter table public.tf_attempts enable row level security;
revoke all on public.tf_attempts from public, anon, authenticated;
grant select on public.tf_attempts to authenticated;
create policy tf_read_own on public.tf_attempts for select to authenticated using (user_id=(select auth.uid()));

-- Accept response evidence, never a client-provided grade, role, or mastery total.
create or replace function public.tf_submit_attempts(batch jsonb, expected_owner uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
  owner_id uuid := auth.uid(); item jsonb; known tf_private.assessments%rowtype;
  submitted text[]; normalized text[]; passed boolean; event_uuid uuid; stamp bigint;
begin
  if owner_id is null or owner_id is distinct from expected_owner then raise exception 'Authentication required'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Account required'; end if;
  if jsonb_typeof(batch) is distinct from 'array' or octet_length(batch::text)>96000 then raise exception 'Invalid batch'; end if;
  if jsonb_array_length(batch) not between 1 and 40 then raise exception 'Invalid batch size'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
  if (select count(*) from public.tf_attempts where user_id=owner_id and received_at>clock_timestamp()-interval '1 minute') >= 240 then raise exception 'Try again later'; end if;
  for item in select value from pg_catalog.jsonb_array_elements(batch) loop
    if jsonb_typeof(item) is distinct from 'object' or jsonb_typeof(item->'hinted') is distinct from 'boolean'
       or jsonb_typeof(item->'at') is distinct from 'number' or jsonb_typeof(item->'response') is distinct from 'array'
       or item->>'id' is null then raise exception 'Invalid evidence'; end if;
    event_uuid := (item->>'id')::uuid;
    if exists(select 1 from public.tf_attempts where user_id=owner_id and event_id=event_uuid) then continue; end if;
    select * into strict known from tf_private.assessments where curriculum=item->>'version' and concept_id=item->>'concept' and step=(item->>'step')::smallint;
    stamp:=(item->>'at')::bigint;
    if stamp<=0 or stamp > extract(epoch from clock_timestamp()+interval '5 minutes')*1000 then raise exception 'Invalid event time'; end if;
    if jsonb_array_length(item->'response') not between 1 and 8
       or exists(select 1 from jsonb_array_elements(item->'response') e where jsonb_typeof(e)<>'string') then raise exception 'Invalid response'; end if;
    select array_agg(x order by n),array_agg(lower(regexp_replace(btrim(x),'[[:space:]]+',' ','g')) order by n)
      into submitted, normalized from jsonb_array_elements_text(item->'response') with ordinality as v(x,n);
    if exists(select 1 from unnest(submitted) x where length(x)>300) then raise exception 'Answer too long'; end if;
    passed:=case when known.kind='order' then normalized=known.solutions
                 else cardinality(normalized)=1 and normalized[1]=any(known.solutions) end;
    insert into public.tf_attempts(user_id,event_id,curriculum,concept_id,step,response,hinted,correct,occurred_ms)
    values(owner_id,event_uuid,known.curriculum,known.concept_id,known.step,submitted,(item->>'hinted')::boolean,passed,stamp);
  end loop;
end $$;
revoke all on function public.tf_submit_attempts(jsonb,uuid) from public,anon;
grant execute on function public.tf_submit_attempts(jsonb,uuid) to authenticated;
