// Claude API 연결 모듈. 사용자가 입력한 본인 API 키로 브라우저에서 직접 호출한다.
// 키는 이 브라우저에만 저장되며(선택), 이 사이트의 서버나 저장소로 보내지지 않는다.
import Anthropic from '../vendor/anthropic-sdk-1.7.0.mjs';
import { esc } from './store.js';

const KEY_NAME = 'ecm-ai-key';
const MODEL_NAME = 'ecm-ai-model';

// 고를 수 있는 모델과 100만 토큰당 가격(달러). Haiku 5.5 가격은 요청당 입력 10만 토큰 이하 기준.
export const MODELS = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', short: 'Opus 5.5', in: 4, out: 20, desc: '가장 정확합니다. 코칭·피드백의 질이 가장 좋습니다.', fallback: true },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', short: 'Sonnet 5.5', in: 2, out: 10, desc: 'Opus의 절반 가격입니다. 대부분의 작업에 충분합니다.', fallback: true },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', short: 'Haiku 5.5', in: 0.10, out: 0.50, desc: '가장 저렴하고 빠릅니다. 키워드 제안·문장 점검에 적합하고, 깊은 피드백은 다소 약할 수 있습니다.', fallback: false },
];
// 기능별 1회 사용 예상 토큰 (입력, 출력). 글 길이와 경험 수에 따라 달라지는 대략값
const USAGE = [
  ['경험 키워드 AI 제안', 2000, 1500], ['문장 점검', 5000, 2500], ['작성 코칭·작성 제안', 5000, 4000], ['종합 피드백', 5000, 4500],
];
const USD_KRW = 1400; // 원화 환산용 대략 환율

export function getModel() {
  let id = '';
  try { id = localStorage.getItem(MODEL_NAME) || ''; } catch (e) { /* 저장소 사용 불가 */ }
  return MODELS.find(m => m.id === id) || MODELS[0];
}
function setModel(id) { try { localStorage.setItem(MODEL_NAME, id); } catch (e) { /* 무시 */ } }
function costRows(m) {
  return USAGE.map(([name, i, o]) => { const usd = (i * m.in + o * m.out) / 1e6; return [name, usd, Math.round(usd * USD_KRW)]; });
}

export function getKey() {
  try { return sessionStorage.getItem(KEY_NAME) || localStorage.getItem(KEY_NAME) || ''; } catch (e) { return ''; }
}
function setKey(key, remember) {
  try {
    sessionStorage.removeItem(KEY_NAME); localStorage.removeItem(KEY_NAME);
    if (key) (remember ? localStorage : sessionStorage).setItem(KEY_NAME, key);
  } catch (e) { /* 저장소 사용 불가 */ }
}
export const hasKey = () => !!getKey();

