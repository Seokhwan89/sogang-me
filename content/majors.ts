/** 학부과정 > 전공소개 (이승엽 교수님 원고 + Physical AI 소개자료). 4 fields keep the department's official field ids. */
export const majorFields = [
  { id: 'control', ko: '로봇 · 제어 · Physical AI', en: 'Robotics, Control & Physical AI', tagKo: 'AI에 몸을 주는 학문', tagEn: 'Giving AI a body',
    summaryKo: '정밀제어, 메카트로닉스, AI와 기계장치의 결합',
    bodyKo: '로봇 및 정밀 제어, 메카트로닉스 시스템, Physical AI를 연구합니다. 자동차, 항공기, 로봇 및 정밀 기계류의 힘과 진동을 해석하고 원하는 목표를 이루기 위한 설계와 능동 제어를 다룹니다. 미래 산업의 화두인 로봇 및 Physical AI와 직결되는 분야로, 다양한 로봇 설계·제작과 LLM AI를 기계장치에 연결하여 지능화하는 연구를 새롭게 시작하고 있으며, 바이오 응용으로 생체 모방 로봇·센서·액츄에이터와 의공학 응용 바이오 시스템을 연구합니다.',
    bodyEn: 'Robotics, precision control, mechatronic systems and Physical AI: analyzing forces and vibration in vehicles, aircraft, robots and precision machinery, and designing active control to reach a goal. New work connects LLM-based AI to machines and develops biomimetic robots, sensors and actuators for biomedical systems.',
    courses: ['동역학', '진동학', '자동제어', '디지털제어시스템', '메카트로닉스', '고급동역학', '로봇설계 및 제어'],
    coursesEn: ['Dynamics', 'Mechanical Vibrations', 'Automatic Control', 'Digital Control Systems', 'Mechatronics', 'Advanced Dynamics', 'Robot Design and Control'] },
  { id: 'design', ko: '설계 · 역학', en: 'Design & Mechanics', tagKo: "Physical AI의 '골격과 근육'", tagEn: "The 'skeleton and muscle' of Physical AI",
    summaryKo: '구조설계, 응력·진동 해석, 경량화와 내구성',
    bodyKo: '로봇이 물체를 집고, 걷고, 뛰려면 각 관절과 링크에 작용하는 힘·응력·변형·진동을 정확히 예측하고 이를 견딜 수 있는 구조를 설계해야 합니다. 고체역학, 동역학, 유한요소해석, 최적설계를 통해 Physical AI 하드웨어의 강성·경량화·내구성·동적 안정성을 확보합니다. 아무리 정교한 제어 명령을 내려도 구조가 하중을 감당하지 못하면 시스템은 파손되고, 강성이 부족하면 정밀 동작은 불가능합니다. 구동기의 힘이 원하는 운동으로 정확히 전달되려면 메커니즘 설계와 운동학·동역학 해석이 선행되어야 하며, 경량화와 강성을 동시에 달성하는 위상 최적설계, 충격과 피로에 대한 신뢰성 설계 역시 이 분야의 영역입니다. Physical AI가 물리 세계에서 \'버티고, 움직이는\' 모든 근본 원리는 여기서 출발합니다.',
    bodyEn: 'For a robot to grasp, walk and run, the forces, stresses, deformation and vibration at every joint and link must be predicted and a structure designed to withstand them. Solid mechanics, dynamics, finite element analysis and optimal design secure the stiffness, lightness, durability and dynamic stability of Physical AI hardware.',
    courses: ['고체역학', '제품설계기초', '재료거동학', '부품설계', '유한요소해석', '설계방법론', '최적설계 및 실습'],
    coursesEn: ['Solid Mechanics', 'Fundamentals of Product Design', 'Mechanical Behavior of Materials', 'Machine Component Design', 'Finite Element Analysis', 'Design Methodology', 'Optimal Design and Practice'] },
  { id: 'thermal', ko: '열 · 유체', en: 'Thermal & Fluids', tagKo: "Physical AI의 '혈관과 호흡'", tagEn: "The 'circulation and breathing' of Physical AI",
    summaryKo: '열관리, 유체해석, 모터·배터리·반도체의 발열 문제',
    bodyKo: 'Physical AI 시스템은 작동 과정에서 필연적으로 열이 발생합니다. 고출력 모터, 배터리, 전력 반도체의 발열을 효과적으로 관리하지 못하면 성능 저하와 수명 단축은 물론 안전 사고로 직결됩니다. 열유체 분야는 냉각 시스템 설계와 열전달 해석으로 이 문제를 해결하며, 유압·공압 액츄에이터의 유동 해석과 설계, 윤활 시스템 최적화, 연료전지·배터리 열관리 등 하드웨어가 안정적으로 장시간 구동되기 위한 필수 기반 기술을 제공합니다. 로봇이 한 번 움직이는 것이 아니라 \'지속적으로, 안정적으로\' 작동하려면 열유체 기술 없이는 불가능합니다.',
    bodyEn: 'Every Physical AI system generates heat. Without managing the heat of high-power motors, batteries and power semiconductors, performance drops, lifetime shortens and safety is at risk. Thermal-fluids engineering answers with cooling system design, heat transfer analysis, hydraulic/pneumatic actuator flow, lubrication and battery/fuel-cell thermal management.',
    courses: ['열역학I', '유체역학I', '자동차동력공학', '열전달', '냉동 및 공기조화', '신재생에너지공학개론', '전산유체역학', '연료전지개론'],
    coursesEn: ['Thermodynamics I', 'Fluid Mechanics I', 'Automotive Powertrain Engineering', 'Heat Transfer', 'Refrigeration and Air Conditioning', 'Introduction to Renewable Energy Engineering', 'Computational Fluid Dynamics', 'Introduction to Fuel Cells'] },
  { id: 'manufacturing', ko: '생산 · 제조', en: 'Manufacturing', tagKo: "Physical AI를 '현실로 만드는' 학문", tagEn: 'Making Physical AI real',
    summaryKo: '재료, 정밀가공, 3D 프린팅, MEMS 및 마이크로나노 제조',
    bodyKo: '컴퓨터 안에서 아무리 완벽하게 설계된 로봇도 실제로 제작할 수 없다면 의미가 없습니다. 생산·제조 분야는 재료의 선정과 개발, 정밀 가공, 적층 제조(3D 프린팅), 미세 조립을 통해 디지털 설계를 물리적 실체로 전환합니다. 소프트 로봇용 유연 소재, 경량 고강도 복합재, 생체적합성 재료는 재료·제조 기술의 혁신 없이는 확보할 수 없으며, 설계된 부품을 마이크로미터 정밀도로 가공·조립하는 것 역시 이 분야의 핵심 역량입니다. Physical AI가 실험실 시제품을 넘어 산업적으로 양산되려면 생산성과 품질을 동시에 보장하는 제조 공정 설계가 반드시 뒷받침되어야 합니다.',
    bodyEn: 'A perfectly designed robot means nothing if it cannot be built. Manufacturing turns digital designs into physical reality through material selection and development, precision machining, additive manufacturing (3D printing) and micro-assembly — from soft-robot materials and lightweight composites to micrometer-precision fabrication.',
    courses: ['기계제작실습', '기계재료기초', '생산공정', 'CAD', '복합재료입문', '마이크로나노기계공학', '공정설계의 CAE', '반도체공학', 'MEMS 설계제작'],
    coursesEn: ['Manufacturing Practice', 'Fundamentals of Engineering Materials', 'Manufacturing Processes', 'CAD', 'Introduction to Composite Materials', 'Micro/Nano Mechanical Engineering', 'CAE for Process Design', 'Semiconductor Engineering', 'MEMS Design and Fabrication'] },
];
export const introCourse = {
  ko: { name: '지능형 기계설계생산 입문', desc: '기계공학의 기초 역학지식을 기반으로 지능형 기계시스템의 이론·설계·제작 과정을 직접 체험하도록 구성된 교과목입니다. 프로젝트 기반 문제 해결 활동을 통해 물리, 재료, 전자, 정보과학, AI 등 다양한 학문이 융합된 현대 기계공학의 특성을 이해하고, 지능형 설계와 스마트 제조의 핵심적 역할을 수행하는 기계공학의 본질을 경험합니다. C·MATLAB·Arduino 등 기초 도구를 익히고 CAD/3D프린팅 실습, 센서-모터 기반 메카트로닉스 제작, 팀 프로젝트를 통해 창의적 설계 역량과 공학적 사고능력을 기릅니다.' },
  en: { name: 'Introduction to Intelligent Mechanical Design & Manufacturing', desc: 'A hands-on course in which students experience the theory, design and fabrication of intelligent mechanical systems through project-based problem solving — learning C, MATLAB and Arduino, CAD/3D printing, sensor-motor mechatronics and team projects.' },
};
export const introSlides = Array.from({ length: 15 }, (_, i) => `/images/intro/physical-ai-p${String(i + 1).padStart(2, '0')}.jpg`);
