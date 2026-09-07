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

// Dashboard consistency helpers.
// IMPORTANT: Do not observe the whole app DOM here. The dashboard refresh itself
// changes the DOM, which can create a MutationObserver feedback loop and freeze
// the page. A lightweight timer is sufficient and safe for this app size.
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
    if (level >= 3 && !lastWrong) return 100;

    const accuracy = Math.max(0, Math.min(1, correct / attempts));
    let score = 15;
    score += Math.min(correct, 3) * 18;
    score += Math.round(accuracy * 25);
    score += Math.min(level, 2) * 7;
    if (lastWrong) score -= 12;
    return Math.max(8, Math.min(95, Math.round(score)));
  }

  function isLearned(progress) {
    const p = progress || {};
    if (!Number(p.attempts || 0) || p.lastWrong) return false;
    return wordLearningPercent(p) >= 70;
  }

  function getSummary() {
    const state = readState();
    const data = window.VOCAB_DATA || [];
    const words = data.flatMap((unit) => unit.words || []);
    const progress = state.progress || {};
    const learned = words.filter((w) => isLearned(progress[w.id])).length;
    const review = words.filter((w) => {
      const p = progress[w.id];
      return Number(p?.attempts || 0) > 0 && (!isLearned(p) || Boolean(p?.lastWrong));
    }).length;
    const score = words.reduce((sum, w) => sum + wordLearningPercent(progress[w.id]), 0);
    const percent = words.length ? Math.round(score / words.length) : 0;
    return { state, data, progress, learned, review, percent };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && el.textContent !== String(value)) el.textContent = String(value);
  }

  function refreshTopProgress(summary) {
    setText('learnedCount', summary.learned);
    setText('reviewCount', summary.review);
    setText('overallPct', `${summary.percent}%`);

    const ring = document.getElementById('overallRing');
    if (ring) {
      const bg = `conic-gradient(var(--primary) ${summary.percent * 3.6}deg,#dbe5de 0deg)`;
      if (ring.style.background !== bg) ring.style.background = bg;
    }

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

    setText('levelChip', `Seviye ${level}`);
    setText('rankName', rank);
    setText('xpText', `${currentXp} / ${perLevel} XP`);
    setText('xpHint', `Toplam ${xp} XP • Bir sonraki seviye için ${Math.max(0, perLevel - currentXp)} XP kaldı.`);
    const xpFill = document.getElementById('xpFill');
    if (xpFill) xpFill.style.width = `${levelPct}%`;
  }

  function refreshUnitProgress(summary) {
    const holder = document.getElementById('unitProgress');
    if (!holder || !summary.data.length) return;

    const rows = [...holder.querySelectorAll('.unit-row')];
    rows.forEach((row, index) => {
      const unit = summary.data[index];
      if (!unit) return;
      const words = unit.words || [];
      const learned = words.filter((w) => isLearned(summary.progress[w.id])).length;
      const studied = words.filter((w) => Number(summary.progress[w.id]?.attempts || 0) > 0).length;
      const total = words.reduce((sum, w) => sum + wordLearningPercent(summary.progress[w.id]), 0);
      const percent = words.length ? Math.round(total / words.length) : 0;

      const fill = row.querySelector('.mini-fill');
      if (fill && fill.style.width !== `${percent}%`) fill.style.width = `${percent}%`;

      const pct = row.querySelector('.unit-pct');
      if (pct) {
        const html = `<b>${percent}%</b><small>öğrenme</small>`;
        if (pct.innerHTML !== html) pct.innerHTML = html;
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
      const detailText = `${learned}/${words.length} öğrenildi • ${studied} kelime çalışıldı`;
      if (detail && detail.textContent !== detailText) detail.textContent = detailText;
    });
  }

  function refreshAll() {
    const summary = getSummary();
    refreshTopProgress(summary);
    refreshUnitProgress(summary);
    addExitButton();
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
      if (user) await cloud.saveUserState(user, state);
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

  function initEnhancements() {
    refreshAll();
    window.addEventListener('storage', refreshAll);
    // Safe periodic refresh; no MutationObserver, so no recursive DOM loop.
    setInterval(refreshAll, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements, { once: true });
  } else {
    initEnhancements();
  }
})();

// Load the richer, click-through detail interface. Keeping it in a separate file
// avoids coupling dashboard exploration features to the core learning engine.
if (!document.querySelector('script[data-kelime-details]')) {
  const detailScript = document.createElement('script');
  detailScript.src = './details.js?v=20260907-1';
  detailScript.dataset.kelimeDetails = '1';
  document.head.appendChild(detailScript);
}