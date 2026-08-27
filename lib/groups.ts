/** 융합 및 응용연구 그룹 정의. 소속 교수는 faculty.groups (jsonb 배열)에 저장되어 교수 정보만 고치면 자동 반영됩니다. */
export const researchGroupDefs = [
  { id: 'bio', ko: '바이오공학 연구그룹', en: 'Bioengineering Group' },
  { id: 'fluid', ko: '유체 및 복합체 연구그룹', en: 'Fluids & Composites Group' },
  { id: 'energy', ko: '에너지공학 연구그룹', en: 'Energy Engineering Group' },
  { id: 'mechatronics', ko: '메카트로닉 시스템 연구그룹', en: 'Mechatronic Systems Group' },
  { id: 'micronano', ko: '마이크로/나노 시스템 연구그룹', en: 'Micro/Nano Systems Group' },
  { id: 'manufacturing', ko: '고급가공기술 연구그룹', en: 'Advanced Manufacturing Group' },
  { id: 'automotive', ko: '자동차공학 연구그룹', en: 'Automotive Engineering Group' },
];
export const groupLabel = (id: string, ko: boolean) => { const g = researchGroupDefs.find((x) => x.id === id); return g ? (ko ? g.ko : g.en) : id; };
