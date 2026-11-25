// 경험·자기소개서 데이터 저장소. 모든 데이터는 이 브라우저(localStorage)에만 저장된다.
const KEY = 'ecm-profile-v1';

export const COMPETENCIES = [
  { id: 'problem', name: '문제해결', desc: '원인을 찾고 개선안을 만들어 해결' },
  { id: 'collab', name: '소통·협업', desc: '의견을 조율하고 함께 성과를 냄' },
  { id: 'lead', name: '리더십', desc: '방향을 제시하고 사람을 이끌고 키움' },
  { id: 'plan', name: '기획·전략', desc: '목표를 세우고 실행 계획을 설계' },
  { id: 'data', name: '분석·데이터', desc: '자료를 조사·분석해 근거를 만듦' },
  { id: 'drive', name: '실행·성과', desc: '끝까지 추진해 측정 가능한 결과를 냄' },
  { id: 'creative', name: '창의·혁신', desc: '새로운 방식이나 아이디어를 제안' },
  { id: 'resp', name: '책임감·성실', desc: '맡은 일을 꾸준히, 약속대로 완수' },
  { id: 'challenge', name: '도전·회복력', desc: '낯선 일에 도전하고 실패를 극복' },
  { id: 'customer', name: '이해관계자 지향', desc: '고객·수혜자·파트너의 필요를 이해' },
  { id: 'global', name: '글로벌', desc: '외국어·해외 경험·다문화 이해' },
  { id: 'esg', name: 'ESG·사회적 가치', desc: '환경·사회 문제에 관심을 두고 실천' },
];
export const compName = id => (COMPETENCIES.find(c => c.id === id) || {}).name || id;

export const EXP_TYPES = ['인턴·직무', '프로젝트·공모전', '동아리·학회', '봉사·사회공헌', '대외활동', '아르바이트', '학업·연구', '기타'];

// 경험 글에서 키워드를 제안하는 사전. 패턴이 보이면 키워드와 연결 역량을 제안한다.
export const KEYWORDS = [
  { kw: '협업', comp: 'collab', re: /협업|협력|함께|팀원|공동|팀 ?프로젝트/ },
  { kw: '갈등 조정', comp: 'collab', re: /갈등|조율|조정|설득|중재|의견 차이|이견/ },
  { kw: '커뮤니케이션', comp: 'collab', re: /소통|발표|커뮤니케이션|공유|보고|피드백/ },
  { kw: '팀 리딩', comp: 'lead', re: /팀장|리더|이끌|주도|총괄|대표|회장|부장/ },
  { kw: '교육·멘토링', comp: 'lead', re: /교육|멘토|강의|튜터|가르치|코칭/ },
  { kw: '동기 부여', comp: 'lead', re: /동기|독려|격려|참여율|사기/ },
  { kw: '기획', comp: 'plan', re: /기획|설계|전략|로드맵|구상/ },
  { kw: '목표 설정', comp: 'plan', re: /목표|KPI|지표|계획을 세/ },
  { kw: '일정 관리', comp: 'plan', re: /일정|마감|기한|스케줄|우선순위/ },
  { kw: '데이터 분석', comp: 'data', re: /데이터|분석|통계|엑셀|파이썬|Python|SQL|시각화|대시보드/i },
  { kw: '조사·리서치', comp: 'data', re: /조사|리서치|인터뷰|벤치마킹|설문|사례 분석|자료를 찾/ },
  { kw: '성과 수치화', comp: 'drive', re: /\d+(\.\d+)?\s*(%|퍼센트|배|명|건|개|원|만 ?원|시간|회|점)/ },
  { kw: '실행력', comp: 'drive', re: /실행|추진|완수|달성|성공적으로|마무리/ },
  { kw: '문제 정의', comp: 'problem', re: /문제|원인|병목|불편|한계/ },
  { kw: '개선', comp: 'problem', re: /개선|해결|보완|바꾸|고쳐/ },
  { kw: '효율화', comp: 'problem', re: /효율|프로세스|절차|자동화|단축|간소화/ },
  { kw: '책임감', comp: 'resp', re: /책임|맡은|약속|성실/ },
  { kw: '꾸준함', comp: 'resp', re: /끝까지|꾸준|매일|매주|지속적으로|포기하지/ },
  { kw: '새로운 도전', comp: 'challenge', re: /처음|도전|새로운 분야|낯선|시도/ },
  { kw: '실패 극복', comp: 'challenge', re: /실패|좌절|어려움|위기|극복|시행착오/ },
  { kw: '아이디어 제안', comp: 'creative', re: /아이디어|창의|고안|제안|새롭게/ },
  { kw: '콘텐츠 제작', comp: 'creative', re: /콘텐츠|디자인|영상|카드뉴스|SNS|홍보물|블로그/i },
  { kw: '고객 이해', comp: 'customer', re: /고객|사용자|이용자|수혜자|참여자|주민|민원/ },
  { kw: '파트너십', comp: 'customer', re: /이해관계자|협약|파트너|지자체|NGO|비영리|기관과/i },
  { kw: '외국어', comp: 'global', re: /영어|외국어|토익|토플|통역|번역|중국어|일본어|스페인어/ },
  { kw: '해외 경험', comp: 'global', re: /해외|교환학생|국제|유학|글로벌|다문화/ },
  { kw: '사회공헌', comp: 'esg', re: /봉사|사회공헌|기부|나눔|자원봉사|후원/ },
  { kw: '환경·탄소', comp: 'esg', re: /환경|탄소|기후|친환경|재활용|에너지|플라스틱|업사이클/ },
  { kw: '지역사회', comp: 'esg', re: /지역|마을|농촌|소상공인|상생|전통시장/ },
  { kw: '취약계층 지원', comp: 'esg', re: /취약|장애|노인|어르신|아동|청소년|다문화 가정|저소득|자립준비/ },
  { kw: 'ESG 경영', comp: 'esg', re: /ESG|지속가능|SDGs|지배구조|윤리경영|사회적 가치/i },
];

