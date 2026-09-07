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

  function statusFor(p = {}) {
    const attempts = Number(p.attempts || 0);
    const pct = learningPercent(p);
    if (!attempts) return { key: 'new', icon: '○', label: 'Çalışılmadı' };
    if (!p.lastWrong && pct >= 70) return { key: 'learned', icon: '✓', label: 'Öğrenildi' };
    return { key: 'review', icon: '↻', label: 'Tekrar gerekli' };
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function injectStyles() {
    if (document.getElementById('vocabOverviewStyles')) return;
    const style = document.createElement('style');
    style.id = 'vocabOverviewStyles';
    style.textContent = `
      .vocab-roadmap{margin:14px 0;padding:20px}
      .vocab-roadmap-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px}
      .vocab-roadmap-head h3{margin:4px 0 4px}.vocab-roadmap-head p{margin:0;color:var(--muted);font-size:13px;line-height:1.45}
      .vocab-total-badge{flex:none;padding:8px 11px;border-radius:999px;background:var(--soft);color:var(--primary-2);font-size:12px;font-weight:900}
      .vocab-controls{display:grid;grid-template-columns:minmax(0,1fr) 180px 180px;gap:9px;margin-bottom:14px}
      .vocab-controls input,.vocab-controls select{border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:12px;padding:11px 12px;outline:none}
      .vocab-controls input:focus,.vocab-controls select:focus{border-color:var(--primary-2)}
      .vocab-legend{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 12px;color:var(--muted);font-size:11px}.vocab-legend span{display:inline-flex;align-items:center;gap:5px}
      .vocab-check{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:900;flex:none}
      .vocab-check.learned{background:#e6f6ec;color:#237649}.vocab-check.review{background:#fff2df;color:#a96800}.vocab-check.new{background:var(--soft);color:var(--muted)}
      .vocab-scroll{max-height:520px;overflow:auto;padding-right:4px;overscroll-behavior:contain}
      .vocab-unit{border:1px solid var(--line);border-radius:17px;overflow:hidden;margin-bottom:10px;background:var(--card)}
      .vocab-unit-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 14px;background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 35%,var(--card)))}
      .vocab-unit-head b{display:block}.vocab-unit-head small{display:block;color:var(--muted);margin-top:3px}.vocab-unit-pct{font-size:12px;font-weight:900;color:var(--primary-2);background:var(--soft);padding:7px 9px;border-radius:999px}
      .vocab-unit-track{height:5px;background:var(--soft);overflow:hidden}.vocab-unit-track span{display:block;height:100%;background:var(--primary);border-radius:99px}
      .vocab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line)}
      .vocab-word{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 13px;background:var(--card);min-width:0}
      .vocab-word:hover{background:color-mix(in srgb,var(--soft) 35%,var(--card))}
      .vocab-word-main{min-width:0}.vocab-word-main b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vocab-word-main small{display:block;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .vocab-word-status{font-size:9px;font-weight:900;white-space:nowrap;color:var(--muted)}
      .vocab-word[data-status='learned'] .vocab-word-main b{text-decoration:none;color:var(--text)}
      .vocab-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:16px}
      .vocab-list-footer{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:12px;color:var(--muted);font-size:11px}
      .vocab-refresh{border:0;background:transparent;color:var(--primary-2);font-weight:800;cursor:pointer;padding:5px 0}
      @media(max-width:800px){.vocab-controls{grid-template-columns:1fr 1fr}.vocab-controls input{grid-column:1/-1}.vocab-grid{grid-template-columns:1fr}}
      @media(max-width:560px){.vocab-roadmap{padding:16px}.vocab-roadmap-head{flex-direction:column}.vocab-controls{grid-template-columns:1fr}.vocab-controls input{grid-column:auto}.vocab-scroll{max-height:460px}.vocab-word{grid-template-columns:auto minmax(0,1fr)}.vocab-word-status{grid-column:2;justify-self:start}}
    `;
    document.head.appendChild(style);
  }

  function ensureSection() {
    if (document.getElementById('vocabRoadmap')) return;
    const stats = document.querySelector('.stats-grid');
    if (!stats) return;

    const section = document.createElement('section');
    section.id = 'vocabRoadmap';
    section.className = 'card vocab-roadmap';
    section.innerHTML = `
      <div class="vocab-roadmap-head">
        <div>
          <span class="eyebrow">KELİME YOL HARİTASI</span>
          <h3>Öğrenilecek tüm kelimeler</h3>
          <p>10 ünitedeki bütün kelime ve kalıpları burada görebilirsin. Öğrenilen kelimelerin yanında ✓ işareti görünür.</p>
        </div>
        <span class="vocab-total-badge" id="vocabTotalBadge">0 / 0 öğrenildi</span>
      </div>
      <div class="vocab-controls">
        <input id="vocabSearch" type="search" placeholder="Kelime veya Türkçe anlam ara…" />
        <select id="vocabUnitFilter"><option value="">Tüm üniteler</option></select>
        <select id="vocabStatusFilter">
          <option value="">Tüm durumlar</option>
          <option value="learned">✓ Öğrenilenler</option>
          <option value="review">↻ Tekrar gerekli</option>
          <option value="new">○ Çalışılmadı</option>
        </select>
      </div>
      <div class="vocab-legend"><span><i class="vocab-check learned">✓</i> Öğrenildi</span><span><i class="vocab-check review">↻</i> Tekrar gerekli</span><span><i class="vocab-check new">○</i> Henüz çalışılmadı</span></div>
      <div class="vocab-scroll" id="vocabScroll"></div>
      <div class="vocab-list-footer"><span id="vocabVisibleCount"></span><button class="vocab-refresh" id="vocabRefresh" type="button">↻ Listeyi güncelle</button></div>`;
    stats.insertAdjacentElement('afterend', section);

    const unitSelect = section.querySelector('#vocabUnitFilter');
    (window.VOCAB_DATA || []).forEach((u) => {
      const option = document.createElement('option');
      option.value = String(u.unit);
      option.textContent = `Ünite ${u.unit} • ${u.title}`;
      unitSelect.appendChild(option);
    });

    section.querySelector('#vocabSearch').addEventListener('input', render);
    section.querySelector('#vocabUnitFilter').addEventListener('change', render);
    section.querySelector('#vocabStatusFilter').addEventListener('change', render);
    section.querySelector('#vocabRefresh').addEventListener('click', render);
  }

  function render() {
    ensureSection();
    const root = document.getElementById('vocabRoadmap');
    if (!root) return;

    const data = window.VOCAB_DATA || [];
    const state = readState();
    const progress = state.progress || {};
    const search = (root.querySelector('#vocabSearch')?.value || '').toLocaleLowerCase('tr-TR').trim();
    const unitFilter = root.querySelector('#vocabUnitFilter')?.value || '';
    const statusFilter = root.querySelector('#vocabStatusFilter')?.value || '';

    let total = 0;
    let learnedTotal = 0;
    let visible = 0;
    const html = [];

    data.forEach((unit) => {
      const unitWords = (unit.words || []).map((w) => {
        const p = progress[w.id] || {};
        const status = statusFor(p);
        const matchSearch = !search || `${w.en} ${w.tr}`.toLocaleLowerCase('tr-TR').includes(search);
        const matchStatus = !statusFilter || status.key === statusFilter;
        const matchUnit = !unitFilter || String(unit.unit) === unitFilter;
        total += 1;
        if (status.key === 'learned') learnedTotal += 1;
        return { w, p, status, visible: matchSearch && matchStatus && matchUnit };
      });

      const shown = unitWords.filter((item) => item.visible);
      if (!shown.length) return;
      visible += shown.length;

      const learnedInUnit = unitWords.filter((item) => item.status.key === 'learned').length;
      const pct = unitWords.length ? Math.round((learnedInUnit / unitWords.length) * 100) : 0;
      html.push(`
        <section class="vocab-unit">
          <div class="vocab-unit-head">
            <div><b>Ünite ${unit.unit} • ${esc(unit.title)}</b><small>${learnedInUnit}/${unitWords.length} kelime öğrenildi</small></div>
            <span class="vocab-unit-pct">${pct}%</span>
          </div>
          <div class="vocab-unit-track"><span style="width:${pct}%"></span></div>
          <div class="vocab-grid">
            ${shown.map(({ w, status }) => `
              <div class="vocab-word" data-status="${status.key}">
                <span class="vocab-check ${status.key}">${status.icon}</span>
                <div class="vocab-word-main"><b>${esc(w.en)}</b><small>${esc(w.tr)}</small></div>
                <span class="vocab-word-status">${status.label}</span>
              </div>`).join('')}
          </div>
        </section>`);
    });

    const holder = root.querySelector('#vocabScroll');
    holder.innerHTML = html.length ? html.join('') : '<div class="vocab-empty">Bu filtrelere uyan kelime bulunamadı.</div>';
    root.querySelector('#vocabTotalBadge').textContent = `${learnedTotal} / ${total} öğrenildi`;
    root.querySelector('#vocabVisibleCount').textContent = `${visible} kelime gösteriliyor`;
  }

  function init() {
    injectStyles();
    ensureSection();
    render();
    window.addEventListener('storage', render);
    setInterval(() => {
      const root = document.getElementById('vocabRoadmap');
      if (root && !document.hidden) render();
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();