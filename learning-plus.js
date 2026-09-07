(() => {
  const KEY = 'kelimeRobotu.v2';
  const LEGACY_KEY = 'kelimeRobotu.v1';
  const DAY = 86400000;
  const WEEK = [
    [1, 2], [3], [4, 5], [6], [7], [8, 9], [10],
  ];
  const REVIEW_DELAYS = [5 * 60 * 1000, 6 * 60 * 60 * 1000, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
  const EXAMPLES = {
    accept: ['I accept your invitation.', 'Davetini kabul ediyorum.'],
    argue: ['Good friends sometimes argue, but they solve their problems.', 'İyi arkadaşlar bazen tartışır ama sorunlarını çözer.'],
    'back up': ['My best friend always backs me up.', 'En iyi arkadaşım beni her zaman destekler.'],
    'best friend': ['Ece is my best friend.', 'Ece benim en iyi arkadaşım.'],
    buddy: ['My buddy and I study together.', 'Kankamla birlikte ders çalışırız.'],
    'care about': ['True friends care about each other.', 'Gerçek arkadaşlar birbirlerini önemser.'],
    cheerful: ['She is cheerful and always smiles.', 'O neşelidir ve her zaman gülümser.'],
    'count on': ['You can count on me.', 'Bana güvenebilirsin.'],
    generous: ['A generous person likes sharing.', 'Cömert bir insan paylaşmayı sever.'],
    honest: ['An honest friend tells the truth.', 'Dürüst bir arkadaş doğruyu söyler.'],
    jealous: ['He feels jealous when his friend wins.', 'Arkadaşı kazandığında kıskanç hisseder.'],
    loyal: ['A loyal friend never leaves you alone.', 'Sadık bir arkadaş seni asla yalnız bırakmaz.'],
    reliable: ['Mert is reliable; he always keeps his promises.', 'Mert güvenilirdir; sözlerini her zaman tutar.'],
    trust: ['I trust my best friend.', 'En iyi arkadaşıma güvenirim.'],
    trustworthy: ['She is trustworthy, so I can share my secrets.', 'O güvenilirdir, bu yüzden sırlarımı paylaşabilirim.'],
    'tell the truth': ['Please tell the truth.', 'Lütfen doğruyu söyle.'],
    prefer: ['I prefer reading books to watching TV.', 'Televizyon izlemek yerine kitap okumayı tercih ederim.'],
    enjoy: ['Teenagers enjoy spending time with friends.', 'Gençler arkadaşlarıyla vakit geçirmekten hoşlanır.'],
    'can\'t stand': ['I can\'t stand loud music.', 'Yüksek sesli müziğe tahammül edemem.'],
    'fond of': ['She is fond of swimming.', 'O yüzmeye düşkündür.'],
    'keen on': ['He is keen on playing chess.', 'O satranç oynamaya meraklıdır.'],
    'get up': ['I get up at seven on weekdays.', 'Hafta içi saat yedide kalkarım.'],
    workout: ['I do a short workout after school.', 'Okuldan sonra kısa bir antrenman yaparım.'],
    bake: ['Bake the cake for thirty minutes.', 'Keki otuz dakika fırında pişir.'],
    boil: ['Boil the water first.', 'Önce suyu kaynat.'],
    fry: ['Do not fry the vegetables too long.', 'Sebzeleri çok uzun süre kızartma.'],
    grill: ['We grill the meat for dinner.', 'Akşam yemeği için eti ızgarada pişiririz.'],
    chop: ['Chop the onions into small pieces.', 'Soğanları küçük parçalara doğra.'],
    mix: ['Mix the ingredients in a bowl.', 'Malzemeleri bir kasede karıştır.'],
    peel: ['Peel the potatoes before cooking.', 'Pişirmeden önce patatesleri soy.'],
    pour: ['Pour the milk into the bowl.', 'Sütü kaseye dök.'],
    slice: ['Slice the tomatoes carefully.', 'Domatesleri dikkatlice dilimle.'],
    stir: ['Stir the soup slowly.', 'Çorbayı yavaşça karıştır.'],
    recipe: ['This recipe is easy to follow.', 'Bu tarifi uygulamak kolaydır.'],
    'call back': ['I am busy now. I will call you back.', 'Şimdi meşgulüm. Seni geri arayacağım.'],
    'hang up': ['Do not hang up, please.', 'Lütfen telefonu kapatma.'],
    'hold on': ['Hold on a moment, please.', 'Lütfen bir dakika bekle.'],
    'leave a message': ['Can I leave a message for Mr Brown?', 'Bay Brown için mesaj bırakabilir miyim?'],
    'keep in touch': ['We keep in touch by phone.', 'Telefonla iletişimde kalırız.'],
    engaged: ['The line is engaged. Call again later.', 'Hat meşgul. Daha sonra tekrar ara.'],
    dial: ['Dial the number carefully.', 'Numarayı dikkatlice tuşla.'],
    account: ['Create an account before you sign in.', 'Giriş yapmadan önce bir hesap oluştur.'],
    attachment: ['I sent the photo as an attachment.', 'Fotoğrafı ek dosya olarak gönderdim.'],
    browser: ['Open the website in your browser.', 'İnternet sitesini tarayıcında aç.'],
    download: ['Download the file to your computer.', 'Dosyayı bilgisayarına indir.'],
    upload: ['Upload your homework to the website.', 'Ödevini internet sitesine yükle.'],
    password: ['Never share your password with strangers.', 'Şifreni yabancılarla asla paylaşma.'],
    website: ['This website has useful information.', 'Bu internet sitesinde faydalı bilgiler var.'],
    'search engine': ['Use a search engine to find information.', 'Bilgi bulmak için bir arama motoru kullan.'],
    'sign in': ['Sign in with your e-mail and password.', 'E-posta ve şifrenle giriş yap.'],
    'sign up': ['You need to sign up before using the app.', 'Uygulamayı kullanmadan önce kayıt olman gerekir.'],
    rafting: ['Rafting is an exciting water sport.', 'Rafting heyecan verici bir su sporudur.'],
    'rock climbing': ['Rock climbing requires courage and equipment.', 'Kaya tırmanışı cesaret ve ekipman gerektirir.'],
    skydiving: ['Skydiving is an extreme sport.', 'Gökyüzü dalışı ekstrem bir spordur.'],
    kayaking: ['We went kayaking on the lake.', 'Gölde kano yaptık.'],
    'take risks': ['Extreme sports lovers like to take risks.', 'Ekstrem spor sevenler risk almayı sever.'],
    challenging: ['Climbing this mountain is challenging.', 'Bu dağa tırmanmak zorludur.'],
    safe: ['Wear a helmet to stay safe.', 'Güvende kalmak için kask tak.'],
    accommodation: ['The hotel provides comfortable accommodation.', 'Otel rahat bir konaklama sağlar.'],
    destination: ['Cappadocia is a popular tourist destination.', 'Kapadokya popüler bir turistik varış yeridir.'],
    landmark: ['The tower is a famous landmark.', 'Kule ünlü bir şehir simgesidir.'],
    museum: ['We visited the museum yesterday.', 'Dün müzeyi ziyaret ettik.'],
    resort: ['They stayed at a seaside resort.', 'Deniz kenarında bir tatil köyünde kaldılar.'],
    'do the laundry': ['I do the laundry on Saturdays.', 'Cumartesi günleri çamaşır yıkarım.'],
    'wash the dishes': ['Please wash the dishes after dinner.', 'Lütfen akşam yemeğinden sonra bulaşıkları yıka.'],
    'tidy up the room': ['Tidy up the room before your guests arrive.', 'Misafirlerin gelmeden önce odayı toparla.'],
    'take out the garbage': ['Take out the garbage before school.', 'Okuldan önce çöpleri dışarı çıkar.'],
    invent: ['Scientists invent new devices to solve problems.', 'Bilim insanları sorunları çözmek için yeni cihazlar icat eder.'],
    inventor: ['An inventor creates new things.', 'Bir mucit yeni şeyler oluşturur.'],
    discovery: ['The discovery changed science.', 'Bu keşif bilimi değiştirdi.'],
    research: ['Scientists do research in laboratories.', 'Bilim insanları laboratuvarlarda araştırma yapar.'],
    microscope: ['We use a microscope to see tiny cells.', 'Küçük hücreleri görmek için mikroskop kullanırız.'],
    vaccination: ['Vaccination can protect people from diseases.', 'Aşı insanları hastalıklardan koruyabilir.'],
    treatment: ['The patient needs medical treatment.', 'Hastanın tıbbi tedaviye ihtiyacı var.'],
    earthquake: ['The earthquake damaged many buildings.', 'Deprem birçok binaya zarar verdi.'],
    avalanche: ['An avalanche can block mountain roads.', 'Çığ dağ yollarını kapatabilir.'],
    flood: ['Heavy rain caused a flood.', 'Şiddetli yağmur sele neden oldu.'],
    drought: ['The drought caused a water shortage.', 'Kuraklık su kıtlığına neden oldu.'],
    hurricane: ['The hurricane damaged the coastal town.', 'Kasırga kıyı kasabasına zarar verdi.'],
    tornado: ['A tornado is a dangerous natural force.', 'Hortum tehlikeli bir doğal afettir.'],
    tsunami: ['A tsunami can create huge waves.', 'Tsunami dev dalgalar oluşturabilir.'],
    protect: ['We should protect the environment.', 'Çevreyi korumalıyız.'],
    'rescue team': ['The rescue team helped injured people.', 'Kurtarma ekibi yaralı insanlara yardım etti.'],
    'climate change': ['Climate change affects the whole world.', 'İklim değişikliği bütün dünyayı etkiler.'],
  };

  let lab = null;
  let lockedScrollY = 0;

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const norm = (v) => String(v || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9çğıöşü\s'?-]/gi, ' ').replace(/\s+/g, ' ').trim();

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function writeState(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function words() {
    return (window.VOCAB_DATA || []).flatMap((u) => (u.words || []).map((w) => ({ ...w, unit: u.unit, unitTitle: u.title })));
  }

  function pFor(state, id) {
    state.progress ||= {};
    state.progress[id] ||= { level: 0, attempts: 0, correct: 0, wrong: 0, streak: 0, nextReview: 0, lastSeen: 0, lastWrong: false };
    const p = state.progress[id];
    p.directions ||= {
      enTr: { attempts: 0, correct: 0 },
      trEn: { attempts: 0, correct: 0 },
      context: { attempts: 0, correct: 0 },
    };
    return p;
  }

  function todayDay(state) {
    const start = new Date(`${state.startDate || new Date().toISOString().slice(0, 10)}T00:00:00`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(1, Math.min(7, Math.floor((now - start) / DAY) + 1));
  }

  function currentUnits(state) {
    return WEEK[todayDay(state) - 1] || [1, 2];
  }

  function directionAccuracy(p, key) {
    const d = p?.directions?.[key] || {};
    return d.attempts ? Math.round((d.correct / d.attempts) * 100) : null;
  }

  function weakestDirection(p) {
    const a = directionAccuracy(p, 'enTr');
    const b = directionAccuracy(p, 'trEn');
    if (a === null && b === null) return Math.random() < 0.5 ? 'enTr' : 'trEn';
    if (a === null) return 'enTr';
    if (b === null) return 'trEn';
    return a <= b ? 'enTr' : 'trEn';
  }

  function exampleFor(w) {
    const hit = EXAMPLES[norm(w.en)];
    if (hit) return hit;
    const meaning = String(w.tr || '').split(/[,/]/)[0].trim();
    return [`In this unit, “${w.en}” is used for “${meaning}”.`, `Bu ünitede “${w.en}”, “${meaning}” anlamında kullanılır.`];
  }

  function contextPrompt(w) {
    const meaning = String(w.tr || '').split(/[,/]/)[0].trim();
    const stems = {
      1: `Mert is describing a friendship. He wants to express “${meaning}”. Which word or phrase fits best?`,
      2: `Zeynep is talking about teen life. She wants to express “${meaning}”. Which option fits best?`,
      3: `A recipe gives the instruction “${meaning}”. Which English word or phrase should be used?`,
      4: `During a phone conversation, someone wants to say “${meaning}”. Which option is correct?`,
      5: `In an online activity, a user wants to express “${meaning}”. Which option fits best?`,
      6: `In an adventure story, the idea is “${meaning}”. Which English word or phrase matches it?`,
      7: `A tourist guide wants to express “${meaning}”. Which option is correct?`,
      8: `At home, the instruction is “${meaning}”. Which English phrase fits best?`,
      9: `In a science lesson, the teacher wants to express “${meaning}”. Which word fits best?`,
      10: `In a report about natural forces, the idea is “${meaning}”. Which option is correct?`,
    };
    return stems[w.unit] || `Which English word means “${meaning}” in this context?`;
  }

  function dueScore(state, w) {
    const p = pFor(state, w.id);
    let score = 0;
    if (p.lastWrong) score += 100;
    if ((p.smartNextReview || p.nextReview || 0) <= Date.now() && p.attempts) score += 50;
    score += Number(p.wrong || 0) * 8;
    score -= Number(p.correct || 0) * 2;
    const en = directionAccuracy(p, 'enTr');
    const tr = directionAccuracy(p, 'trEn');
    if (en !== null) score += Math.max(0, 80 - en) / 4;
    if (tr !== null) score += Math.max(0, 80 - tr) / 4;
    return score;
  }

  function smartPool(state, count = 12) {
    const all = words();
    const units = currentUnits(state);
    const today = all.filter((w) => units.includes(w.unit));
    const due = all.filter((w) => pFor(state, w.id).attempts > 0).sort((a, b) => dueScore(state, b) - dueScore(state, a));
    const fresh = today.filter((w) => !pFor(state, w.id).attempts);
    const chosen = [];
    [...due.slice(0, 7), ...sample(fresh, 7), ...sample(today, 4)].forEach((w) => {
      if (!chosen.some((x) => x.id === w.id) && chosen.length < count) chosen.push(w);
    });
    return chosen;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .learning-plus-btn{position:relative}.learning-plus-btn:after{content:'YENİ';position:absolute;right:12px;top:10px;font-size:9px;font-weight:900;padding:4px 6px;border-radius:999px;background:#fff2cf;color:#8a5900}
      .lp-modal{position:fixed;inset:0;z-index:180;background:rgba(8,20,14,.64);display:grid;place-items:center;padding:18px;backdrop-filter:blur(4px);overscroll-behavior:contain}.lp-modal.hidden{display:none!important}
      .lp-panel{width:min(930px,100%);max-height:90vh;background:var(--card);border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
      .lp-head{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.lp-head h2{margin:4px 0 4px}.lp-head p{margin:0;color:var(--muted);font-size:13px}.lp-body{overflow:auto;overscroll-behavior:contain;padding:20px;-webkit-overflow-scrolling:touch}
      .lp-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.lp-tool{border:1px solid var(--line);background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 25%,var(--card)));border-radius:18px;padding:15px;text-align:left;color:var(--text);cursor:pointer}.lp-tool:hover{border-color:var(--primary-2);transform:translateY(-1px)}.lp-tool span{font-size:24px;display:block;margin-bottom:8px}.lp-tool b{display:block}.lp-tool small{display:block;color:var(--muted);margin-top:4px;line-height:1.35}
      .lp-card{border:1px solid var(--line);border-radius:20px;padding:20px;background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 20%,var(--card)))}.lp-word{font-size:30px;font-weight:900}.lp-meaning{font-size:18px;color:var(--primary-2);font-weight:800;margin-top:5px}.lp-example{margin-top:14px;padding:14px;border-radius:15px;background:var(--soft);line-height:1.5}.lp-example small{display:block;color:var(--muted);margin-top:3px}
      .lp-question{font-size:20px;font-weight:800;line-height:1.45;margin-bottom:15px}.lp-input-row{display:flex;gap:8px}.lp-input-row input{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:13px;padding:13px}.lp-primary,.lp-secondary,.lp-confidence{border-radius:12px;padding:11px 14px;cursor:pointer;font-weight:800}.lp-primary{border:0;background:var(--primary);color:#fff}.lp-secondary{border:1px solid var(--line);background:var(--card);color:var(--text)}
      .lp-options{display:grid;grid-template-columns:1fr 1fr;gap:9px}.lp-option{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:14px;padding:13px;text-align:left;cursor:pointer}.lp-option.correct{background:#e8f6ee;border-color:#5ca978}.lp-option.wrong{background:#fff0ef;border-color:#d46a6a}.lp-option:disabled{opacity:1}
      .lp-feedback{margin-top:14px;padding:14px 15px;border-radius:15px;line-height:1.5}.lp-feedback.good{background:#e8f6ee;border:1px solid #83bf99}.lp-feedback.bad{background:#fff0ef;border:1px solid #e0a09c}.lp-feedback .reason{display:block;margin-top:5px;color:var(--muted);font-size:13px}.lp-feedback .example-line{display:block;margin-top:8px;font-size:13px}
      .lp-hints{display:flex;gap:8px;align-items:center;margin-top:10px}.lp-confidence-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.lp-confidence{border:1px solid var(--line);background:var(--card);color:var(--text)}.lp-confidence[data-confidence='know']{border-color:#7ab992}.lp-confidence[data-confidence='unsure']{border-color:#e0b85a}.lp-confidence[data-confidence='dont']{border-color:#df8e89}
      .lp-progress{height:8px;background:var(--soft);border-radius:999px;overflow:hidden;margin:0 0 16px}.lp-progress>span{height:100%;display:block;background:linear-gradient(90deg,var(--primary),var(--accent-2));border-radius:999px}.lp-session-top{display:flex;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px;margin-bottom:7px}
      .lp-analysis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px}.lp-kpi{padding:15px;border-radius:16px;background:var(--soft);border:1px solid var(--line)}.lp-kpi b{display:block;font-size:24px}.lp-kpi small{color:var(--muted)}.lp-table{width:100%;border-collapse:collapse}.lp-table th,.lp-table td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);font-size:12px}.lp-table th{color:var(--muted)}.lp-dir-good{color:#26784a;font-weight:900}.lp-dir-weak{color:#b06a24;font-weight:900}.lp-empty{text-align:center;padding:30px;color:var(--muted)}
      @media(max-width:720px){.lp-tools{grid-template-columns:1fr 1fr}.lp-options{grid-template-columns:1fr}.lp-analysis{grid-template-columns:1fr 1fr}.lp-input-row{flex-direction:column}.lp-panel{max-height:94vh}.lp-body{padding:14px}}
    `;
    document.head.appendChild(style);
  }

  function lockScroll() {
    lockedScrollY = window.scrollY || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, lockedScrollY);
  }

  function ensureModal() {
    if (document.getElementById('learningPlusModal')) return;
    const modal = document.createElement('div');
    modal.id = 'learningPlusModal';
    modal.className = 'lp-modal hidden';
    modal.innerHTML = `<section class="lp-panel" role="dialog" aria-modal="true"><header class="lp-head"><div><span class="eyebrow">ÖĞRENME LABORATUVARI</span><h2 id="lpTitle">Kelimeyi gerçekten öğren</h2><p id="lpSubtitle">Anlama, tekrar ve sınav pratiği tek yerde.</p></div><button type="button" class="icon-btn" id="lpClose">✕</button></header><div class="lp-body" id="lpBody"></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(true); });
    modal.querySelector('#lpClose').addEventListener('click', () => closeModal(true));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(true); });
  }

  async function cloudSync() {
    try {
      const cloud = await import('./cloud.js');
      const { auth } = await cloud.initCloud();
      const user = auth?.currentUser;
      if (user) await cloud.saveUserState(user, readState());
    } catch (e) {
      console.warn('Öğrenme laboratuvarı senkronizasyonu bekliyor:', e);
    }
  }

  async function closeModal(reload = false) {
    const modal = document.getElementById('learningPlusModal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (lab?.dirty) await cloudSync();
    modal.classList.add('hidden');
    unlockScroll();
    lab = null;
    if (reload) window.location.reload();
  }

  function openModal(title, subtitle, html) {
    ensureModal();
    document.getElementById('lpTitle').textContent = title;
    document.getElementById('lpSubtitle').textContent = subtitle;
    document.getElementById('lpBody').innerHTML = html;
    document.getElementById('learningPlusModal').classList.remove('hidden');
    lockScroll();
  }

  function openHome() {
    lab = { type: 'home', dirty: false };
    const state = readState();
    const all = words();
    const due = all.filter((w) => {
      const p = pFor(state, w.id);
      return p.attempts > 0 && ((p.smartNextReview || p.nextReview || 0) <= Date.now() || p.lastWrong);
    }).length;
    openModal('Kelimeyi gerçekten öğren', 'Sadece doğru-yanlış değil; anlam yönü, güven ve tekrar zamanı da takip edilir.', `
      <div class="lp-tools">
        <button class="lp-tool" data-lp-mode="cards"><span>🧠</span><b>Anla & Öğren</b><small>Kelime + anlam + örnek cümle + kendi güvenini işaretle.</small></button>
        <button class="lp-tool" data-lp-mode="smart"><span>🔁</span><b>Akıllı Tekrar</b><small>${due} kelime tekrar için hazır. Zayıf yönün daha sık sorulur.</small></button>
        <button class="lp-tool" data-lp-mode="context"><span>🧩</span><b>LGS Bağlam</b><small>Ünite bağlamında çoktan seçmeli anlam soruları.</small></button>
        <button class="lp-tool" data-lp-mode="analysis"><span>📊</span><b>Öğrenme Analizi</b><small>EN→TR ve TR→EN başarını ayrı ayrı gör.</small></button>
      </div>
      <div class="lp-card"><b>Nasıl çalışır?</b><p style="color:var(--muted);line-height:1.55;margin-bottom:0">Bir kelimeyi İngilizceden Türkçeye bilmek, Türkçeden İngilizceye hatırlayabildiğin anlamına gelmez. Bu bölüm iki yönü ayrı ölçer. Yanlışlar kısa aralıklarla, doğru bilinenler giderek daha uzun aralıklarla tekrar gelir.</p></div>`);
  }

  function startCards() {
    const state = readState();
    const pool = smartPool(state, 10);
    lab = { type: 'cards', state, queue: pool, index: 0, dirty: false };
    renderCard();
  }

  function renderCard() {
    const w = lab.queue[lab.index];
    if (!w) return finishLab('Öğrenme kartları tamamlandı');
    const p = pFor(lab.state, w.id);
    const [enEx, trEx] = exampleFor(w);
    const enAcc = directionAccuracy(p, 'enTr');
    const trAcc = directionAccuracy(p, 'trEn');
    openModal('Anla & Öğren', 'Kelimeyi gör, örnek cümlede anla ve kendi güvenini işaretle.', `
      <div class="lp-session-top"><span>Kart ${lab.index + 1} / ${lab.queue.length}</span><span>Ünite ${w.unit} • ${esc(w.unitTitle)}</span></div>
      <div class="lp-progress"><span style="width:${Math.round((lab.index / lab.queue.length) * 100)}%"></span></div>
      <div class="lp-card">
        <div class="lp-word">${esc(w.en)} <button class="lp-secondary" id="lpSpeak" style="padding:6px 9px">🔊</button></div>
        <div class="lp-meaning">${esc(w.tr)}</div>
        <div class="lp-example"><b>${esc(enEx)}</b><small>${esc(trEx)}</small></div>
        <div style="margin-top:14px;color:var(--muted);font-size:12px">EN→TR: <b>${enAcc === null ? 'henüz ölçülmedi' : `%${enAcc}`}</b> • TR→EN: <b>${trAcc === null ? 'henüz ölçülmedi' : `%${trAcc}`}</b></div>
        <div class="lp-confidence-row"><button class="lp-confidence" data-confidence="know">✅ Biliyorum</button><button class="lp-confidence" data-confidence="unsure">🤔 Emin değilim</button><button class="lp-confidence" data-confidence="dont">🆘 Bilmiyorum</button></div>
      </div>`);
    document.getElementById('lpSpeak').onclick = () => speak(w.en);
    document.querySelectorAll('[data-confidence]').forEach((btn) => btn.onclick = () => {
      setConfidence(w, btn.dataset.confidence);
      lab.index += 1;
      renderCard();
    });
  }

  function setConfidence(w, confidence) {
    const p = pFor(lab.state, w.id);
    p.confidence = confidence;
    p.lastSeen = Date.now();
    if (confidence === 'know') {
      p.smartStage = Math.min(6, Number(p.smartStage || 0) + 1);
      p.smartNextReview = Date.now() + REVIEW_DELAYS[p.smartStage];
    } else if (confidence === 'unsure') {
      p.smartStage = Math.max(1, Number(p.smartStage || 0));
      p.smartNextReview = Date.now() + 6 * 60 * 60 * 1000;
    } else {
      p.smartStage = 0;
      p.smartNextReview = Date.now() + 10 * 60 * 1000;
    }
    lab.dirty = true;
    writeState(lab.state);
  }

  function startQuiz(kind) {
    const state = readState();
    const queue = kind === 'context' ? smartPool(state, 10) : smartPool(state, 12);
    lab = { type: kind, state, queue, index: 0, correct: 0, wrong: 0, dirty: false, answered: false, hint: 0 };
    renderQuiz();
  }

  function renderQuiz() {
    const w = lab.queue[lab.index];
    if (!w) return finishLab(lab.type === 'context' ? 'Bağlam turu tamamlandı' : 'Akıllı tekrar tamamlandı');
    lab.answered = false;
    lab.hint = 0;
    if (lab.type === 'context') return renderContext(w);
    const p = pFor(lab.state, w.id);
    const dir = weakestDirection(p);
    lab.direction = dir;
    const useMcq = Math.random() < 0.45;
    if (useMcq) renderDirectionMCQ(w, dir);
    else renderDirectionText(w, dir);
  }

  function sessionTop(w) {
    return `<div class="lp-session-top"><span>Soru ${lab.index + 1} / ${lab.queue.length}</span><span>${lab.correct} doğru • ${lab.wrong} yanlış</span></div><div class="lp-progress"><span style="width:${Math.round((lab.index / lab.queue.length) * 100)}%"></span></div>`;
  }

  function renderDirectionText(w, dir) {
    const trEn = dir === 'trEn';
    const q = trEn ? `“${w.tr}” İngilizce nasıl söylenir?` : `“${w.en}” Türkçe ne demektir?`;
    openModal('Akıllı Tekrar', 'Sistem daha zayıf olduğun anlam yönünü daha sık soruyor.', `${sessionTop(w)}<div class="lp-card"><div class="lp-question">${esc(q)}</div><form id="lpAnswerForm" class="lp-input-row"><input id="lpAnswer" autocomplete="off" placeholder="Cevabını yaz…"><button class="lp-primary">Kontrol et</button></form><div class="lp-hints"><button class="lp-secondary" id="lpHint">💡 İpucu</button>${!trEn ? '<button class="lp-secondary" id="lpSpeak">🔊 Dinle</button>' : ''}</div><div id="lpFeedback"></div></div>`);
    if (!trEn) document.getElementById('lpSpeak').onclick = () => speak(w.en);
    document.getElementById('lpHint').onclick = () => showHint(w, dir);
    document.getElementById('lpAnswer').focus();
    document.getElementById('lpAnswerForm').onsubmit = (e) => {
      e.preventDefault();
      if (lab.answered) return;
      const value = norm(document.getElementById('lpAnswer').value);
      const raw = trEn ? w.en : w.tr;
      const accepts = String(raw).split(/[,/]/).map(norm).filter(Boolean);
      const ok = accepts.some((a) => value === a || (a.length > 5 && similarity(value, a) >= .88));
      handleAnswer(w, ok, dir, value);
    };
  }

  function renderDirectionMCQ(w, dir) {
    const trEn = dir === 'trEn';
    const pool = words().filter((x) => x.unit === w.unit && x.id !== w.id);
    const options = shuffle([w, ...sample(pool, 3)]);
    const q = trEn ? `“${w.tr}” anlamına gelen İngilizce hangisi?` : `“${w.en}” hangi anlama gelir?`;
    openModal('Akıllı Tekrar', 'İki yön ayrı ölçülür; zayıf yön daha sık karşına gelir.', `${sessionTop(w)}<div class="lp-card"><div class="lp-question">${esc(q)}</div><div class="lp-options">${options.map((o) => `<button class="lp-option" data-id="${esc(o.id)}">${esc(trEn ? o.en : o.tr)}</button>`).join('')}</div><div class="lp-hints"><button class="lp-secondary" id="lpHint">💡 İpucu</button></div><div id="lpFeedback"></div></div>`);
    document.getElementById('lpHint').onclick = () => showHint(w, dir);
    document.querySelectorAll('.lp-option').forEach((btn) => btn.onclick = () => {
      if (lab.answered) return;
      const ok = btn.dataset.id === w.id;
      document.querySelectorAll('.lp-option').forEach((x) => {
        if (x.dataset.id === w.id) x.classList.add('correct');
        else if (x === btn && !ok) x.classList.add('wrong');
        x.disabled = true;
      });
      const chosen = options.find((x) => x.id === btn.dataset.id);
      handleAnswer(w, ok, dir, chosen?.en || '');
    });
  }

  function renderContext(w) {
    const pool = words().filter((x) => x.unit === w.unit && x.id !== w.id);
    const options = shuffle([w, ...sample(pool, 3)]);
    openModal('LGS Bağlam', 'Kelimeyi doğrudan ezberlemek yerine ünite bağlamında seç.', `${sessionTop(w)}<div class="lp-card"><div class="lp-question">${esc(contextPrompt(w))}</div><div class="lp-options">${options.map((o) => `<button class="lp-option" data-id="${esc(o.id)}">${esc(o.en)}</button>`).join('')}</div><div id="lpFeedback"></div></div>`);
    document.querySelectorAll('.lp-option').forEach((btn) => btn.onclick = () => {
      if (lab.answered) return;
      const ok = btn.dataset.id === w.id;
      document.querySelectorAll('.lp-option').forEach((x) => {
        if (x.dataset.id === w.id) x.classList.add('correct');
        else if (x === btn && !ok) x.classList.add('wrong');
        x.disabled = true;
      });
      const chosen = options.find((x) => x.id === btn.dataset.id);
      handleAnswer(w, ok, 'context', chosen?.en || '');
    });
  }

  function showHint(w, dir) {
    lab.hint += 1;
    const ans = dir === 'enTr' ? String(w.tr) : String(w.en);
    const [enEx, trEx] = exampleFor(w);
    let msg = '';
    if (lab.hint === 1) msg = `İlk ipucu: “${ans.trim().charAt(0)}” ile başlıyor.`;
    else if (lab.hint === 2) msg = dir === 'trEn' ? `İkinci ipucu: ${w.en.split(/\s+/).length} kelimelik bir ifade, toplam ${w.en.length} karakter.` : `İkinci ipucu: Türkçe karşılık ${String(w.tr).split(/[,/]/)[0].trim().length} karakter civarında.`;
    else msg = `Örnek: ${enEx} — ${trEx}`;
    let box = document.getElementById('lpHintText');
    if (!box) {
      box = document.createElement('div');
      box.id = 'lpHintText';
      box.className = 'lp-example';
      document.querySelector('.lp-hints').after(box);
    }
    box.textContent = msg;
  }

  function updateProgress(w, ok, dir) {
    const state = lab.state;
    state.stats ||= { attempts: 0, correct: 0 };
    state.stats.attempts = Number(state.stats.attempts || 0) + 1;
    if (ok) state.stats.correct = Number(state.stats.correct || 0) + 1;
    const p = pFor(state, w.id);
    p.attempts = Number(p.attempts || 0) + 1;
    p.lastSeen = Date.now();
    p.lastWrong = !ok;
    if (ok) {
      p.correct = Number(p.correct || 0) + 1;
      p.streak = Number(p.streak || 0) + 1;
      if (p.streak >= 2) p.level = Math.min(3, Number(p.level || 0) + 1);
      p.smartStage = Math.min(6, Number(p.smartStage || 0) + 1);
      p.smartNextReview = Date.now() + REVIEW_DELAYS[p.smartStage];
      p.nextReview = p.smartNextReview;
    } else {
      p.wrong = Number(p.wrong || 0) + 1;
      p.streak = 0;
      p.level = Math.max(0, Number(p.level || 0) - 1);
      p.smartStage = 0;
      p.smartNextReview = Date.now() + 5 * 60 * 1000;
      p.nextReview = p.smartNextReview;
    }
    p.directions ||= {};
    p.directions[dir] ||= { attempts: 0, correct: 0 };
    p.directions[dir].attempts += 1;
    if (ok) p.directions[dir].correct += 1;
    state.activity ||= {};
    const date = new Date().toISOString().slice(0, 10);
    state.activity[date] ||= { seconds: 0, attempts: 0, correct: 0, sessions: 0 };
    state.activity[date].attempts = Number(state.activity[date].attempts || 0) + 1;
    if (ok) state.activity[date].correct = Number(state.activity[date].correct || 0) + 1;
    writeState(state);
    lab.dirty = true;
  }

  function handleAnswer(w, ok, dir, chosen) {
    lab.answered = true;
    ok ? lab.correct++ : lab.wrong++;
    updateProgress(w, ok, dir);
    const p = pFor(lab.state, w.id);
    const [enEx, trEx] = exampleFor(w);
    const feedback = document.getElementById('lpFeedback');
    const chosenWord = words().find((x) => norm(x.en) === norm(chosen));
    let reason = ok ? `Bu cevap doğru: ${w.en} = ${w.tr}.` : `Doğru cevap “${w.en}”. Bu ünitede “${w.tr}” anlamında kullanılır.`;
    if (!ok && chosenWord && chosenWord.id !== w.id) reason += ` Seçtiğin “${chosenWord.en}” ise “${chosenWord.tr}” anlamına gelir.`;
    feedback.innerHTML = `<div class="lp-feedback ${ok ? 'good' : 'bad'}"><b>${ok ? '✅ Doğru!' : '❌ Henüz değil.'}</b><span class="reason">${esc(reason)}</span><span class="example-line"><b>Örnek:</b> ${esc(enEx)}<br><small>${esc(trEx)}</small></span><div class="lp-confidence-row"><button class="lp-confidence" data-confidence="know">✅ Biliyorum</button><button class="lp-confidence" data-confidence="unsure">🤔 Emin değilim</button><button class="lp-confidence" data-confidence="dont">🆘 Bilmiyorum</button><button class="lp-primary" id="lpNext">Sonraki →</button></div></div>`;
    speak(w.en);
    document.querySelectorAll('[data-confidence]').forEach((btn) => btn.onclick = () => {
      const confidence = btn.dataset.confidence;
      p.confidence = confidence;
      if (confidence === 'dont') { p.smartStage = 0; p.smartNextReview = Date.now() + 10 * 60 * 1000; p.nextReview = p.smartNextReview; }
      if (confidence === 'unsure') { p.smartNextReview = Date.now() + 6 * 60 * 60 * 1000; p.nextReview = p.smartNextReview; }
      writeState(lab.state);
      lab.dirty = true;
      document.querySelectorAll('[data-confidence]').forEach((x) => x.disabled = true);
    });
    document.getElementById('lpNext').onclick = () => { lab.index += 1; renderQuiz(); };
  }

  function finishLab(title) {
    const total = (lab.correct || 0) + (lab.wrong || 0);
    const pct = total ? Math.round((lab.correct / total) * 100) : 0;
    openModal(title, 'Yeni öğrenme verilerin kaydedildi.', `<div class="lp-card" style="text-align:center"><div style="font-size:46px;font-weight:900">${total ? `${pct}%` : '✓'}</div><h3>${esc(title)}</h3>${total ? `<p>${lab.correct} doğru • ${lab.wrong} yanlış</p>` : '<p>Güven işaretlerin tekrar planına eklendi.</p>'}<button class="lp-primary" id="lpFinish">Ana ekrana dön</button></div>`);
    document.getElementById('lpFinish').onclick = async () => { await cloudSync(); lab.dirty = false; closeModal(true); };
  }

  function openAnalysis() {
    const state = readState();
    const studied = words().filter((w) => pFor(state, w.id).attempts > 0);
    const rows = studied.map((w) => {
      const p = pFor(state, w.id);
      return { w, en: directionAccuracy(p, 'enTr'), tr: directionAccuracy(p, 'trEn'), ctx: directionAccuracy(p, 'context'), attempts: p.attempts };
    }).sort((a, b) => {
      const av = (a.en ?? 50) + (a.tr ?? 50);
      const bv = (b.en ?? 50) + (b.tr ?? 50);
      return av - bv;
    });
    const avg = (key) => {
      const vals = rows.map((r) => r[key]).filter((v) => v !== null);
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    lab = { type: 'analysis', dirty: false };
    openModal('Öğrenme Analizi', 'İngilizceden Türkçeye ve Türkçeden İngilizceye hatırlama ayrı ölçülür.', `<div class="lp-analysis"><div class="lp-kpi"><b>%${avg('en')}</b><small>EN → TR</small></div><div class="lp-kpi"><b>%${avg('tr')}</b><small>TR → EN</small></div><div class="lp-kpi"><b>${studied.length}</b><small>ölçülen kelime</small></div></div>${rows.length ? `<div style="overflow:auto"><table class="lp-table"><thead><tr><th>Kelime</th><th>Ünite</th><th>EN→TR</th><th>TR→EN</th><th>Bağlam</th><th>Zayıf yön</th></tr></thead><tbody>${rows.slice(0, 80).map((r) => { const weak = r.en === null || r.tr === null ? 'ölçülmeli' : r.en <= r.tr ? 'EN→TR' : 'TR→EN'; return `<tr><td><b>${esc(r.w.en)}</b><br><small>${esc(r.w.tr)}</small></td><td>${r.w.unit}</td><td class="${r.en !== null && r.en < 70 ? 'lp-dir-weak' : 'lp-dir-good'}">${r.en === null ? '—' : `%${r.en}`}</td><td class="${r.tr !== null && r.tr < 70 ? 'lp-dir-weak' : 'lp-dir-good'}">${r.tr === null ? '—' : `%${r.tr}`}</td><td>${r.ctx === null ? '—' : `%${r.ctx}`}</td><td>${weak}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="lp-empty">Henüz yön bazlı ölçüm yok. Akıllı Tekrar ile birkaç soru çöz.</div>'}`);
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = .9;
    speechSynthesis.speak(u);
  }

  function similarity(a, b) {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - dp[a.length][b.length] / Math.max(a.length, b.length);
  }

  function addEntryButton() {
    const grid = document.querySelector('.mode-grid');
    if (!grid || document.getElementById('learningPlusEntry')) return;
    const btn = document.createElement('button');
    btn.id = 'learningPlusEntry';
    btn.type = 'button';
    btn.className = 'mode-btn learning-plus-btn';
    btn.innerHTML = '<span>🎓</span><b>Öğrenme Laboratuvarı</b><small>Akıllı tekrar • bağlam • analiz</small>';
    btn.onclick = openHome;
    grid.appendChild(btn);
  }

  function init() {
    injectStyles();
    ensureModal();
    addEntryButton();
    document.addEventListener('click', (e) => {
      const mode = e.target.closest('[data-lp-mode]')?.dataset.lpMode;
      if (!mode) return;
      if (mode === 'cards') startCards();
      if (mode === 'smart') startQuiz('smart');
      if (mode === 'context') startQuiz('context');
      if (mode === 'analysis') openAnalysis();
    });
    setInterval(addEntryButton, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();