export function suggestKeywords(text, have = []) {
  const t = text || '';
  const out = [];
  for (const k of KEYWORDS) {
    if (have.some(h => h.kw === k.kw)) continue;
    const m = t.match(k.re);
    if (m) out.push({ kw: k.kw, comp: k.comp, hint: m[0] });
  }
  return out;
}

const empty = () => ({ experiences: [], letters: [], updatedAt: null });

export function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (p && Array.isArray(p.experiences) && Array.isArray(p.letters)) return p;
  } catch (e) { /* 저장소를 쓸 수 없는 환경 */ }
  return empty();
}
export function save(p) {
  p.updatedAt = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
}
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// 경험 전체를 모아 강점 키워드·역량을 집계한다.
export function strengths(p) {
  const kw = new Map(), comp = new Map();
  for (const e of p.experiences) {
    for (const k of e.keywords || []) {
      const v = kw.get(k.kw) || { kw: k.kw, comp: k.comp, count: 0, exps: [] };
      v.count++; v.exps.push(e.id); kw.set(k.kw, v);
    }
    for (const c of e.competencies || []) {
      const v = comp.get(c) || { id: c, name: compName(c), count: 0, exps: [] };
      v.count++; v.exps.push(e.id); comp.set(c, v);
    }
  }
  return {
    keywords: [...kw.values()].sort((a, b) => b.count - a.count || a.kw.localeCompare(b.kw, 'ko')),
    competencies: [...comp.values()].sort((a, b) => b.count - a.count),
  };
}

export function expText(e) {
  return [e.title, e.role, e.situation, e.task, e.action, e.result].filter(Boolean).join('\n');
}
export function expSummary(e) {
  const parts = [
    `제목: ${e.title || '(제목 없음)'} (${e.type || '기타'}${e.period ? ', ' + e.period : ''})`,
    e.role && `역할: ${e.role}`,
    e.situation && `상황: ${e.situation}`,
    e.task && `과제: ${e.task}`,
    e.action && `행동: ${e.action}`,
    e.result && `결과: ${e.result}`,
    (e.keywords || []).length && `키워드: ${e.keywords.map(k => k.kw).join(', ')}`,
    (e.competencies || []).length && `역량: ${e.competencies.map(compName).join(', ')}`,
  ];
  return parts.filter(Boolean).join('\n');
}

export function exportJSON(p) { return JSON.stringify({ app: 'esg-career-map', version: 1, ...p }, null, 2); }
export function importJSON(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.experiences) || !Array.isArray(d.letters)) throw new Error('형식이 맞지 않는 파일입니다.');
  return { experiences: d.experiences, letters: d.letters, updatedAt: d.updatedAt || null, seeded: true };
}

