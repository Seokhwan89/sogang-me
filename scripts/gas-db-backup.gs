/**
 * 서강대 기계공학과 홈페이지 — Supabase DB 정기 백업 (Google Apps Script)
 *
 * 학과 Gmail 계정의 https://script.google.com 에 이 파일 내용을 붙여넣어 사용한다.
 * 동작: 매주 월요일 새벽 4시(KST)에 Supabase 주요 테이블 전체를 JSON.gz로 덤프해
 *       학과 구글드라이브 백업 폴더에 `db-backup_YYYY-MM-DD/` 형태로 저장하고,
 *       26개(약 반년치)를 넘는 오래된 백업 폴더는 휴지통으로 보낸다.
 *       실패하면 학과 Gmail로 오류 메일을 보낸다.
 *
 * 설치(1회):
 *  1) script.google.com → 새 프로젝트 → 이 코드 붙여넣기
 *  2) 왼쪽 ⚙ 프로젝트 설정 → 스크립트 속성 2개 추가:
 *     - SUPABASE_URL         = https://<프로젝트>.supabase.co
 *     - SUPABASE_SERVICE_KEY = Supabase 대시보드 → Settings → API → service_role 키
 *     (⚠ service_role 키는 이 스크립트 속성에만 두고 코드·리포에 절대 넣지 않는다)
 *  3) 편집기 상단에서 함수 `setup` 선택 → 실행 → 권한 승인
 *     → 즉시 1회 백업이 돌고, 매주 자동 실행 트리거가 걸린다.
 */

const FOLDER_ID = '18Puf0uiMeVUa29tn6yV4zRRTGKC-m4Lp'; // 학과 드라이브 백업 폴더
const TABLES = ['posts', 'faculty', 'reservations', 'banners', 'pages', 'site_settings'];
const KEEP = 26; // 보관할 백업 세트 수 (주 1회 × 26 = 약 반년)

function backup() {
  const props = PropertiesService.getScriptProperties();
  const base = (props.getProperty('SUPABASE_URL') || '').replace(/\/+$/, '');
  const key = props.getProperty('SUPABASE_SERVICE_KEY');
  if (!base || !key) throw new Error('스크립트 속성 SUPABASE_URL / SUPABASE_SERVICE_KEY를 설정하세요.');

  const stamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  const root = DriveApp.getFolderById(FOLDER_ID);
  const folder = root.createFolder('db-backup_' + stamp);
  const summary = [];

  TABLES.forEach(function (t) {
    let rows = [];
    let off = 0;
    while (true) {
      const resp = UrlFetchApp.fetch(base + '/rest/v1/' + t + '?select=*&limit=1000&offset=' + off, {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
        muteHttpExceptions: true,
      });
      if (resp.getResponseCode() >= 300) throw new Error(t + ': HTTP ' + resp.getResponseCode() + ' ' + resp.getContentText().slice(0, 200));
      const d = JSON.parse(resp.getContentText());
      rows = rows.concat(d);
      if (d.length < 1000) break;
      off += 1000;
    }
    const gz = Utilities.gzip(Utilities.newBlob(JSON.stringify(rows), 'application/json', t + '.json'));
    gz.setName(t + '.json.gz');
    folder.createFile(gz);
    summary.push(t + ' ' + rows.length + '행');
  });

  // 오래된 백업 정리 (이름이 db-backup_ 으로 시작하는 폴더만)
  const sets = [];
  const it = root.getFolders();
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName().indexOf('db-backup_') === 0) sets.push(f);
  }
  sets.sort(function (a, b) { return a.getName() < b.getName() ? -1 : 1; });
  while (sets.length > KEEP) sets.shift().setTrashed(true);

  return stamp + ' 백업 완료: ' + summary.join(', ');
}

function backupWithAlert() {
  try {
    const msg = backup();
    console.log(msg);
  } catch (e) {
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
      '[기계공학과 홈페이지] DB 백업 실패', '오류: ' + e + '\n\nscript.google.com에서 실행 기록을 확인하세요.');
    throw e;
  }
}

/** 최초 1회 실행: 주간 트리거 등록 + 즉시 백업 1회 */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('backupWithAlert').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(4).create();
  backupWithAlert();
}
