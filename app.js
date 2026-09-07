import {
  initCloud,
  observeAuth,
  registerUser,
  loginUser,
  logoutUser,
  sendReset,
  loadUserDocument,
  saveUserState,
  cloudErrorMessage,
} from './cloud.js';

const DATA = window.VOCAB_DATA || [];
const ALL = DATA.flatMap((u) => u.words.map((w) => ({ ...w, unit: u.unit, unitTitle: u.title })));
const KEY = 'kelimeRobotu.v2';
const LEGACY_KEY = 'kelimeRobotu.v1';
const WEEK = [
  { day: 1, units: [1, 2], label: 'Friendship + Teen Life' },
  { day: 2, units: [3], label: 'In The Kitchen' },
  { day: 3, units: [4, 5], label: 'On The Phone + The Internet' },
  { day: 4, units: [6], label: 'Adventures' },
  { day: 5, units: [7], label: 'Tourism' },
  { day: 6, units: [8, 9], label: 'Chores + Science' },
  { day: 7, units: [10], label: 'Natural Forces + Genel tekrar' },
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const now = () => Date.now();
const DAY = 86400000;
const norm = (s) => (s || '')
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, "'")
  .replace(/[^a-z0-9çğıöşü\s'?-]/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const sample = (arr, n = 1) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

let state = loadState();
let session = null;
let authMode = 'login';
let cloudAvailable = false;
let cloudUser = null;
let guestMode = false;
let cloudSaveTimer = null;
let studyTimer = null;
let studyTickAt = null;
let bootingCloud = true;

function defaultState() {
  return {
    startDate: new Date().toISOString().slice(0, 10),
    progress: {},
    stats: { attempts: 0, correct: 0 },
    streak: { lastDate: null, count: 0 },
    activity: {},
    sound: true,
    dark: false,
  };
}

function normalizeState(raw) {
  const base = defaultState();
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    ...base,
    ...src,
    progress: src.progress && typeof src.progress === 'object' ? src.progress : {},
    stats: { ...base.stats, ...(src.stats || {}) },
    streak: { ...base.streak, ...(src.streak || {}) },
    activity: src.activity && typeof src.activity === 'object' ? src.activity : {},
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || '{}';
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function save({ cloud = true } = {}) {
  localStorage.setItem(KEY, JSON.stringify(state));
  if (cloud && cloudAvailable && cloudUser && !guestMode) scheduleCloudSave();
}

function scheduleCloudSave(delay = 900) {
  if (!cloudAvailable || !cloudUser || guestMode) return;
  clearTimeout(cloudSaveTimer);
  setSyncStatus('Senkronize ediliyor…');
  cloudSaveTimer = setTimeout(() => syncNow(false), delay);
}

async function syncNow(showToast = true) {
  if (!cloudAvailable || !cloudUser || guestMode) {
    if (showToast) toast('Bulut senkronizasyonu için hesabınla giriş yapmalısın.');
    return;
  }
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = null;
  try {
    setSyncStatus('Senkronize ediliyor…');
    await saveUserState(cloudUser, state);
    setSyncStatus('Bulutta güncel ✓');
    if (showToast) toast('İlerleme buluta kaydedildi.');
  } catch (error) {
    console.error(error);
    setSyncStatus('Senkronizasyon bekliyor');
    if (showToast) toast(cloudErrorMessage(error));
  }
}

function pFor(id) {
  return state.progress[id] || {
    level: 0,
    attempts: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    nextReview: 0,
    lastSeen: 0,
    lastWrong: false,
  };
}

function setP(id, p) {
  state.progress[id] = p;
  save();
}

function currentDay() {
  const s = new Date(`${state.startDate}T00:00:00`);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.min(7, Math.max(1, Math.floor((d - s) / DAY) + 1));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function activityFor(date = todayKey()) {
  if (!state.activity[date]) {
    state.activity[date] = { seconds: 0, attempts: 0, correct: 0, sessions: 0 };
  }
  return state.activity[date];
}

function touchStreak() {
  const t = todayKey();
  if (state.streak.lastDate === t) return;
  if (!state.streak.lastDate) {
    state.streak = { lastDate: t, count: 1 };
  } else {
    const prev = new Date(`${state.streak.lastDate}T00:00:00`);
    const cur = new Date(`${t}T00:00:00`);
    const diff = Math.round((cur - prev) / DAY);
    state.streak = { lastDate: t, count: diff === 1 ? state.streak.count + 1 : 1 };
  }
  save();
}

function startStudyTimer() {
  stopStudyTimer(false);
  const activity = activityFor();
  activity.sessions += 1;
  studyTickAt = Date.now();
  save();
  studyTimer = setInterval(() => flushStudyTime(false), 60000);
}

function flushStudyTime(cloud = true) {
  if (!studyTickAt || !session) return;
  const current = Date.now();
  if (!document.hidden) {
    const seconds = Math.max(0, Math.min(120, Math.round((current - studyTickAt) / 1000)));
    if (seconds) activityFor().seconds += seconds;
  }
  studyTickAt = current;
  save({ cloud });
  renderTodayMinutes();
}

function stopStudyTimer(cloud = true) {
  if (studyTickAt && session) flushStudyTime(cloud);
  if (studyTimer) clearInterval(studyTimer);
  studyTimer = null;
  studyTickAt = null;
}

function wordScore(w) {
  return pFor(w.id).level || 0;
}

function learnedCount() {
  return ALL.filter((w) => wordScore(w) >= 3).length;
}

function reviewCount() {
  return ALL.filter((w) => {
    const p = pFor(w.id);
    return p.attempts > 0 && p.level < 3;
  }).length;
}

function accuracy() {
  return state.stats.attempts ? Math.round((state.stats.correct / state.stats.attempts) * 100) : 0;
}

function renderTodayMinutes() {
  const seconds = activityFor().seconds || 0;
  $('#todayMinutes').textContent = seconds < 60 && seconds > 0 ? '<1 dk' : `${Math.round(seconds / 60)} dk`;
}

function renderDashboard() {
  const learned = learnedCount();
  const pct = ALL.length ? Math.round((learned / ALL.length) * 100) : 0;
  const day = currentDay();
  $('#overallPct').textContent = `${pct}%`;
  $('#overallRing').style.background = `conic-gradient(var(--primary) ${pct * 3.6}deg,#dbe5de 0deg)`;
  $('#learnedCount').textContent = learned;
  $('#reviewCount').textContent = reviewCount();
  $('#accuracyValue').textContent = `${accuracy()}%`;
  $('#streakValue').textContent = state.streak.count || 0;
  renderTodayMinutes();
  $('#weekBadge').textContent = `${day}. Gün`;

  const plan = WEEK[day - 1];
  $('#heroTitle').textContent = `Bugün: ${plan.label}`;
  $('#heroText').textContent = `Toplam ${ALL.length} kelime/kalıp var. Robot yeni kelimeleri küçük gruplarla öğretir, yanlışları tekrar kuyruğuna alır.`;
  $('#weekPlan').innerHTML = WEEK.map((x) => `
    <div class="day-row ${x.day === day ? 'current' : ''}">
      <div class="day-num">Gün ${x.day}</div>
      <div class="day-units">${x.label}<small>Ünite ${x.units.join(' + ')}</small></div>
      <span class="badge">${x.day < day ? 'Geçti' : x.day === day ? 'Bugün' : 'Plan'}</span>
    </div>`).join('');

  $('#unitProgress').innerHTML = DATA.map((u) => {
    const l = u.words.filter((w) => wordScore(w) >= 3).length;
    const p = u.words.length ? Math.round((l / u.words.length) * 100) : 0;
    return `<div class="unit-row"><div><b>Ünite ${u.unit} • ${u.title}</b><small>${l}/${u.words.length} öğrenildi</small></div><div class="mini-track"><div class="mini-fill" style="width:${p}%"></div></div><div class="unit-pct">${p}%</div></div>`;
  }).join('');

  $('#unitButtons').innerHTML = DATA.map((u) => `<button class="unit-select-btn" data-unit="${u.unit}"><b>Ünite ${u.unit} • ${u.title}</b><small>${u.words.length} kelime/kalıp</small></button>`).join('');
}

function dailyPool() {
  const day = currentDay();
  const units = WEEK[day - 1].units;
  const pool = ALL.filter((w) => units.includes(w.unit));
  const due = pool.filter((w) => {
    const p = pFor(w.id);
    return p.attempts > 0 && (p.nextReview || 0) <= now() && p.level < 3;
  });
  const fresh = pool.filter((w) => pFor(w.id).attempts === 0);
  const mastered = pool.filter((w) => pFor(w.id).level >= 3);
  return [...sample(due, 5), ...sample(fresh, 7), ...sample(mastered, 2)].slice(0, 12);
}

function learnPool(unit = null) {
  const pool = unit ? ALL.filter((w) => w.unit === unit) : ALL.filter((w) => WEEK[currentDay() - 1].units.includes(w.unit));
  const fresh = pool.filter((w) => pFor(w.id).attempts === 0);
  const weak = pool.filter((w) => pFor(w.id).attempts > 0 && pFor(w.id).level < 3);
  return [...sample(fresh, 8), ...sample(weak, Math.max(0, 8 - fresh.length))].slice(0, 8);
}

function wrongPool() {
  const wrong = ALL.filter((w) => {
    const p = pFor(w.id);
    return p.lastWrong || p.wrong > p.correct || (p.attempts > 0 && p.level < 2);
  });
  return sample(wrong, 12);
}

function startMode(mode, unit = null) {
  let words = [];
  let title = '';
  if (mode === 'daily') { words = dailyPool(); title = 'Bugünün Çalışması'; }
  if (mode === 'learn') { words = learnPool(unit); title = unit ? `Ünite ${unit} Öğren` : 'Yeni Kelimeler'; }
  if (mode === 'wrong') { words = wrongPool(); title = 'Yanlışlarım'; }
  if (mode === 'quick') { words = sample(ALL, 10); title = 'Hızlı Test'; }
  if (mode === 'hard') { words = sample(ALL, 20); title = 'Zor Test'; }

  if (!words.length) {
    toast(mode === 'wrong' ? 'Henüz tekrar gerektiren kelime yok. Harika!' : 'Bu bölümde yeni kelime kalmadı. Hızlı test deneyebilirsin.');
    return;
  }

  session = {
    mode,
    title,
    words: shuffle(words),
    queue: [],
    index: 0,
    correct: 0,
    wrong: 0,
    retries: {},
    phase: mode === 'learn' ? 'teach' : 'quiz',
    teachIndex: 0,
    current: null,
    answered: false,
  };
  startStudyTimer();
  $('#menuArea').classList.add('hidden');
  $('#sessionArea').classList.remove('hidden');
  $('#robotStatus').textContent = `${title} başladı.`;
  renderSession();
}

function endSession() {
  stopStudyTimer();
  const total = session.correct + session.wrong;
  const pct = total ? Math.round((session.correct / total) * 100) : 0;
  $('#chat').innerHTML = `<div class="session-summary"><div class="score-big">${pct}%</div><h3>${session.title} tamamlandı</h3><p>${session.correct} doğru • ${session.wrong} yanlış</p>${pct >= 90 ? '<p>🏆 Çok iyi!' : '<p>🔁 Yanlış kelimeler tekrar listesine eklendi.'}</p></div>`;
  $('#answerArea').innerHTML = '<button class="next-btn" id="backMenuBtn">Ana menüye dön</button>';
  $('#sessionLabel').textContent = 'Tamamlandı';
  $('#sessionProgress').style.width = '100%';
  $('#backMenuBtn').onclick = () => {
    session = null;
    $('#sessionArea').classList.add('hidden');
    $('#menuArea').classList.remove('hidden');
    $('#robotStatus').textContent = 'Hazırım. Yeni bir çalışma seçebilirsin.';
    renderDashboard();
  };
}

function renderSession() {
  if (!session) return;
  if (session.phase === 'teach') { renderTeach(); return; }
  if (session.index >= session.words.length && !session.queue.length) { endSession(); return; }
  if (session.index >= session.words.length && session.queue.length) {
    session.words = [...session.queue];
    session.queue = [];
    session.index = 0;
  }

  const w = session.words[session.index];
  session.current = w;
  session.answered = false;
  const total = session.words.length;
  $('#sessionLabel').textContent = `Soru ${session.index + 1} / ${total}`;
  $('#sessionScore').textContent = `${session.correct} doğru`;
  $('#sessionProgress').style.width = `${Math.round((session.index / total) * 100)}%`;
  const qtype = chooseQuestionType(session.mode);
  session.qtype = qtype;
  if (qtype === 'tr-en') renderTextQuestion(w, true);
  else if (qtype === 'en-tr') renderTextQuestion(w, false);
  else renderMCQ(w, qtype === 'mcq-tr-en');
}

function renderTeach() {
  if (session.teachIndex >= session.words.length) {
    session.phase = 'quiz';
    session.index = 0;
    session.words = shuffle(session.words);
    $('#robotStatus').textContent = 'Şimdi öğrendiğimiz kelimeleri test ediyoruz.';
    renderSession();
    return;
  }

  const w = session.words[session.teachIndex];
  $('#sessionLabel').textContent = `Öğretim ${session.teachIndex + 1} / ${session.words.length}`;
  $('#sessionScore').textContent = 'Öğrenme turu';
  $('#sessionProgress').style.width = `${Math.round((session.teachIndex / session.words.length) * 100)}%`;
  $('#chat').innerHTML = `<div class="bubble bot"><span class="big-word">${escapeHtml(w.en)}</span><span class="meaning">${escapeHtml(w.tr)}</span><div class="example">Ünite ${w.unit} • ${w.unitTitle}</div></div>`;
  $('#answerArea').innerHTML = '<div class="hint-row"><button class="speak-btn" id="speakWord" title="Telaffuz">🔊</button><button class="submit-btn" id="learnNext">Öğrendim, devam →</button></div>';
  $('#speakWord').onclick = () => speak(w.en);
  $('#learnNext').onclick = () => {
    speak(w.en);
    session.teachIndex += 1;
    renderTeach();
  };
}

function chooseQuestionType() {
  return sample(['tr-en', 'en-tr', 'mcq-tr-en', 'mcq-en-tr'], 1)[0];
}

function renderTextQuestion(w, trToEn) {
  const prompt = trToEn ? `“${w.tr}” İngilizce ne?` : `“${w.en}” Türkçe ne demek?`;
  $('#chat').innerHTML = `<div class="bubble bot">${escapeHtml(prompt)}${!trToEn ? ' <button class="speak-btn" id="speakInline">🔊</button>' : ''}</div>`;
  $('#answerArea').innerHTML = '<form class="answer-form" id="answerForm"><input id="answerInput" autocomplete="off" placeholder="Cevabını yaz..."/><button class="submit-btn">Kontrol et</button></form><div class="hint-row"><button class="text-btn" id="hintBtn">İpucu göster</button><span></span></div>';
  if (!trToEn) $('#speakInline').onclick = () => speak(w.en);
  $('#answerInput').focus();
  $('#answerForm').onsubmit = (e) => {
    e.preventDefault();
    if (session.answered) return;
    evaluateText(w, $('#answerInput').value, trToEn);
  };
  $('#hintBtn').onclick = () => {
    const ans = trToEn ? w.en : w.tr;
    toast(`İpucu: ${ans.slice(0, Math.max(1, Math.ceil(ans.length / 3)))}…`);
  };
}

function acceptedAnswers(w, trToEn) {
  const raw = trToEn ? w.en : w.tr;
  return raw.split(/[,/]/).map(norm).filter(Boolean);
}

function evaluateText(w, value, trToEn) {
  const v = norm(value);
  const accepts = acceptedAnswers(w, trToEn);
  const ok = accepts.some((a) => v === a || (a.length > 5 && similarity(v, a) >= 0.88));
  showFeedback(w, ok);
}

function renderMCQ(w, trToEn) {
  const sameUnit = ALL.filter((x) => x.unit === w.unit && x.id !== w.id);
  const distract = sample(sameUnit, 3);
  const options = shuffle([w, ...distract]);
  const prompt = trToEn ? `“${w.tr}” anlamına gelen İngilizce hangisi?` : `“${w.en}” ne demek?`;
  $('#chat').innerHTML = `<div class="bubble bot">${escapeHtml(prompt)} ${!trToEn ? '<button class="speak-btn" id="speakInline">🔊</button>' : ''}</div>`;
  $('#answerArea').innerHTML = `<div class="choices">${options.map((o) => `<button class="choice" data-id="${o.id}">${escapeHtml(trToEn ? o.en : o.tr)}</button>`).join('')}</div>`;
  if (!trToEn) $('#speakInline').onclick = () => speak(w.en);
  $$('.choice').forEach((b) => {
    b.onclick = () => {
      if (session.answered) return;
      const ok = b.dataset.id === w.id;
      $$('.choice').forEach((x) => {
        if (x.dataset.id === w.id) x.classList.add('correct-choice');
        else if (x === b && !ok) x.classList.add('wrong-choice');
        x.disabled = true;
      });
      showFeedback(w, ok, true);
    };
  });
}

function showFeedback(w, ok, keepChoices = false) {
  session.answered = true;
  touchStreak();
  state.stats.attempts += 1;
  const activity = activityFor();
  activity.attempts += 1;
  if (ok) {
    state.stats.correct += 1;
    activity.correct += 1;
    session.correct += 1;
  } else {
    session.wrong += 1;
  }

  updateWordProgress(w, ok);
  const fb = document.createElement('div');
  fb.className = `bubble bot ${ok ? 'correct' : 'wrong'}`;
  fb.innerHTML = ok
    ? `✅ Doğru! <b>${escapeHtml(w.en)}</b> = ${escapeHtml(w.tr)}`
    : `❌ Doğrusu: <b>${escapeHtml(w.en)}</b> = ${escapeHtml(w.tr)}<br><small>Bu kelime tekrar kuyruğuna eklendi.</small>`;
  $('#chat').appendChild(fb);
  speak(w.en);

  if (!ok) {
    session.retries[w.id] = (session.retries[w.id] || 0) + 1;
    if (session.retries[w.id] <= 2) session.queue.push(w);
  }

  const area = $('#answerArea');
  if (!keepChoices) area.innerHTML = '';
  const next = document.createElement('button');
  next.className = 'next-btn';
  next.textContent = 'Sonraki →';
  next.onclick = () => {
    session.index += 1;
    renderSession();
  };
  area.appendChild(next);
  save();
  renderDashboard();
}

function updateWordProgress(w, ok) {
  const p = pFor(w.id);
  p.attempts += 1;
  p.lastSeen = now();
  p.lastWrong = !ok;
  if (ok) {
    p.correct += 1;
    p.streak += 1;
    if (p.streak >= 2) p.level = Math.min(3, p.level + 1);
    const delays = [10 * 60 * 1000, 6 * 60 * 60 * 1000, DAY, 3 * DAY];
    p.nextReview = now() + delays[p.level];
  } else {
    p.wrong += 1;
    p.streak = 0;
    p.level = Math.max(0, p.level - 1);
    p.nextReview = now() + 3 * 60 * 1000;
  }
  state.progress[w.id] = p;
}

function similarity(a, b) {
  if (a === b) return 1;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return 0;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}

function speak(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

function applyTheme() {
  document.body.classList.toggle('dark', state.dark);
  $('#themeToggle').textContent = state.dark ? '☀️' : '🌙';
  $('#soundToggle').textContent = state.sound ? '🔊' : '🔇';
}

function setSyncStatus(text) {
  $('#syncStatus').textContent = text;
  $('#cloudBadge').textContent = cloudUser && !guestMode ? `☁️ ${text}` : '☁️ Misafir';
}

function updateAccountUI() {
  if (cloudUser && !guestMode) {
    $('#userName').textContent = cloudUser.displayName || cloudUser.email?.split('@')[0] || 'Öğrenci';
    $('#accountBtn').textContent = '⇥';
    $('#accountBtn').title = 'Çıkış yap';
    $('#syncNowBtn').disabled = false;
    $('#accountNote').textContent = `Giriş yapılan hesap: ${cloudUser.email || ''}. İlerleme Firebase üzerinde kişisel hesabına kaydediliyor.`;
    setSyncStatus('Bulutta güncel ✓');
  } else {
    $('#userName').textContent = 'Misafir';
    $('#accountBtn').textContent = '↪';
    $('#accountBtn').title = 'Giriş yap';
    $('#syncNowBtn').disabled = true;
    $('#accountNote').textContent = 'Misafir modundasın. Hesapla giriş yaparsan verilerin farklı cihazlarda senkronize edilir.';
    $('#syncStatus').textContent = 'Bu cihazda';
    $('#cloudBadge').textContent = '☁️ Misafir';
  }
}

function showApp() {
  $('#authGate').classList.add('hidden');
  $('#appShell').classList.remove('hidden');
  applyTheme();
  updateAccountUI();
  renderDashboard();
}

function showAuth() {
  stopStudyTimer(false);
  session = null;
  $('#sessionArea').classList.add('hidden');
  $('#menuArea').classList.remove('hidden');
  $('#appShell').classList.add('hidden');
  $('#authGate').classList.remove('hidden');
}

function setAuthMode(mode) {
  authMode = mode;
  const register = mode === 'register';
  $('#loginTab').classList.toggle('active', !register);
  $('#registerTab').classList.toggle('active', register);
  $('#nameField').classList.toggle('hidden', !register);
  $('#authName').required = register;
  $('#authPassword').autocomplete = register ? 'new-password' : 'current-password';
  $('#authSubmit').textContent = register ? 'Hesap oluştur' : 'Giriş yap';
  $('#resetPasswordBtn').classList.toggle('hidden', register);
}

function setAuthBusy(busy) {
  $('#authSubmit').disabled = busy;
  $('#loginTab').disabled = busy;
  $('#registerTab').disabled = busy;
  $('#authSubmit').textContent = busy ? 'Bekleyin…' : authMode === 'register' ? 'Hesap oluştur' : 'Giriş yap';
}

function setupMessage(message, isError = true) {
  const el = $('#authSetupMessage');
  if (!message) {
    el.classList.add('hidden');
    return;
  }
  el.textContent = message;
  el.classList.remove('hidden');
  el.classList.toggle('success', !isError);
}

async function handleAuthUser(user) {
  cloudUser = user || null;
  if (!user) {
    if (!guestMode) showAuth();
    return;
  }

  guestMode = false;
  showApp();
  setSyncStatus('Buluttan yükleniyor…');
  try {
    const remote = await loadUserDocument(user.uid);
    if (remote?.learningState) {
      state = normalizeState(remote.learningState);
      localStorage.setItem(KEY, JSON.stringify(state));
    } else {
      await saveUserState(user, state);
    }
    applyTheme();
    renderDashboard();
    updateAccountUI();
    setSyncStatus('Bulutta güncel ✓');
  } catch (error) {
    console.error(error);
    setSyncStatus('Senkronizasyon bekliyor');
    toast(`Bulut verisi yüklenemedi: ${cloudErrorMessage(error)}`);
  }
}

async function bootstrapCloud() {
  bootingCloud = true;
  setupMessage('Firebase bağlantısı kontrol ediliyor…', false);
  try {
    await initCloud();
    cloudAvailable = true;
    setupMessage('Bulut bağlantısı hazır. Giriş yapabilir veya yeni hesap oluşturabilirsin.', false);
    observeAuth(handleAuthUser);
  } catch (error) {
    cloudAvailable = false;
    console.warn(error);
    setupMessage(`${cloudErrorMessage(error)} Vercel/Firebase ayarları tamamlanana kadar misafir modu kullanılabilir.`, true);
  } finally {
    bootingCloud = false;
  }
}

$$('.mode-btn').forEach((b) => {
  b.onclick = () => {
    const m = b.dataset.mode;
    if (m === 'units') $('#unitModal').classList.remove('hidden');
    else startMode(m);
  };
});

$('#closeUnitModal').onclick = () => $('#unitModal').classList.add('hidden');
$('#unitModal').onclick = (e) => { if (e.target === $('#unitModal')) $('#unitModal').classList.add('hidden'); };
$('#unitButtons').addEventListener('click', (e) => {
  const b = e.target.closest('[data-unit]');
  if (!b) return;
  $('#unitModal').classList.add('hidden');
  startMode('learn', Number(b.dataset.unit));
});

$('#soundToggle').onclick = () => {
  state.sound = !state.sound;
  save();
  $('#soundToggle').textContent = state.sound ? '🔊' : '🔇';
  toast(state.sound ? 'Ses açıldı' : 'Ses kapatıldı');
};

$('#themeToggle').onclick = () => {
  state.dark = !state.dark;
  save();
  applyTheme();
};

$('#resetWeekBtn').onclick = () => {
  if (confirm('Hafta planı bugün 1. gün olarak yeniden başlasın mı?')) {
    state.startDate = todayKey();
    save();
    renderDashboard();
    toast('Hafta planı yeniden başlatıldı');
  }
};

$('#resetProgressBtn').onclick = () => {
  if (confirm('Tüm kelime ilerlemesi, puanlar ve çalışma kayıtları silinsin mi?')) {
    const dark = state.dark;
    const sound = state.sound;
    state = defaultState();
    state.dark = dark;
    state.sound = sound;
    save();
    renderDashboard();
    toast('İlerleme sıfırlandı');
  }
};

$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kelime-robotu-ilerleme.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

$('#importInput').onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      state = normalizeState(JSON.parse(r.result));
      save();
      applyTheme();
      renderDashboard();
      toast('İlerleme yüklendi');
    } catch {
      toast('Geçersiz yedek dosyası');
    }
  };
  r.readAsText(f);
  e.target.value = '';
};

$('#syncNowBtn').onclick = () => syncNow(true);
$('#loginTab').onclick = () => setAuthMode('login');
$('#registerTab').onclick = () => setAuthMode('register');

$('#guestBtn').onclick = () => {
  guestMode = true;
  cloudUser = null;
  showApp();
  toast('Misafir modu açıldı. İlerleme bu cihazda saklanacak.');
};

$('#accountBtn').onclick = async () => {
  if (cloudUser && !guestMode) {
    if (!confirm('Hesaptan çıkış yapılsın mı?')) return;
    stopStudyTimer();
    try {
      await syncNow(false);
      await logoutUser();
    } catch (error) {
      toast(cloudErrorMessage(error));
    }
  } else {
    guestMode = false;
    showAuth();
  }
};

$('#authForm').onsubmit = async (e) => {
  e.preventDefault();
  if (bootingCloud) {
    toast('Firebase bağlantısı hâlâ kontrol ediliyor.');
    return;
  }
  if (!cloudAvailable) {
    toast('Firebase yapılandırması tamamlanmadan hesapla giriş yapılamaz.');
    return;
  }

  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  const name = $('#authName').value.trim();
  setAuthBusy(true);
  try {
    if (authMode === 'register') {
      await registerUser({ name, email, password, initialState: state });
      toast('Hesap oluşturuldu. İlerlemen artık bulutta saklanacak.');
    } else {
      await loginUser(email, password);
      toast('Giriş başarılı.');
    }
    $('#authPassword').value = '';
  } catch (error) {
    toast(cloudErrorMessage(error));
  } finally {
    setAuthBusy(false);
  }
};

$('#resetPasswordBtn').onclick = async () => {
  const email = $('#authEmail').value.trim();
  if (!email) {
    toast('Önce e-posta adresini yaz.');
    $('#authEmail').focus();
    return;
  }
  if (!cloudAvailable) {
    toast('Firebase bağlantısı hazır değil.');
    return;
  }
  try {
    await sendReset(email);
    toast('Şifre sıfırlama bağlantısı e-posta adresine gönderildi.');
  } catch (error) {
    toast(cloudErrorMessage(error));
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushStudyTime(true);
  else if (session) studyTickAt = Date.now();
});

window.addEventListener('beforeunload', () => {
  flushStudyTime(false);
  localStorage.setItem(KEY, JSON.stringify(state));
});

setAuthMode('login');
applyTheme();
renderDashboard();
bootstrapCloud();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
