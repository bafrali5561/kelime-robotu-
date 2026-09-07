const FIREBASE_VERSION = '10.14.1';

let modules = null;
let firebaseApp = null;
let auth = null;
let db = null;
let initialized = false;
let initError = null;

async function importFirebase() {
  if (modules) return modules;
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const [appMod, authMod, firestoreMod] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  modules = { ...appMod, ...authMod, ...firestoreMod };
  return modules;
}

async function loadConfig() {
  if (window.FIREBASE_CONFIG?.apiKey) {
    return window.FIREBASE_CONFIG;
  }

  const response = await fetch('/api/firebase-config', { cache: 'no-store' });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Firebase yapılandırması okunamadı.');
  }

  if (!response.ok || !payload?.configured || !payload?.config?.apiKey) {
    const missing = payload?.missing?.length ? ` Eksik: ${payload.missing.join(', ')}` : '';
    throw new Error(`Firebase henüz yapılandırılmamış.${missing}`);
  }
  return payload.config;
}

export async function initCloud() {
  if (initialized) return { auth, db };
  if (initError) throw initError;

  try {
    const config = await loadConfig();
    const sdk = await importFirebase();
    firebaseApp = sdk.initializeApp(config);
    auth = sdk.getAuth(firebaseApp);
    db = sdk.getFirestore(firebaseApp);
    await sdk.setPersistence(auth, sdk.browserLocalPersistence);
    initialized = true;
    return { auth, db };
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    throw initError;
  }
}

function requireReady() {
  if (!initialized || !auth || !db || !modules) {
    throw new Error('Bulut bağlantısı hazır değil.');
  }
}

export function observeAuth(callback) {
  requireReady();
  return modules.onAuthStateChanged(auth, callback);
}

export async function registerUser({ name, email, password, initialState }) {
  requireReady();
  const credential = await modules.createUserWithEmailAndPassword(auth, email, password);
  const cleanName = String(name || '').trim();
  if (cleanName) {
    await modules.updateProfile(credential.user, { displayName: cleanName });
  }

  await modules.setDoc(modules.doc(db, 'users', credential.user.uid), {
    profile: {
      name: cleanName || email.split('@')[0],
      email: credential.user.email || email,
      createdAt: modules.serverTimestamp(),
      lastLoginAt: modules.serverTimestamp(),
    },
    learningState: initialState || null,
    schemaVersion: 2,
    updatedAt: modules.serverTimestamp(),
  }, { merge: true });

  return credential.user;
}

export async function loginUser(email, password) {
  requireReady();
  const credential = await modules.signInWithEmailAndPassword(auth, email, password);
  await modules.setDoc(modules.doc(db, 'users', credential.user.uid), {
    profile: {
      email: credential.user.email || email,
      lastLoginAt: modules.serverTimestamp(),
    },
    updatedAt: modules.serverTimestamp(),
  }, { merge: true });
  return credential.user;
}

export async function logoutUser() {
  requireReady();
  await modules.signOut(auth);
}

export async function sendReset(email) {
  requireReady();
  await modules.sendPasswordResetEmail(auth, email);
}

export async function loadUserDocument(uid) {
  requireReady();
  const snapshot = await modules.getDoc(modules.doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveUserState(user, learningState) {
  requireReady();
  if (!user?.uid) return;
  await modules.setDoc(modules.doc(db, 'users', user.uid), {
    profile: {
      name: user.displayName || user.email?.split('@')[0] || 'Öğrenci',
      email: user.email || '',
      lastActiveAt: modules.serverTimestamp(),
    },
    learningState,
    schemaVersion: 2,
    updatedAt: modules.serverTimestamp(),
  }, { merge: true });
}

export function cloudErrorMessage(error) {
  const code = error?.code || '';
  const map = {
    'auth/email-already-in-use': 'Bu e-posta adresiyle daha önce hesap açılmış.',
    'auth/invalid-email': 'E-posta adresi geçerli görünmüyor.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.',
    'auth/network-request-failed': 'İnternet bağlantısı kurulamadı.',
  };
  return map[code] || error?.message || 'İşlem sırasında bir hata oluştu.';
}
