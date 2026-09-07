(() => {
  const STATE_KEYS = ['kelimeRobotu.v2', 'kelimeRobotu.v1'];
  const DAY = 86400000;

  function readState() {
    for (const key of STATE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
    }
    return { progress: {}, stats: {}, streak: {}, activity: {} };
  }

  function allWords() {
    return (window.VOCAB_DATA || []).flatMap((u) => (u.words || []).map((w) => ({ ...w, unit: u.unit, unitTitle: u.title })));
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
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

  function statusFor(p = {}) {
    const attempts = Number(p.attempts || 0);
    if (!attempts) return { label: 'Henüz çalışılmadı', cls: 'neutral' };
    if (isLearned(p)) return { label: 'Öğrenildi', cls: 'good' };
    if (p.lastWrong || Number(p.wrong || 0) > Number(p.correct || 0)) return { label: 'Tekrar gerekli', cls: 'bad' };
    return { label: 'Gelişiyor', cls: 'warn' };
  }

  function dateKey(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .stat.detail-clickable,.hero-score.detail-clickable,.unit-row.detail-clickable{cursor:pointer;transition:.18s ease}
      .stat.detail-clickable:hover,.hero-score.detail-clickable:hover,.unit-row.detail-clickable:hover{transform:translateY(-2px);border-color:var(--primary-2);box-shadow:0 12px 28px rgba(24,55,40,.10)}
      .stat.detail-clickable:after{content:'Detay';margin-left:auto;font-size:10px;font-weight:800;color:var(--primary-2);background:var(--soft);padding:5px 7px;border-radius:999px}
      .detail-modal{position:fixed;inset:0;background:rgba(8,20,14,.56);display:grid;place-items:center;padding:18px;z-index:120;backdrop-filter:blur(3px)}
      .detail-modal.hidden{display:none!important}
      .detail-panel{width:min(920px,100%);max-height:88vh;display:flex;flex-direction:column;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:22px;box-shadow:0 28px 70px rgba(0,0,0,.24);overflow:hidden}
      .detail-head{padding:20px 22px 14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
      .detail-head h2{margin:3px 0 5px;font-size:24px}.detail-head p{margin:0;color:var(--muted);font-size:13px}.detail-close{flex:none}
      .detail-summary{display:flex;gap:8px;flex-wrap:wrap;padding:12px 22px 0}.detail-chip{padding:7px 10px;border-radius:999px;background:var(--soft);font-size:12px;font-weight:800;color:var(--primary-2)}
      .detail-controls{display:grid;grid-template-columns:1fr 180px auto;gap:9px;padding:14px 22px}.detail-controls input,.detail-controls select{border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:12px;padding:11px 12px;outline:none}.detail-controls input:focus,.detail-controls select:focus{border-color:var(--primary-2)}
      .detail-list{padding:0 22px 22px;overflow:auto;display:flex;flex-direction:column;gap:10px}.detail-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:16px}
      .word-detail{border:1px solid var(--line);border-radius:16px;padding:13px 14px;background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 20%,var(--card)))}
      .word-detail-top{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center}.word-detail h4{margin:0;font-size:16px}.word-detail .tr{color:var(--muted);font-size:13px;margin-top:2px}.word-status{padding:6px 8px;border-radius:999px;font-size:10px;font-weight:900;white-space:nowrap}.word-status.good{background:#e8f6ee;color:#227a48}.word-status.warn{background:#fff5dd;color:#946500}.word-status.bad{background:#fff0ef;color:#a6423d}.word-status.neutral{background:var(--soft);color:var(--muted)}
      .speak-mini{border:1px solid var(--line);background:var(--card);color:var(--text);width:34px;height:34px;border-radius:10px;cursor:pointer}
      .word-meter{display:grid;grid-template-columns:1fr 50px;gap:10px;align-items:center;margin-top:10px}.word-meter .mini-track{height:7px}.word-percent{text-align:right;font-size:12px;font-weight:900;color:var(--primary-2)}
      .word-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;color:var(--muted);font-size:11px}.word-stats b{color:var(--text)}
      .detail-report-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 22px 16px}.report-card{padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--soft)}.report-card b{display:block;font-size:22px}.report-card small{color:var(--muted)}
      .unit-report{display:grid;grid-template-columns:minmax(0,1fr) 80px 80px;gap:10px;align-items:center;border-bottom:1px solid var(--line);padding:11px 0}.unit-report:last-child{border-bottom:0}.unit-report small{color:var(--muted)}.unit-acc{font-weight:900;text-align:right;color:var(--primary-2)}
      .activity-day{display:grid;grid-template-columns:100px 1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line)}.activity-day:last-child{border-bottom:0}.activity-bar{height:7px;background:var(--soft);border-radius:99px;overflow:hidden}.activity-bar>span{display:block;height:100%;background:var(--primary);border-radius:99px}
      .detail-action{border:0;background:var(--primary);color:white;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer}
      .unit-row.detail-clickable:after{content:'Kelimeleri gör';font-size:10px;font-weight:800;color:var(--primary-2);grid-column:1/-1;justify-self:start;margin-top:-3px}
      @media(max-width:680px){.detail-controls{grid-template-columns:1fr}.detail-report-grid{grid-template-columns:1fr 1fr}.word-detail-top{grid-template-columns:1fr auto}.word-status{grid-column:1/2;justify-self:start}.activity-day{grid-template-columns:82px 1fr}.activity-day>strong{grid-column:2}.unit-report{grid-template-columns:1fr 60px}.unit-report>small{display:none}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (document.getElementById('detailModal')) return;
    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'detail-modal hidden';
    modal.innerHTML = `
      <section class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detailTitle">
        <header class="detail-head">
          <div><span class="eyebrow" id="detailEyebrow">DETAY</span><h2 id="detailTitle">Öğrenme detayları</h2><p id="detailSubtitle"></p></div>
          <button type="button" class="icon-btn detail-close" id="detailClose">✕</button>
        </header>
        <div id="detailBody"></div>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector('#detailClose').addEventListener('click', closeModal);
  }

  function closeModal() {
    document.getElementById('detailModal')?.classList.add('hidden');
  }

  function openBase(eyebrow, title, subtitle, html) {
    ensureModal();
    document.getElementById('detailEyebrow').textContent = eyebrow;
    document.getElementById('detailTitle').textContent = title;
    document.getElementById('detailSubtitle').textContent = subtitle || '';
    document.getElementById('detailBody').innerHTML = html;
    document.getElementById('detailModal').classList.remove('hidden');
  }

  function wordRows(words, state) {
    if (!words.length) return '<div class="detail-empty">Bu bölümde gösterilecek kelime bulunmuyor.</div>';
    return words.map((w) => {
      const p = state.progress?.[w.id] || {};
      const pct = learningPercent(p);
      const status = statusFor(p);
      return `<article class="word-detail" data-word-id="${esc(w.id)}" data-unit="${w.unit}" data-search="${esc(`${w.en} ${w.tr} ${w.unitTitle}`.toLowerCase())}">
        <div class="word-detail-top">
          <div><h4>${esc(w.en)}</h4><div class="tr">${esc(w.tr)} • Ünite ${w.unit} — ${esc(w.unitTitle)}</div></div>
          <span class="word-status ${status.cls}">${status.label}</span>
          <button class="speak-mini" type="button" data-speak="${esc(w.en)}" title="Telaffuzu dinle">🔊</button>
        </div>
        <div class="word-meter"><div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div><div class="word-percent">${pct}%</div></div>
        <div class="word-stats"><span>Deneme <b>${Number(p.attempts || 0)}</b></span><span>Doğru <b>${Number(p.correct || 0)}</b></span><span>Yanlış <b>${Number(p.wrong || 0)}</b></span><span>Seviye <b>${Number(p.level || 0)}/3</b></span></div>
      </article>`;
    }).join('');
  }

  function openWordList(kind = 'learned', forcedUnit = null) {
    const state = readState();
    const words = allWords();
    const units = window.VOCAB_DATA || [];
    let selected = [];
    let title = '';
    let subtitle = '';
    let action = '';

    if (kind === 'learned') {
      selected = words.filter((w) => isLearned(state.progress?.[w.id] || {})).sort((a, b) => learningPercent(state.progress?.[b.id]) - learningPercent(state.progress?.[a.id]));
      title = 'Öğrenilen kelimeler';
      subtitle = 'Öğrenme güveni %70 ve üzeri olan kelimeler. Kelimeyi, anlamını ve çalışma geçmişini görebilirsin.';
    } else if (kind === 'review') {
      selected = words.filter((w) => {
        const p = state.progress?.[w.id] || {};
        return Number(p.attempts || 0) > 0 && (!isLearned(p) || p.lastWrong);
      }).sort((a, b) => {
        const pa = state.progress?.[a.id] || {}, pb = state.progress?.[b.id] || {};
        return Number(Boolean(pb.lastWrong)) - Number(Boolean(pa.lastWrong)) || Number(pb.wrong || 0) - Number(pa.wrong || 0) || learningPercent(pa) - learningPercent(pb);
      });
      title = 'Tekrar gerekli kelimeler';
      subtitle = 'Henüz yeterince sağlamlaşmayan veya son cevapta hata yapılan kelimeler.';
      action = '<button type="button" class="detail-action" id="startReviewFromDetail">🔁 Tekrar çalışmaya başla</button>';
    } else if (kind === 'unit') {
      selected = words.filter((w) => w.unit === forcedUnit).sort((a, b) => Number(state.progress?.[b.id]?.attempts || 0) - Number(state.progress?.[a.id]?.attempts || 0));
      const unit = units.find((u) => u.unit === forcedUnit);
      title = `Ünite ${forcedUnit} • ${unit?.title || ''}`;
      subtitle = 'Bu ünitedeki tüm kelimeler; öğrenilen, tekrar gereken ve henüz çalışılmayan durumlarıyla birlikte.';
      action = `<button type="button" class="detail-action" id="startUnitFromDetail" data-unit="${forcedUnit}">🧠 Bu üniteyi çalış</button>`;
    }

    const learnedN = selected.filter((w) => isLearned(state.progress?.[w.id] || {})).length;
    const studiedN = selected.filter((w) => Number(state.progress?.[w.id]?.attempts || 0) > 0).length;
    const wrongN = selected.filter((w) => Boolean(state.progress?.[w.id]?.lastWrong)).length;
    const unitOptions = ['<option value="">Tüm üniteler</option>', ...units.map((u) => `<option value="${u.unit}" ${forcedUnit === u.unit ? 'selected' : ''}>Ünite ${u.unit} • ${esc(u.title)}</option>`)].join('');

    openBase('KELİME DETAYI', title, subtitle, `
      <div class="detail-summary"><span class="detail-chip">${selected.length} kelime</span><span class="detail-chip">${learnedN} öğrenildi</span><span class="detail-chip">${studiedN} çalışıldı</span><span class="detail-chip">${wrongN} son hata</span></div>
      <div class="detail-controls"><input id="detailSearch" placeholder="Kelime veya anlam ara…"/><select id="detailUnitFilter">${unitOptions}</select>${action || '<span></span>'}</div>
      <div class="detail-list" id="detailWordList">${wordRows(selected, state)}</div>`);

    const search = document.getElementById('detailSearch');
    const unitFilter = document.getElementById('detailUnitFilter');
    const applyFilter = () => {
      const q = (search.value || '').toLocaleLowerCase('tr-TR').trim();
      const unit = unitFilter.value;
      document.querySelectorAll('#detailWordList .word-detail').forEach((row) => {
        const matchText = !q || row.dataset.search.includes(q);
        const matchUnit = !unit || row.dataset.unit === unit;
        row.style.display = matchText && matchUnit ? '' : 'none';
      });
    };
    search.addEventListener('input', applyFilter);
    unitFilter.addEventListener('change', applyFilter);

    document.getElementById('detailWordList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-speak]');
      if (btn) speak(btn.dataset.speak);
    });

    document.getElementById('startReviewFromDetail')?.addEventListener('click', () => {
      closeModal();
      document.querySelector('.mode-btn[data-mode="wrong"]')?.click();
      document.getElementById('robotPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('startUnitFromDetail')?.addEventListener('click', (e) => {
      const unit = e.currentTarget.dataset.unit;
      closeModal();
      document.querySelector('.mode-btn[data-mode="units"]')?.click();
      setTimeout(() => document.querySelector(`#unitButtons [data-unit="${unit}"]`)?.click(), 80);
      document.getElementById('robotPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function openAccuracy() {
    const state = readState();
    const data = window.VOCAB_DATA || [];
    const total = Number(state.stats?.attempts || 0);
    const correct = Number(state.stats?.correct || 0);
    const wrong = Math.max(0, total - correct);
    const acc = total ? Math.round(correct / total * 100) : 0;
    const rows = data.map((u) => {
      let a = 0, c = 0;
      (u.words || []).forEach((w) => { const p = state.progress?.[w.id] || {}; a += Number(p.attempts || 0); c += Number(p.correct || 0); });
      const pct = a ? Math.round(c / a * 100) : 0;
      return `<div class="unit-report"><div><b>Ünite ${u.unit} • ${esc(u.title)}</b><br><small>${a} cevap • ${c} doğru</small></div><div class="activity-bar"><span style="width:${pct}%"></span></div><div class="unit-acc">${a ? pct + '%' : '—'}</div></div>`;
    }).join('');
    openBase('PERFORMANS', 'Doğruluk analizi', 'Genel başarı ve ünite bazlı cevap performansın.', `
      <div class="detail-report-grid"><div class="report-card"><b>${total}</b><small>Toplam cevap</small></div><div class="report-card"><b>${correct}</b><small>Doğru</small></div><div class="report-card"><b>${wrong}</b><small>Yanlış</small></div><div class="report-card"><b>${acc}%</b><small>Doğruluk</small></div></div>
      <div class="detail-list">${rows}</div>`);
  }

  function openToday() {
    const state = readState();
    const today = state.activity?.[todayKey()] || {};
    const words = allWords().filter((w) => dateKey(state.progress?.[w.id]?.lastSeen) === todayKey());
    const attempts = Number(today.attempts || 0), correct = Number(today.correct || 0), minutes = Math.round(Number(today.seconds || 0) / 60), sessions = Number(today.sessions || 0);
    openBase('BUGÜN', 'Bugünkü çalışma özeti', 'Bugün yaptığın çalışmalar ve dokunduğun kelimeler.', `
      <div class="detail-report-grid"><div class="report-card"><b>${minutes} dk</b><small>Çalışma</small></div><div class="report-card"><b>${attempts}</b><small>Soru</small></div><div class="report-card"><b>${correct}</b><small>Doğru</small></div><div class="report-card"><b>${sessions}</b><small>Oturum</small></div></div>
      <div class="detail-controls"><input id="detailSearch" placeholder="Bugünkü kelimelerde ara…"/><span></span><span></span></div>
      <div class="detail-list" id="detailWordList">${wordRows(words, state)}</div>`);
    const input = document.getElementById('detailSearch');
    input.addEventListener('input', () => {
      const q = input.value.toLocaleLowerCase('tr-TR').trim();
      document.querySelectorAll('#detailWordList .word-detail').forEach((row) => row.style.display = !q || row.dataset.search.includes(q) ? '' : 'none');
    });
    document.getElementById('detailWordList').addEventListener('click', (e) => { const btn = e.target.closest('[data-speak]'); if (btn) speak(btn.dataset.speak); });
  }

  function openStreak() {
    const state = readState();
    const activity = Object.entries(state.activity || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 21);
    const maxMinutes = Math.max(1, ...activity.map(([, a]) => Math.round(Number(a.seconds || 0) / 60)));
    const rows = activity.length ? activity.map(([date, a]) => {
      const mins = Math.round(Number(a.seconds || 0) / 60);
      const attempts = Number(a.attempts || 0);
      return `<div class="activity-day"><b>${date}</b><div><div class="activity-bar"><span style="width:${Math.max(4, mins / maxMinutes * 100)}%"></span></div><small>${attempts} soru • ${Number(a.correct || 0)} doğru</small></div><strong>${mins} dk</strong></div>`;
    }).join('') : '<div class="detail-empty">Henüz çalışma günü kaydı yok.</div>';
    openBase('ÇALIŞMA SERİSİ', `${Number(state.streak?.count || 0)} günlük seri`, 'Son çalışma günlerini ve çalışma yoğunluğunu görebilirsin.', `<div class="detail-summary"><span class="detail-chip">Son aktif gün: ${esc(state.streak?.lastDate || '—')}</span><span class="detail-chip">Kayıtlı ${Object.keys(state.activity || {}).length} çalışma günü</span></div><div class="detail-list">${rows}</div>`);
  }

  function markClickable() {
    const map = [
      ['learnedCount', 'learned', 'Öğrenilen kelimeleri gör'],
      ['reviewCount', 'review', 'Tekrar gerekli kelimeleri gör'],
      ['accuracyValue', 'accuracy', 'Doğruluk detayını gör'],
      ['todayMinutes', 'today', 'Bugünkü çalışma detayını gör'],
      ['streakValue', 'streak', 'Çalışma serisini gör'],
    ];
    map.forEach(([id, kind, title]) => {
      const el = document.getElementById(id);
      const card = el?.closest('.stat');
      if (!card) return;
      card.classList.add('detail-clickable');
      card.dataset.detailKind = kind;
      card.title = title;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
    });
    const score = document.querySelector('.hero-score');
    if (score) { score.classList.add('detail-clickable'); score.dataset.detailKind = 'learned'; score.title = 'Genel öğrenme detayını gör'; score.tabIndex = 0; }
  }

  function handleClick(target) {
    const card = target.closest('[data-detail-kind]');
    if (card) {
      const kind = card.dataset.detailKind;
      if (kind === 'learned' || kind === 'review') openWordList(kind);
      if (kind === 'accuracy') openAccuracy();
      if (kind === 'today') openToday();
      if (kind === 'streak') openStreak();
      return true;
    }
    const row = target.closest('#unitProgress .unit-row');
    if (row) {
      const rows = [...document.querySelectorAll('#unitProgress .unit-row')];
      const unitNo = rows.indexOf(row) + 1;
      if (unitNo > 0) openWordList('unit', unitNo);
      return true;
    }
    return false;
  }

  function init() {
    injectStyles();
    ensureModal();
    markClickable();
    document.addEventListener('click', (e) => handleClick(e.target));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-detail-kind]')) { e.preventDefault(); handleClick(e.target); }
    });
    // Unit rows are generated dynamically by app.js; mark them visually without observing mutations.
    setInterval(() => document.querySelectorAll('#unitProgress .unit-row').forEach((row) => { row.classList.add('detail-clickable'); row.title = 'Ünite kelimelerini ve öğrenme durumunu gör'; }), 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();