function client() {
  const apiKey = getKey();
  if (!apiKey) throw new Error('NO_KEY');
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

// 고른 모델로 요청 기본값을 만든다. Opus·Sonnet은 답을 거절하면 서버가 다른 모델로 다시 시도(fallbacks),
// Haiku 5.5는 이 기능이 없어 넣지 않는다.
function base() {
  const m = getModel();
  return m.fallback ? { model: m.id, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : { model: m.id };
}

export function errorMessage(e) {
  if (e && e.message === 'NO_KEY') return 'AI 기능을 쓰려면 먼저 상단의 "AI 설정"에서 Claude API 키를 입력하세요.';
  if (e instanceof Anthropic.AuthenticationError) return 'API 키가 올바르지 않습니다. "AI 설정"에서 키를 다시 확인하세요.';
  if (e instanceof Anthropic.PermissionDeniedError) return '이 API 키로는 해당 모델을 쓸 권한이 없습니다. Claude Console에서 키 권한을 확인하세요.';
  if (e instanceof Anthropic.RateLimitError) return '요청이 너무 많습니다. 잠시 뒤 다시 시도하세요.';
  if (e instanceof Anthropic.BadRequestError) return '요청 형식에 문제가 있습니다: ' + (e.message || '');
  if (e instanceof Anthropic.APIConnectionError) return '네트워크 연결에 실패했습니다. 인터넷 연결을 확인한 뒤 다시 시도하세요.';
  if (e instanceof Anthropic.APIError) return `API 오류(${e.status ?? '알 수 없음'})가 발생했습니다. 잠시 뒤 다시 시도하세요.`;
  return '알 수 없는 오류가 발생했습니다: ' + (e && e.message ? e.message : e);
}

function checkStop(msg) {
  if (msg.stop_reason === 'refusal') throw new Error('AI가 이 요청에 답하지 않았습니다. 내용을 바꿔 다시 시도하세요.');
}

// 긴 글: 스트리밍으로 받아 화면에 바로 표시
export async function streamText({ system, prompt, effort = 'medium', onText }) {
  const stream = client().beta.messages.stream({
    ...base(), max_tokens: 64000, output_config: { effort }, system,
    messages: [{ role: 'user', content: prompt }],
  });
  let acc = '';
  stream.on('text', t => { acc += t; onText && onText(acc); });
  const msg = await stream.finalMessage();
  checkStop(msg);
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return { text, truncated: msg.stop_reason === 'max_tokens' };
}

// 구조화 결과: JSON 스키마에 맞춘 응답
export async function json({ system, prompt, schema, effort = 'medium' }) {
  const msg = await client().beta.messages.create({
    ...base(), max_tokens: 16000, system,
    output_config: { effort, format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  });
  checkStop(msg);
  if (msg.stop_reason === 'max_tokens') throw new Error('응답이 너무 길어 중간에 끊겼습니다. 다시 시도하세요.');
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(text);
}

// 간단한 마크다운 → HTML (제목, 목록, 굵게, 인용)
export function md(src) {
  const lines = esc(src).split('\n');
  let html = '', list = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    let m;
    if ((m = l.match(/^#{1,6}\s+(.*)/))) { close(); html += `<h4>${m[1]}</h4>`; }
    else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${m[1]}</li>`; }
    else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${m[1]}</li>`; }
    else if ((m = l.match(/^&gt;\s?(.*)/))) { close(); html += `<blockquote>${m[1]}</blockquote>`; }
    else if (!l.trim()) { close(); }
    else { close(); html += `<p>${l}</p>`; }
  }
  close();
  return html;
}

// AI 설정 대화 상자
export function openSettings(onChange) {
  const cur = getKey();
  const model = getModel();
  let remembered = false;
  try { remembered = !!localStorage.getItem(KEY_NAME); } catch (e) { /* 무시 */ }
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="ai-set-title">
    <h2 id="ai-set-title">AI 설정</h2>
    <p class="note">자기소개서 코칭·제안·점검·피드백과 경험 키워드 AI 제안은 Anthropic의 Claude API를 씁니다. 본인 API 키를 입력하면 이 브라우저에서 바로 호출합니다. 사용한 만큼 키의 계정에 요금이 부과됩니다.</p>
    <label class="field"><span>Claude API 키</span>
      <input id="ai-key" class="input" type="password" autocomplete="off" placeholder="sk-ant-로 시작하는 키" value="${esc(cur)}"></label>
    <label class="row" style="font-size:14px"><input id="ai-remember" type="checkbox" ${remembered ? 'checked' : ''}> 이 브라우저에 기억하기 (체크하지 않으면 창을 닫을 때 지워짐)</label>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:4px">모델</legend>
      <div style="display:grid;gap:6px">${MODELS.map(m => `<label style="display:grid;grid-template-columns:auto 1fr auto;gap:2px 10px;align-items:start;border:1px solid var(--line);border-radius:10px;padding:9px 12px;cursor:pointer">
        <input type="radio" name="ai-model" value="${m.id}" ${m.id === model.id ? 'checked' : ''} style="margin-top:4px">
        <span><b>${m.name}</b><br><span class="note">${m.desc}</span></span>
        <span class="note num" style="text-align:right;white-space:nowrap">입력 $${m.in}<br>출력 $${m.out}</span></label>`).join('')}</div>
      <p class="note" style="margin:0">가격은 100만 토큰당 달러입니다.</p></fieldset>
    <div class="field"><span>한 번 누를 때 예상 비용 <small id="ai-cost-m"></small></span>
      <table style="width:100%;border-collapse:collapse;font-size:13px" id="ai-cost"></table>
      <p class="note" style="margin:0">대략값입니다. 글 길이와 선택한 경험 수에 따라 달라지며, 원화는 1달러 ${USD_KRW.toLocaleString()}원으로 환산했습니다. 실제 사용량은 Claude Console의 Usage에서 확인하세요.</p></div>
    <p class="note">키와 작성한 글은 이 사이트의 서버나 GitHub 저장소로 보내지지 않습니다. AI 기능 버튼을 누를 때만 해당 내용이 Anthropic API로 전송됩니다. 공용 컴퓨터에서는 기억하기를 켜지 마세요. 키는 <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Claude Console</a>에서 발급합니다.</p>
    <div class="row" style="justify-content:flex-end">
      <button class="btn danger" id="ai-del" type="button" ${cur ? '' : 'hidden'}>키 삭제</button>
      <button class="btn" id="ai-cancel" type="button">취소</button>
      <button class="btn primary" id="ai-save" type="button">저장</button>
    </div></div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); onChange && onChange(); };
  const paintCost = () => {
    const id = (wrap.querySelector('input[name="ai-model"]:checked') || {}).value;
    const m = MODELS.find(x => x.id === id) || model;
    wrap.querySelector('#ai-cost-m').textContent = `· ${m.short}`;
    wrap.querySelector('#ai-cost').innerHTML = costRows(m).map(([n, usd, krw]) => `<tr><td style="padding:4px 0;border-bottom:1px solid var(--line)">${n}</td><td class="num" style="text-align:right;border-bottom:1px solid var(--line)">약 $${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(3)}</td><td class="num" style="text-align:right;border-bottom:1px solid var(--line);color:var(--muted)">${krw < 1 ? '1원 미만' : '약 ' + krw.toLocaleString() + '원'}</td></tr>`).join('');
  };
  wrap.querySelectorAll('input[name="ai-model"]').forEach(r => r.addEventListener('change', paintCost));
  paintCost();
  wrap.querySelector('#ai-key').focus();
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  wrap.querySelector('#ai-cancel').onclick = close;
  wrap.querySelector('#ai-del').onclick = () => { setKey('', false); close(); };
  wrap.querySelector('#ai-save').onclick = () => {
    setKey(wrap.querySelector('#ai-key').value.trim(), wrap.querySelector('#ai-remember').checked);
    const sel = wrap.querySelector('input[name="ai-model"]:checked'); if (sel) setModel(sel.value);
    close();
  };
}

export function bindSettingsButton(btn, onChange) {
  const paint = () => { btn.textContent = hasKey() ? `AI 설정 · ${getModel().short}` : 'AI 설정'; btn.classList.toggle('primary', !hasKey()); };
  paint();
  btn.addEventListener('click', () => openSettings(() => { paint(); onChange && onChange(); }));
}
