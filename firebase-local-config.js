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

// Small UI enhancements kept outside the main module so they can be deployed safely
// without changing the learning/session engine.
(() => {
  const STATE_KEYS = ['kelimeRobotu.v2', 'kelimeRobotu.v1'];

  function readState() {
    for (const key of STATE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
    }
    return { progress: {} };
  }

  function wordLearningPercent(progress) {
    const p = progress || {};
    const attempts = Number(p.attempts || 0);
    const correct = Number(p.correct || 0);
    const level = Number(p.level || 0);
    if (!attempts) return 0;
    if (level >= 3) return 100;
    if (!correct) return 10;
    const base = [35, 55, 80][Math.max(0, Math.min(2, level))];
    const accuracy = correct / attempts;
    return Math.min(95, Math.round(base + (accuracy * 10)));
  }

  function refreshUnitProgress() {
    const holder = document.getElementById('unitProgress');
    const data = window.VOCAB_DATA || [];
    if (!holder || !data.length) return;

    const state = readState();
    const progress = state.progress || {};
    const rows = [...holder.querySelectorAll('.unit-row')];

    rows.forEach((row, index) => {
      const unit = data[index];
      if (!unit) return;
      const words = unit.words || [];
      const learned = words.filter((w) => Number(progress[w.id]?.level || 0) >= 3).length;
      const studied = words.filter((w) => Number(progress[w.id]?.attempts || 0) > 0).length;
      const totalLearning = words.reduce((sum, w) => sum + wordLearningPercent(progress[w.id]), 0);
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
      if (detail) detail.textContent = `${learned}/${words.length} tam öğrenildi • ${studied} kelime çalışıldı`;
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

  function initEnhancements() {
    addExitButton();
    refreshUnitProgress();

    const holder = document.getElementById('unitProgress');
    if (holder) {
      const observer = new MutationObserver(() => refreshUnitProgress());
      observer.observe(holder, { childList: true });
    }

    window.addEventListener('storage', refreshUnitProgress);
    setInterval(refreshUnitProgress, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
  } else {
    initEnhancements();
  }
})();
