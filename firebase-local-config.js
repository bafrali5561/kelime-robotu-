// Firebase Web App configuration for Kelime Robotu.
// Firebase web config values are client-side identifiers; access control is enforced
// by Firebase Authentication and Firestore Security Rules.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyByo95zf6aa3eK5pHx2LX1GGyFj8Fm5-HE",
  authDomain: "kelime-robotu.firebaseapp.com",
  projectId: "kelime-robotu",
  storageBucket: "kelime-robotu.firebasestorage.app",
  messagingSenderId: "406494738437",
  appId: "1:406494738437:web:ad0562dd18cda8408a446c",
  measurementId: "G-JCRHEP2XJR"
};

// UI/progress consistency layer.
// The original learning engine marks a word as fully mastered only at level 3.
// For dashboard feedback, we also credit meaningful partial learning so progress
// does not appear stuck at 0 while the student is answering correctly.
(() => {
  const STATE_KEYS = ['kelimeRobotu.v2', 'kelimeRobotu.v1'];

  function readState() {
    for (const key of STATE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
    }
    return { progress: {}, stats: {}, streak: {}, activity: {} };
  }

  function wordLearningPercent(progress) {
    const p = progress || {};
    const attempts = Number(p.attempts || 0);
    const correct = Number(p.correct || 0);
    const level = Number(p.level || 0);
    const lastWrong = Boolean(p.lastWrong);
    if (!attempts) return 0;

    const accuracy = Math.max(0, Math.min(1, correct / attempts));
    if (level >= 3 && !lastWrong) return 100;

    // A first correct answer is progress, two solid recalls should visibly count
    // as mostly learned, while a recent wrong answer reduces confidence.
    let score = 15;
    score += Math.min(correct, 3) * 18;
    score += Math.round(accuracy * 25);
    score += Math.min(level, 2) * 7;
    if (lastWrong) score -= 12;

    return Math.max(8, Math.min(95, Math.round(score)));
  }

  function isLearned(progress) {
    const p = progress || {};
    const attempts = Number(p.attempts || 0);
    if (!attempts || p.lastWrong) return false;
    return wordLearningPercent(p) >= 70;
  }

  function learningSummary() {
    const state = readState();
    const data = window.VOCAB_DATA || [];
    const words = data.flatMap((unit) => unit.words || []);
    const progress = state.progress || {};

    const learned = words.filter((w) => isLearned(progress[w.id])).length;
    const studied = words.filter((w) => Number(progress[w.id]?.attempts || 0) > 0).length;
    const review = words.filter((w) => {
      const p = progress[w.id];
      return Number(p?.attempts || 0) > 0 && (!isLearned(p) || Boolean(p?.lastWrong));
    }).length;
    const totalScore = words.reduce((sum, w) => sum + wordLearningPercent(progress[w.id]), 0);
    const percent = words.length ? Math.round(totalScore / words.length) : 0;

    return { state, data, words, progress, learned, studied, review, percent };
  }

  function refreshTopProgress() {
    const summary = learningSummary();

    const learnedEl = document.getElementById('learnedCount');
    if (learnedEl) learnedEl.textContent = String(summary.learned);

    const reviewEl = document.getElementById('reviewCount');
    if (reviewEl) reviewEl.textContent = String(summary.review);

    const pctEl = document.getElementById('overallPct');
    if (pctEl) pctEl.textContent = `${summary.percent}%`;

    const ring = document.getElementById('overallRing');
    if (ring) ring.style.background = `conic-gradient(var(--primary) ${summary.percent * 3.6}deg,#dbe5de 0deg)`;

    // Keep XP/level display consistent with the corrected learned count.
    const stats = summary.state.stats || {};
    const streak = summary.state.streak || {};
    const sessions = Object.values(summary.state.activity || {}).reduce((sum, item) => sum + Number(item?.sessions || 0), 0);
    const xp = (Number(stats.correct || 0) * 8) + (summary.learned * 20) + (Number(streak.count || 0) * 15) + (sessions * 5);
    const perLevel = 120;
    const level = Math.max(1, Math.floor(xp / perLevel) + 1);
    const currentXp = xp - ((level - 1) * perLevel);
    const levelPct = Math.max(0, Math.min(100, Math.round((currentXp / perLevel) * 100)));
    const ranks = ['Kelime Kaşifi', 'Kelime Oyuncusu', 'Kelime Ustası', 'Cümle Avcısı', 'Dil Şampiyonu', 'Süper Hafıza'];
    const rank = ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 2))];

    const levelChip = document.getElementById('levelChip');
    if (levelChip) levelChip.textContent = `Seviye ${level}`;
    const rankName = document.getElementById('rankName');
    if (rankName) rankName.textContent = rank;
    const xpText = document.getElementById('xpText');
    if (xpText) xpText.textContent = `${currentXp} / ${perLevel} XP`;
    const xpFill = document.getElementById('xpFill');
    if (xpFill) xpFill.style.width = `${levelPct}%`;
    const xpHint = document.getElementById('xpHint');
    if (xpHint) xpHint.textContent = `Toplam ${xp} XP • Bir sonraki seviye için ${Math.max(0, perLevel - currentXp)} XP kaldı.`;

    // Correct the Kelime Avcısı badge, which previously used only level-3 mastery.
    document.querySelectorAll('.badge-card').forEach((card) => {
      const title = card.querySelector('b');
      if (!title || !title.textContent.includes('Kelime Avcısı')) return;
      const unlocked = summary.learned >= 25;
      card.classList.toggle('locked', !unlocked);
      title.textContent = `Kelime Avcısı${unlocked ? ' ✓' : ''}`;
    });
  }

  function refreshUnitProgress() {
    const holder = document.getElementById('unitProgress');
    const summary = learningSummary();
    if (!holder || !summary.data.length) return;

    const rows = [...holder.querySelectorAll('.unit-row')];
    rows.forEach((row, index) => {
      const unit = summary.data[index];
      if (!unit) return;
      const words = unit.words || [];
      const learned = words.filter((w) => isLearned(summary.progress[w.id])).length;
      const studied = words.filter((w) => Number(summary.progress[w.id]?.attempts || 0) > 0).length;
      const totalLearning = words.reduce((sum, w) => sum + wordLearningPercent(summary.progress[w.id]), 0);
      const percent = words.length ? Math.round(totalLearning / words.length) : 0;

      const fill = row.querySelector('.mini-fill');
      if (fill) fill.style.width = `${percent}%`;

      const pct = row.querySelector('.unit-pct');
      if (pct) {
        pct.innerHTML = `<b>${percent}%</b><small>öğrenme</small>`;
        pct.style.display = 'flex';
        pct.style.flexDirection = 'column';
        pct.style.alignItems = 'center';
        pct.style.justifyContent = 'center';
        pct.style.minWidth = '68px';
        pct.style.padding = '7px 8px';
        pct.style.borderRadius = '12px';
        pct.style.background = 'var(--soft)';
        pct.style.color = 'var(--primary-2)';
        pct.style.fontWeight = '800';
      }

      const detail = row.querySelector('div:first-child small');
      if (detail) detail.textContent = `${learned}/${words.length} öğrenildi • ${studied} kelime çalışıldı`;
    });
  }

  async function exitCurrentSession() {
    const sessionArea = document.getElementById('sessionArea');
    if (!sessionArea || sessionArea.classList.contains('hidden')) return;

    const label = document.getElementById('sessionLabel')?.textContent || 'Bu çalışma';
    if (!confirm(`${label} oturumundan çıkılsın mı? Şimdiye kadarki ilerlemen kaydedilecek.`)) return;

    const button = document.getElementById('exitSessionBtn');
    if (button) {
      button.disabled = true;
      button.textContent = 'Kaydediliyor…';
    }

    try {
      const cloud = await import('./cloud.js');
      const { auth } = await cloud.initCloud();
      const user = auth?.currentUser;
      const state = readState();
      if (user && state) await cloud.saveUserState(user, state);
    } catch (error) {
      console.warn('Oturum çıkışında bulut eşitleme bekleniyor:', error);
    }

    window.location.reload();
  }

  function addExitButton() {
    const row = document.querySelector('.session-progress-row');
    if (!row || document.getElementById('exitSessionBtn')) return;

    const score = document.getElementById('sessionScore');
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.gap = '10px';

    if (score) actions.appendChild(score);

    const button = document.createElement('button');
    button.id = 'exitSessionBtn';
    button.type = 'button';
    button.textContent = '✕ Testten çık';
    button.style.border = '1px solid rgba(183,65,65,.35)';
    button.style.background = 'rgba(183,65,65,.07)';
    button.style.color = 'var(--danger)';
    button.style.borderRadius = '10px';
    button.style.padding = '7px 10px';
    button.style.fontSize = '12px';
    button.style.fontWeight = '800';
    button.style.cursor = 'pointer';
    button.style.whiteSpace = 'nowrap';
    button.addEventListener('click', exitCurrentSession);
    actions.appendChild(button);
    row.appendChild(actions);
  }

  function refreshAll() {
    addExitButton();
    refreshTopProgress();
    refreshUnitProgress();
  }

  function initEnhancements() {
    refreshAll();

    const observer = new MutationObserver(() => refreshAll());
    const app = document.getElementById('appShell') || document.body;
    observer.observe(app, { childList: true, subtree: true });

    window.addEventListener('storage', refreshAll);
    setInterval(refreshAll, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
  } else {
    initEnhancements();
  }
})();