export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 2200);
}
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function setHeaderHeight() {
  const f = () => { const h = document.querySelector('.top'); if (h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px'); };
  f(); window.addEventListener('resize', f);
}

// 백업 파일 저장: 링크 클릭으로 내려받기
export function downloadFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

// 본문에 키워드가 드러났는지: 사전 키워드는 패턴으로, 직접 입력한 키워드는 글자 그대로 확인
export function keywordUsed(kw, text) {
  const t = text || '';
  const k = KEYWORDS.find(x => x.kw === kw);
  return k ? k.re.test(t) : t.toLowerCase().includes(String(kw).toLowerCase());
}

// 처음 방문한 사람에게 보여 줄 예시 경험 (수정하면 예시 표시가 사라짐)
export function ensureExamples(p) {
  if (p.experiences.length || p.seeded) return p;
  p.seeded = true;
  p.experiences.push({
    id: uid(), example: true, title: '[예시] 대학 봉사동아리 플로깅 캠페인', type: '봉사·사회공헌', period: '2024.03 – 2024.11', role: '기획팀장',
    situation: '캠퍼스 주변 산책로에 플라스틱 쓰레기가 많아 주민 민원이 이어졌고, 동아리 참여율은 30%대로 낮았습니다.',
    task: '참여율을 높이면서 지역 환경 문제를 눈에 보이게 개선하는 캠페인을 기획해야 했습니다.',
    action: '구청 환경과와 협약을 맺어 수거 도구를 지원받고, 걷기 앱 인증 이벤트를 도입했습니다. 팀원 12명과 역할을 나누고 매주 결과를 SNS 카드뉴스로 공유했습니다.',
    result: '8개월간 누적 참여 412명, 쓰레기 1.2톤을 수거했고 동아리 참여율은 72%로 올랐습니다. 구청 우수 봉사단체로 선정됐습니다.',
    keywords: [{ kw: '환경·탄소', comp: 'esg' }, { kw: '팀 리딩', comp: 'lead' }, { kw: '파트너십', comp: 'customer' }, { kw: '성과 수치화', comp: 'drive' }],
    competencies: ['esg', 'lead', 'customer', 'drive', 'plan'], updatedAt: new Date().toISOString(),
  });
  save(p);
  return p;
}

// 백업·복원 대화 상자
export function openBackup(p, onRestore) {
  const w = document.createElement('div'); w.className = 'modal';
  w.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="bk-t"><h2 id="bk-t">백업·복원</h2>
    <p class="note">경험과 자기소개서는 이 브라우저에만 저장됩니다. 다른 기기로 옮기거나 브라우저 기록을 지우기 전에 백업 파일을 받아 두세요.</p>
    <div class="row"><button class="btn primary" id="bk-save" type="button">백업 파일 받기</button>
    <label class="btn" for="bk-file">백업 파일로 복원</label><input id="bk-file" type="file" accept="application/json,.json" hidden></div>
    <p class="note" id="bk-msg">현재 경험 ${p.experiences.length}개, 자기소개서 ${p.letters.length}개</p>
    <div class="row" style="justify-content:flex-end"><button class="btn" id="bk-close" type="button">닫기</button></div></div>`;
  document.body.appendChild(w);
  const close = () => w.remove();
  w.addEventListener('click', ev => { if (ev.target === w) close(); });
  w.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
  w.querySelector('#bk-close').onclick = close;
  w.querySelector('#bk-save').onclick = () => downloadFile(`esg-career-map-backup-${new Date().toISOString().slice(0, 10)}.json`, exportJSON(p));
  w.querySelector('#bk-file').onchange = async ev => {
    const f = ev.target.files[0]; if (!f) return;
    try { const np = importJSON(await f.text()); save(np); w.querySelector('#bk-msg').textContent = `복원했습니다: 경험 ${np.experiences.length}개, 자기소개서 ${np.letters.length}개`; onRestore && onRestore(np); }
    catch (err) { w.querySelector('#bk-msg').textContent = '복원하지 못했습니다. ' + err.message; }
  };
  w.querySelector('#bk-save').focus();
}
