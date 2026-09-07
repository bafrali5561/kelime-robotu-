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