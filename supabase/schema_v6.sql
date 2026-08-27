-- v6: 교수 위치를 건물 코드 + 호실로 분리 (국문/영문 자동 표기)
alter table faculty add column if not exists building text;
alter table faculty add column if not exists room text;

-- 기존 office 문자열에서 건물 코드와 호실을 추출해 채워 넣습니다.
update faculty set
  building = coalesce(building, (regexp_match(office, '\(([A-Z]{1,3})\)'))[1]),
  room     = coalesce(room,     (regexp_match(office, '\(?[A-Z]{0,3}\)?\s*([0-9]+[A-Za-z]?)\s*호'))[1])
where office is not null;

select name_ko, office, building, room from faculty order by is_emeritus, sort_order;
