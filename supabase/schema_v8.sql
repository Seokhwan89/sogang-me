-- schema_v8: 2026-09-02 전체 감사 후속 DB 보강
-- Supabase 대시보드 > SQL Editor에 그대로 붙여넣고 Run.
-- 코드(리포)는 이 SQL이 적용되기 전에도 동작하도록 작성되어 있다.

-- 1) [보안] 예약자 개인정보(연락처·소속) 익명 노출 차단.
--    RLS의 "reservations public read"는 행만 거를 수 있어, 지금은 누구나 anon 키로
--    /rest/v1/reservations?select=contact 를 호출해 전 예약자의 전화번호를 덤프할 수 있다.
--    컬럼 단위 grant로 익명(anon)에게는 달력 표시에 필요한 컬럼만 연다.
revoke select on table public.reservations from anon;
grant select (id, facility, date, start_time, end_time, user_name, purpose, status, created_at)
  on table public.reservations to anon;
-- 로그인한 관리자(authenticated)는 전 컬럼 유지 (기본 grant 그대로).

-- 2) [버그] 관리자 추가(addAdmin)가 조용히 실패하던 문제: admins에 쓰기 정책이 없었다.
drop policy if exists "admins admin write" on public.admins;
create policy "admins admin write" on public.admins
  for all using (is_admin()) with check (is_admin());

-- 3) [버그] URECA 재제출 시 이전 지원서 대체가 RLS에 막혀 무동작이던 문제.
--    익명 요청에서도 원자적으로 동작하는 security definer 함수로 처리한다.
--    새 지원서를 먼저 insert한 뒤 호출한다: 같은 (연도·학기·학번)의 pending 지원서 중
--    가장 최근 것(방금 넣은 행)만 남기고 이전 것을 지운다 — insert 실패 시 기존 지원서는 그대로.
--    (anon은 select 정책이 없어 insert가 id를 돌려받을 수 없으므로 max(id) 유지 방식을 쓴다)
create or replace function public.replace_ureca_application(p_year int, p_term text, p_student_id text)
returns int
language sql security definer set search_path = public as $$
  with del as (
    delete from ureca_applications
    where year = p_year and term = p_term and student_id = p_student_id
      and status = 'pending'          -- 검토가 끝난(선발/미선발/이관) 기록은 남긴다
      and id < (select max(id) from ureca_applications
                where year = p_year and term = p_term and student_id = p_student_id and status = 'pending')
    returning id
  ) select count(*)::int from del;
$$;
revoke all on function public.replace_ureca_application(int, text, text) from public;
grant execute on function public.replace_ureca_application(int, text, text) to anon, authenticated;

-- 4) [방어] 예약 공개 insert 조건 강화: API를 우회해 Supabase REST로 직접 넣어도
--    pending·시간 정합·과거 날짜 금지가 DB에서 강제된다.
drop policy if exists "reservations public insert" on public.reservations;
create policy "reservations public insert" on public.reservations
  for insert with check (
    status = 'pending'
    and end_time > start_time
    and date >= (now() at time zone 'Asia/Seoul')::date
  );

-- 5) [방어] 동시 예약 신청 레이스 정리: 나중에 들어온 pending 행이 스스로 물러날 때 사용.
--    겹치는 더 이른 행이 실제로 있을 때만, 그리고 pending일 때만 지워서 오남용을 막는다.
create or replace function public.withdraw_conflicted_reservation(p_id bigint)
returns boolean
language sql security definer set search_path = public as $$
  with me as (select * from reservations where id = p_id and status = 'pending'),
  del as (
    delete from reservations r using me
    where r.id = me.id
      and exists (
        select 1 from reservations o
        where o.facility = me.facility and o.date = me.date and o.id < me.id
          and o.status <> 'rejected'
          and o.start_time < me.end_time and o.end_time > me.start_time
      )
    returning r.id
  ) select count(*) > 0 from del;
$$;
revoke all on function public.withdraw_conflicted_reservation(bigint) from public;
grant execute on function public.withdraw_conflicted_reservation(bigint) to anon, authenticated;

-- PostgREST 스키마 캐시 갱신
notify pgrst, 'reload schema';
