(() => {
  const KEY = 'kelimeRobotu.v2';
  const LEGACY_KEY = 'kelimeRobotu.v1';
  let organized = false;

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function learningPercent(p = {}) {
    const attempts = Number(p.attempts || 0);
    const correct = Number(p.correct || 0);
    const level = Number(p.level || 0);
    if (!attempts) return 0;
    if (level >= 3 && !p.lastWrong) return 100;
    const accuracy = Math.max(0, Math.min(1, correct / attempts));
    let score = 15 + Math.min(correct, 3) * 18 + Math.round(accuracy * 25) + Math.min(level, 2) * 7;
    if (p.lastWrong) score -= 12;
    return Math.max(8, Math.min(95, Math.round(score)));
  }

  function isLearned(p = {}) {
    return Number(p.attempts || 0) > 0 && !p.lastWrong && learningPercent(p) >= 70;
  }

  function summary() {
    const state = readState();
    const data = window.VOCAB_DATA || [];
    const words = data.flatMap((u) => u.words || []);
    const progress = state.progress || {};
    const learned = words.filter((w) => isLearned(progress[w.id] || {})).length;
    const review = words.filter((w) => {
      const p = progress[w.id] || {};
      return Number(p.attempts || 0) > 0 && (!isLearned(p) || p.lastWrong);
    }).length;
    const fresh = words.filter((w) => Number(progress[w.id]?.attempts || 0) === 0).length;
    return { learned, review, fresh, total: words.length };
  }

  function injectStyles() {
    if (document.getElementById('homeFlowStyles')) return;
    const style = document.createElement('style');
    style.id = 'homeFlowStyles';
    style.textContent = `
      .start-center{margin:14px 0;padding:24px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:20px;align-items:stretch;background:linear-gradient(135deg,color-mix(in srgb,var(--soft) 72%,var(--card)),var(--card));border:1px solid color-mix(in srgb,var(--primary-2) 18%,var(--line))}
      .start-center h2{margin:5px 0 8px;font-size:27px;line-height:1.15}.start-center p{margin:0;color:var(--muted);line-height:1.5}
      .start-main{display:flex;flex-direction:column;justify-content:center}.start-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:17px}.start-primary{border:0;background:linear-gradient(135deg,var(--primary),var(--primary-2));color:#fff;border-radius:15px;padding:14px 18px;font-weight:900;cursor:pointer;box-shadow:0 10px 24px rgba(31,106,70,.18)}.start-primary:hover{transform:translateY(-1px)}
      .start-secondary{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:15px;padding:13px 16px;font-weight:800;cursor:pointer}
      .start-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:16px}.start-step{border:1px solid var(--line);border-radius:14px;padding:11px 12px;background:var(--card)}.start-step b{display:block;font-size:12px}.start-step small{display:block;color:var(--muted);margin-top:3px;line-height:1.35}.start-num{width:25px;height:25px;border-radius:9px;display:grid;place-items:center;background:var(--soft);color:var(--primary-2);font-weight:900;font-size:12px;margin-bottom:7px}
      .start-side{border-radius:18px;padding:17px;background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 38%,var(--card)));border:1px solid var(--line);display:flex;flex-direction:column;justify-content:center}.start-side-title{font-size:12px;font-weight:900;color:var(--muted);letter-spacing:.04em}.start-side strong{font-size:22px;margin:6px 0 10px}.start-mini-list{display:flex;flex-direction:column;gap:8px}.start-mini{display:flex;justify-content:space-between;gap:12px;font-size:12px;padding:8px 0;border-bottom:1px solid var(--line)}.start-mini:last-child{border-bottom:0}.start-mini span{color:var(--muted)}.start-mini b{font-size:13px}
      #robotPanel.focused-robot{margin:0 0 14px;border-color:color-mix(in srgb,var(--primary-2) 22%,var(--line));box-shadow:0 18px 42px rgba(24,55,40,.09)}
      #robotPanel.focused-robot .robot-head{margin-bottom:14px}.robot-guide{margin:0 0 14px;padding:11px 13px;border-radius:13px;background:var(--soft-2);color:var(--text);font-size:12px;line-height:1.45;border:1px solid color-mix(in srgb,var(--accent) 18%,var(--line))}
      #robotPanel .mode-grid.simple-mode-grid{display:flex;flex-direction:column;gap:11px}
      .simple-primary-wrap .mode-btn{width:100%;min-height:104px;display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:'icon title' 'icon note';column-gap:14px;align-items:center;padding:20px}.simple-primary-wrap .mode-btn span{grid-area:icon;font-size:31px}.simple-primary-wrap .mode-btn b{grid-area:title;font-size:18px}.simple-primary-wrap .mode-btn small{grid-area:note;font-size:12px}
      .simple-secondary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.simple-secondary-grid .mode-btn{min-height:92px;padding:15px}
      .more-modes{border:1px solid var(--line);border-radius:15px;background:var(--card);overflow:hidden}.more-modes summary{list-style:none;cursor:pointer;padding:13px 15px;font-weight:850;font-size:13px;display:flex;align-items:center;justify-content:space-between}.more-modes summary::-webkit-details-marker{display:none}.more-modes summary:after{content:'⌄';color:var(--muted);font-size:16px}.more-modes[open] summary:after{content:'⌃'}.advanced-mode-grid{padding:0 12px 12px;display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.advanced-mode-grid .mode-btn{min-height:82px;padding:13px}.advanced-mode-grid .mode-btn span{font-size:20px}.advanced-mode-grid .mode-btn b{font-size:14px}
      .home-section-divider{margin:3px 0 10px;padding:0 3px;display:flex;align-items:center;gap:10px;color:var(--muted);font-size:11px;font-weight:850;letter-spacing:.06em}.home-section-divider:after{content:'';height:1px;background:var(--line);flex:1}
      .stats-grid.home-stats{margin-top:8px}
      @media(max-width:760px){.start-center{grid-template-columns:1fr;padding:19px}.start-center h2{font-size:23px}.start-steps{grid-template-columns:1fr}.simple-secondary-grid{grid-template-columns:1fr}.advanced-mode-grid{grid-template-columns:1fr}.start-actions{flex-direction:column}.start-primary,.start-secondary{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function ensureStartCenter() {
    if (document.getElementById('startCenter')) return document.getElementById('startCenter');
    const hero = document.querySelector('.hero');
    if (!hero) return null;
    const section = document.createElement('section');
    section.id = 'startCenter';
    section.className = 'card start-center';
    section.innerHTML = `
      <div class="start-main">
        <span class="eyebrow">NEREDEN BAŞLAYACAĞIM?</span>
        <h2>Karar vermene gerek yok. Bugünkü sıran hazır.</h2>
        <p>Önce kısa bir öğrenme turu, sonra tekrar, en son mini test. Robot hangi kelimeleri çalışacağını senin yerine seçer.</p>
        <div class="start-actions">
          <button class="start-primary" id="startDailyNow" type="button">▶ Bugünün Çalışmasını Başlat</button>
          <button class="start-secondary" id="showVocabularyNow" type="button">📋 Önce kelime listesini gör</button>
        </div>
        <div class="start-steps">
          <div class="start-step"><span class="start-num">1</span><b>Öğren</b><small>Yeni kelimeleri kısa gruplarla gör.</small></div>
          <div class="start-step"><span class="start-num">2</span><b>Tekrar et</b><small>Zorlandığın kelimeleri yeniden çöz.</small></div>
          <div class="start-step"><span class="start-num">3</span><b>Kendini test et</b><small>Günün sonunda kısa testle kontrol et.</small></div>
        </div>
      </div>
      <aside class="start-side">
        <span class="start-side-title">BUGÜNKÜ DURUMUN</span>
        <strong id="startStatusTitle">Hazırsın</strong>
        <div class="start-mini-list">
          <div class="start-mini"><span>Öğrenildi</span><b id="startLearned">0</b></div>
          <div class="start-mini"><span>Tekrar gerekli</span><b id="startReview">0</b></div>
          <div class="start-mini"><span>Henüz çalışılmadı</span><b id="startFresh">0</b></div>
        </div>
      </aside>`;
    hero.insertAdjacentElement('afterend', section);

    section.querySelector('#startDailyNow').addEventListener('click', () => {
      const robot = document.getElementById('robotPanel');
      robot?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.querySelector('.mode-btn[data-mode="daily"]')?.click(), 250);
    });
    section.querySelector('#showVocabularyNow').addEventListener('click', () => {
      const roadmap = document.getElementById('vocabRoadmap');
      if (roadmap) roadmap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else setTimeout(() => document.getElementById('vocabRoadmap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
    });
    return section;
  }

  function updateStartCenter() {
    const root = document.getElementById('startCenter');
    if (!root) return;
    const s = summary();
    root.querySelector('#startLearned').textContent = s.learned;
    root.querySelector('#startReview').textContent = s.review;
    root.querySelector('#startFresh').textContent = s.fresh;
    root.querySelector('#startStatusTitle').textContent = s.review > 0 ? `${s.review} kelime tekrar bekliyor` : s.learned > 0 ? 'Bugünkü çalışmaya hazırsın' : 'İlk çalışmana hazırsın';
  }

  function organizeRobot() {
    const robot = document.getElementById('robotPanel');
    const start = document.getElementById('startCenter');
    if (!robot || !start) return;
    if (start.nextElementSibling !== robot) start.insertAdjacentElement('afterend', robot);
    robot.classList.add('focused-robot');

    const headTitle = robot.querySelector('.robot-head h3');
    const headText = robot.querySelector('#robotStatus');
    if (headTitle && !headTitle.dataset.homeFlow) {
      headTitle.textContent = 'Bugünkü Çalışma Merkezi';
      headTitle.dataset.homeFlow = '1';
    }
    if (headText && !headText.dataset.homeFlow && !headText.textContent.includes('başladı')) {
      headText.textContent = 'Yeşil butonla başla. Diğer seçenekleri yalnızca ihtiyacın olduğunda kullan.';
      headText.dataset.homeFlow = '1';
    }

    const menu = robot.querySelector('#menuArea');
    const grid = menu?.querySelector('.mode-grid');
    if (!grid) return;

    let guide = menu.querySelector('.robot-guide');
    if (!guide) {
      guide = document.createElement('div');
      guide.className = 'robot-guide';
      guide.textContent = 'Önerilen sıra: Bugünün Çalışması → Tekrar gerekenler → Hızlı Test. Her şeyi aynı anda yapman gerekmiyor.';
      menu.prepend(guide);
    }

    if (!grid.classList.contains('simple-mode-grid')) {
      grid.classList.add('simple-mode-grid');
      const daily = grid.querySelector('[data-mode="daily"]');
      const learn = grid.querySelector('[data-mode="learn"]');
      const wrong = grid.querySelector('[data-mode="wrong"]');
      const quick = grid.querySelector('[data-mode="quick"]');
      const hard = grid.querySelector('[data-mode="hard"]');
      const units = grid.querySelector('[data-mode="units"]');

      if (daily) {
        daily.innerHTML = '<span>▶️</span><b>Bugünün Çalışmasını Başlat</b><small>Robot yeni ve tekrar kelimelerini senin için seçer</small>';
        daily.classList.add('home-main-mode');
      }
      if (learn) learn.innerHTML = '<span>🧠</span><b>Yeni kelime öğren</b><small>8 kelimelik kısa öğrenme turu</small>';
      if (wrong) wrong.innerHTML = '<span>🔁</span><b>Tekrar gerekenleri çalış</b><small>Zorlandığın kelimelere dön</small>';
      if (quick) quick.innerHTML = '<span>⚡</span><b>Hızlı Test</b><small>10 soruluk kontrol</small>';
      if (hard) hard.innerHTML = '<span>🏆</span><b>Zor Test</b><small>20 soruluk meydan okuma</small>';
      if (units) units.innerHTML = '<span>🗂️</span><b>Ünite seç</b><small>Belirli bir üniteden çalış</small>';

      const primary = document.createElement('div');
      primary.className = 'simple-primary-wrap';
      const secondary = document.createElement('div');
      secondary.className = 'simple-secondary-grid';
      const more = document.createElement('details');
      more.className = 'more-modes';
      more.innerHTML = '<summary>Diğer çalışma seçenekleri</summary><div class="advanced-mode-grid"></div>';
      const advanced = more.querySelector('.advanced-mode-grid');

      if (daily) primary.appendChild(daily);
      if (learn) secondary.appendChild(learn);
      if (wrong) secondary.appendChild(wrong);
      [quick, hard, units].filter(Boolean).forEach((el) => advanced.appendChild(el));
      grid.replaceChildren(primary, secondary, more);
    }

    const labBtn = document.getElementById('learningPlusEntry');
    const advanced = grid.querySelector('.advanced-mode-grid');
    if (labBtn && advanced && labBtn.parentElement !== advanced) {
      labBtn.innerHTML = '<span>🎓</span><b>Öğrenme Laboratuvarı</b><small>Akıllı tekrar • bağlam • analiz</small>';
      advanced.appendChild(labBtn);
    }
  }

  function organizePage() {
    const start = ensureStartCenter();
    if (!start) return;
    organizeRobot();

    const robot = document.getElementById('robotPanel');
    const roadmap = document.getElementById('vocabRoadmap');
    const stats = document.querySelector('.stats-grid');
    const missions = document.querySelector('.mission-grid');

    if (robot && roadmap && robot.nextElementSibling !== roadmap) robot.insertAdjacentElement('afterend', roadmap);
    if (stats) {
      stats.classList.add('home-stats');
      const anchor = roadmap || robot;
      if (anchor && anchor.nextElementSibling !== stats) anchor.insertAdjacentElement('afterend', stats);
    }
    if (missions && stats && stats.nextElementSibling !== missions) stats.insertAdjacentElement('afterend', missions);

    if (!document.getElementById('progressDivider') && stats) {
      const divider = document.createElement('div');
      divider.id = 'progressDivider';
      divider.className = 'home-section-divider';
      divider.textContent = 'İLERLEMEN VE DETAYLAR';
      stats.insertAdjacentElement('beforebegin', divider);
    }
    organized = true;
  }

  function init() {
    injectStyles();
    organizePage();
    updateStartCenter();
    window.addEventListener('storage', updateStartCenter);
    setInterval(() => {
      organizePage();
      updateStartCenter();
    }, organized ? 2200 : 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();