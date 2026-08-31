import type { Locale } from './i18n';
export type NavItem = { id: string; ko: string; en: string; href: string; sub?: NavItem[] };
export const nav: NavItem[] = [
  { id: 'about', ko: '기계공학과', en: 'About', href: '/about/goals', sub: [
    { id: 'goals', ko: '교육목표', en: 'Educational Goals', href: '/about/goals' },
    { id: 'intro', ko: '학과소개', en: 'Introduction', href: '/about/intro' },
    { id: 'history', ko: '연혁', en: 'History', href: '/about/history' },
    { id: 'location', ko: '오시는길', en: 'Location', href: '/about/location' },
  ]},
  { id: 'faculty', ko: '교수진', en: 'Faculty', href: '/faculty', sub: [
    { id: 'professors', ko: '전임교수', en: 'Professors', href: '/faculty' },
    { id: 'emeritus', ko: '명예교수', en: 'Emeritus', href: '/faculty/emeritus' },
    { id: 'chair', ko: '석좌교수', en: 'Chair Professor', href: '/faculty/chair' },
  ]},
  { id: 'undergraduate', ko: '학부과정', en: 'Undergraduate', href: '/undergraduate/admission', sub: [
    { id: 'admission', ko: '입학안내', en: 'Admission', href: '/undergraduate/admission' },
    { id: 'majors', ko: '전공소개', en: 'Major Fields', href: '/undergraduate/majors' },
    { id: 'promo', ko: '전공 홍보자료', en: 'Intro Materials', href: '/board/promo' },
    { id: 'curriculum', ko: '교과과정', en: 'Curriculum', href: '/undergraduate/curriculum' },
    { id: 'competency', ko: '전공능력', en: 'Competencies', href: '/undergraduate/competency' },
    { id: 'calendar', ko: '학사일정', en: 'Academic Calendar', href: '/undergraduate/calendar' },
    { id: 'activities', ko: '학생활동', en: 'Student Activities', href: '/undergraduate/activities' },
    { id: 'ureca', ko: '학부연구프로그램(URECA)', en: 'URECA', href: '/undergraduate/ureca' },
    { id: 'capstone', ko: '창의적종합설계', en: 'Capstone Design', href: '/board/capstone' },
    { id: 'festival', ko: '학술제 학부생 발표', en: 'Student Research Festival', href: '/board/festival' },
    { id: 'videos', ko: '기계공학도가 봐야 할 영상', en: 'Videos for ME Students', href: '/board/videos' },
  ]},
  { id: 'graduate', ko: '대학원과정', en: 'Graduate', href: '/graduate/admission', sub: [
    { id: 'admission', ko: '입학안내', en: 'Admission', href: '/graduate/admission' },
    { id: 'curriculum', ko: '교과과정', en: 'Curriculum', href: '/graduate/curriculum' },
    { id: 'calendar', ko: '학사일정', en: 'Academic Calendar', href: '/graduate/calendar' },
    { id: 'areas', ko: '기초전공분야', en: 'Research Areas', href: '/graduate/areas' },
    { id: 'groups', ko: '융합 및 응용연구 그룹', en: 'Convergence Research Groups', href: '/graduate/groups' },
  ]},
  { id: 'industry', ko: '산학협력', en: 'Industry', href: '/industry/samsung', sub: [
    { id: 'samsung', ko: '삼성전자 반도체 트랙', en: 'Samsung Semiconductor Track', href: '/industry/samsung' },
    { id: 'lginnotek', ko: 'LG이노텍 트랙', en: 'LG Innotek Track', href: '/industry/lginnotek' },
    { id: 'lge', ko: 'LG전자 스마트융합 특성학과 트랙', en: 'LG Electronics Track', href: '/industry/lge' },
    { id: 'mobis', ko: '현대모비스 모빌리티 SW 채용연계 트랙', en: 'Hyundai Mobis Mobility SW Track', href: '/industry/mobis' },
  ]},
  { id: 'board', ko: '학과게시판', en: 'Board', href: '/board/notice', sub: [
    { id: 'notice', ko: '공지사항', en: 'Notice', href: '/board/notice' },
    { id: 'research', ko: '연구성과', en: 'Research', href: '/board/research' },
    { id: 'award', ko: '수상', en: 'Awards', href: '/board/award' },
    { id: 'scholarship', ko: '장학·취업정보', en: 'Scholarship & Careers', href: '/board/scholarship' },
    { id: 'major', ko: '심화전공', en: 'Advanced Major', href: '/board/major' },
    { id: 'gallery', ko: '갤러리', en: 'Gallery', href: '/board/gallery' },
    { id: 'archive', ko: '자료실', en: 'Downloads', href: '/board/archive' },
    { id: 'events', ko: '외부 행사', en: 'External Events', href: '/board/events' },
    { id: 'reservation', ko: '사용시설 예약 현황', en: 'Facility Reservation', href: '/reservation' },
  ]},
  { id: 'alumni', ko: '동문회', en: 'Alumni', href: '/alumni/intro', sub: [
    { id: 'intro', ko: '동문회소개', en: 'About Alumni', href: '/alumni/intro' },
    { id: 'news', ko: '기계공학과 동문 소식', en: 'Alumni News', href: '/board/alumni_news' },
  ]},
];
export const label = (item: { ko: string; en: string }, l: Locale) => (l === 'en' ? item.en : item.ko);
export const boards = ['notice', 'research', 'award', 'scholarship', 'major', 'gallery', 'archive', 'events', 'alumni_news', 'promo', 'capstone', 'festival', 'videos'] as const;
/** Which nav section/sub a board belongs to (for hero + tabs). */
export const boardSection: Record<string, [string, string]> = {
  alumni_news: ['alumni', 'news'], promo: ['undergraduate', 'promo'], capstone: ['undergraduate', 'capstone'], festival: ['undergraduate', 'festival'], videos: ['undergraduate', 'videos'],
};
export const festivalCategories = [
  { id: 'ureca', ko: 'URECA 학부인턴 연구', en: 'URECA Intern Research' },
  { id: 'capstone', ko: '창의적종합설계팀 연구', en: 'Capstone Design Team' },
  { id: 'project', ko: '연구프로젝트팀 연구', en: 'Research Project Team' },
  { id: 'award', ko: '학부생 수상', en: 'Undergraduate Awards' },
];
export const urecaTerms = [
  { id: 'spring', ko: '봄학기', en: 'Spring semester' }, { id: 'summer', ko: '여름방학', en: 'Summer break' },
  { id: 'fall', ko: '가을학기', en: 'Fall semester' }, { id: 'winter', ko: '겨울방학', en: 'Winter break' },
];
export type Board = (typeof boards)[number];
export const facilities = [
  { id: 'seminar', ko: '세미나실', en: 'Seminar room' },
  { id: 'meeting', ko: '학과회의실', en: 'Meeting room' },
  { id: 'drafting', ko: '제도실', en: 'Drafting room' },
  { id: 'server1', ko: '공용서버 1', en: 'Shared server 1' },
  { id: 'server2', ko: '공용서버 2', en: 'Shared server 2' },
  { id: 'server3', ko: '공용서버 3', en: 'Shared server 3' },
  { id: 'server4', ko: '공용서버 4', en: 'Shared server 4' },
];
