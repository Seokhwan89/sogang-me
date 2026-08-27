/** 학과 고유명사 표기 통일표. AI 번역 프롬프트와 후처리에 함께 사용합니다. */
export const glossary: [string, string][] = [
  ['서강대학교', 'Sogang University'],
  ['기계공학과', 'Department of Mechanical Engineering'],
  ['학과사무실', 'the department office'],
  ['자유전공학부', 'the School of Liberal Studies'],
  ['대한기계학회', 'the Korean Society of Mechanical Engineers (KSME)'],
  ['한국소음진동공학회', 'the Korean Society for Noise and Vibration Engineering (KSNVE)'],
  ['한국연구재단', 'the National Research Foundation of Korea (NRF)'],
  ['과학기술정보통신부', 'the Ministry of Science and ICT'],
  ['아담샬관', 'Adam Schall Hall'],
  ['리치과학관', 'New Ricci Hall'],
  ['리치별관', 'Ricci Annex'],
  ['떼이야르관', 'Teilhard Hall'],
  ['김대건관', 'Kim Daegon Hall'],
  ['최양업관', 'Choi Yangeop Hall'],
  ['포스코 프란치스코관', 'POSCO Francis Hall'],
  ['정하상관', 'Jeong Hasang Hall'],
  ['하비에르관', 'Xavier Hall'],
  ['로욜라도서관', 'Loyola Library'],
  ['창의적종합설계', 'Creative Integrated Design (Capstone Design)'],
  ['학부연구프로그램', 'the Undergraduate Research Program (URECA)'],
  ['석박통합과정', 'the integrated MS–PhD program'],
  ['석사과정', "the master's program"],
  ['박사과정', 'the doctoral program'],
  ['학술제', 'the department research festival'],
  ['교학팀', 'the academic affairs team'],
  ['공과대학', 'the College of Engineering'],
];

export const glossaryPrompt = glossary.map(([k, v]) => `${k} = ${v}`).join('\n');

/** 번역 결과에 남은 한국어 고유명사·표기 오류를 보정합니다. */
export function polishEnglish(s: string): string {
  let out = s;
  for (const [ko, en] of glossary) out = out.split(ko).join(en);
  return out
    .replace(/Adam Shall Hall/g, 'Adam Schall Hall')
    .replace(/(\d+)\s*호/g, 'Room $1')
    .replace(/([A-Za-z)\]])\s*교수/g, '$1')
    .replace(/\s{2,}/g, ' ');
}
