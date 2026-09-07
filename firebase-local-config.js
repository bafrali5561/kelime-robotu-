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

function loadKelimeScript(src, dataKey) {
  if (document.querySelector(`script[data-${dataKey}]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.dataset[dataKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = '1';
  document.head.appendChild(script);
}

// Keep dashboard numbers, unit percentages and session exit behavior consistent.
loadKelimeScript('./dashboard-compat.js?v=20260907-1', 'kelime-dashboard-compat');

// Click-through detail panels for learned/review/unit statistics.
loadKelimeScript('./details.js?v=20260907-2', 'kelime-details');

// Advanced learning tools: examples, smart review, context/LGS practice and analysis.
loadKelimeScript('./learning-plus.js?v=20260907-1', 'kelime-learning-plus');

// Full vocabulary roadmap with learned checks.
loadKelimeScript('./vocabulary-overview.js?v=20260907-1', 'kelime-vocab-overview');

// Guided home experience: clear start point, simplified study choices and better page order.
loadKelimeScript('./home-flow.js?v=20260907-1', 'kelime-home-flow');

// The complete vocabulary roadmap belongs at the very end of the dashboard.
loadKelimeScript('./layout-finalizer.js?v=20260907-1', 'kelime-layout-finalizer');

// Strong visual hierarchy for the unit progress area. These rules intentionally use
// !important because older dashboard helpers add inline presentation styles.
(() => {
  if (document.getElementById('unitProgressPolish')) return;
  const style = document.createElement('style');
  style.id = 'unitProgressPolish';
  style.textContent = `
    #unitProgress.unit-progress{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:12px!important;
      align-items:stretch!important;
    }
    #unitProgress .unit-row{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      grid-template-areas:'info pct' 'track track' 'action action'!important;
      gap:10px 12px!important;
      align-items:center!important;
      min-width:0!important;
      padding:15px 16px!important;
      border:1px solid var(--line)!important;
      border-radius:17px!important;
      background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 28%,var(--card)))!important;
      box-shadow:0 8px 22px rgba(24,55,40,.045)!important;
      overflow:hidden!important;
    }
    #unitProgress .unit-row:hover{
      transform:translateY(-1px)!important;
      border-color:color-mix(in srgb,var(--primary-2) 45%,var(--line))!important;
      box-shadow:0 12px 28px rgba(24,55,40,.08)!important;
    }
    #unitProgress .unit-row>div:first-child{
      grid-area:info!important;
      min-width:0!important;
      line-height:1.25!important;
    }
    #unitProgress .unit-row>div:first-child b{
      display:block!important;
      margin:0 0 5px!important;
      font-size:15px!important;
      line-height:1.25!important;
      color:var(--text)!important;
    }
    #unitProgress .unit-row>div:first-child small{
      display:block!important;
      margin:0!important;
      color:var(--muted)!important;
      font-size:11px!important;
      line-height:1.4!important;
      white-space:normal!important;
    }
    #unitProgress .unit-row .mini-track{
      grid-area:track!important;
      width:100%!important;
      height:8px!important;
      margin:0!important;
      border-radius:999px!important;
      background:color-mix(in srgb,var(--soft) 88%,var(--line))!important;
      overflow:hidden!important;
    }
    #unitProgress .unit-row .mini-fill{
      height:100%!important;
      min-width:0!important;
      border-radius:999px!important;
      background:linear-gradient(90deg,var(--primary),var(--primary-3))!important;
    }
    #unitProgress .unit-row .unit-pct{
      grid-area:pct!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      justify-self:end!important;
      min-width:66px!important;
      padding:8px 10px!important;
      border-radius:13px!important;
      background:var(--soft)!important;
      color:var(--primary-2)!important;
      text-align:center!important;
      line-height:1!important;
      white-space:nowrap!important;
      font-weight:900!important;
    }
    #unitProgress .unit-row .unit-pct b{
      display:block!important;
      font-size:16px!important;
      line-height:1!important;
    }
    #unitProgress .unit-row .unit-pct small{
      display:block!important;
      margin-top:4px!important;
      font-size:9px!important;
      line-height:1!important;
      color:var(--muted)!important;
      font-weight:800!important;
    }
    #unitProgress .unit-row.detail-clickable:after{
      grid-area:action!important;
      content:'Kelime listesini aç  →'!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-self:end!important;
      width:auto!important;
      margin:0!important;
      padding:6px 9px!important;
      border-radius:999px!important;
      background:color-mix(in srgb,var(--primary-2) 8%,var(--card))!important;
      border:1px solid color-mix(in srgb,var(--primary-2) 16%,var(--line))!important;
      color:var(--primary-2)!important;
      font-size:10px!important;
      font-weight:850!important;
      line-height:1!important;
    }
    @media(max-width:900px){
      #unitProgress.unit-progress{grid-template-columns:1fr!important;}
    }
    @media(max-width:560px){
      #unitProgress .unit-row{
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:9px 10px!important;
        padding:13px!important;
      }
      #unitProgress .unit-row>div:first-child b{font-size:14px!important;}
      #unitProgress .unit-row .unit-pct{min-width:60px!important;padding:7px 8px!important;}
      #unitProgress .unit-row .unit-pct b{font-size:14px!important;}
    }
  `;
  document.head.appendChild(style);
})();