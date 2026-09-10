const FIREBASE_VERSION = '10.14.1';
const ACTIVE_UID_KEY = 'kelimeRobotu.activeUid.v1';
const LAST_UID_KEY = 'kelimeRobotu.lastAuthUid.v1';
const STATE_KEY = 'kelimeRobotu.v2';
const LEGACY_STATE_KEY = 'kelimeRobotu.v1';

let modules = null;
let firebaseApp = null;
let auth = null;
let db = null;
let initialized = false;
let initError = null;
let initPromise = null;

function freshLearningState() {
  return {
    startDate: new Date().toISOString().slice(0, 10),
    progress: {},
    stats: { attempts: 0, correct: 0 },
    streak: { lastDate: null, count: 0 },
    activity: {},
    sound: true,
    dark: false,
  };
}

function cacheKey(uid) {
  return `kelimeRobotu.cache.${uid}`;
}

function cacheMetaKey(uid) {
  return `kelimeRobotu.cacheMeta.${uid}`;
}

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function number(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function maxNumber(...values) {
  return Math.max(0, ...values.map(number));
}

function cleanState(raw) {
  const base = freshLearningState();
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    ...base,
    ...src,
    progress: src.progress && typeof src.progress === 'object' ? src.progress : {},
    stats: { ...base.stats, ...(src.stats || {}) },
    streak: { ...base.streak, ...(src.streak || {}) },
    activity: src.activity && typeof src.activity === 'object' ? src.activity : {},
  };
}

function mergeDirections(a = {}, b = {}) {
  const result = {};
  for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = a?.[key] || {};
    const y = b?.[key] || {};
    result[key] = {
      ...x,
      ...y,
      attempts: maxNumber(x.attempts, y.attempts),
      correct: maxNumber(x.correct, y.correct),
    };
  }
  return result;
}

function mergeProgressRecord(remote = {}, local = {}) {
  const remoteSeen = number(remote.lastSeen);
  const localSeen = number(local.lastSeen);
  const latest = localSeen > remoteSeen ? local : remote;
  const other = latest === local ? remote : local;
  const merged = { ...other, ...latest };

  merged.attempts = maxNumber(remote.attempts, local.attempts);
  merged.correct = maxNumber(remote.correct, local.correct);
  merged.wrong = maxNumber(remote.wrong, local.wrong);
  merged.lastSeen = maxNumber(remote.lastSeen, local.lastSeen);
  if (remote.directions || local.directions) merged.directions = mergeDirections(remote.directions, local.directions);

  if (!remoteSeen && !localSeen) {
    merged.level = maxNumber(remote.level, local.level);
    merged.streak = maxNumber(remote.streak, local.streak);
    merged.nextReview = maxNumber(remote.nextReview, local.nextReview);
    merged.smartStage = maxNumber(remote.smartStage, local.smartStage);
    merged.smartNextReview = maxNumber(remote.smartNextReview, local.smartNextReview);
    merged.lastWrong = Boolean(remote.lastWrong || local.lastWrong);
  }

  return merged;
}

function mergeActivity(remote = {}, local = {}) {
  const result = {};
  for (const day of new Set([...Object.keys(remote || {}), ...Object.keys(local || {})])) {
    const a = remote?.[day] || {};
    const b = local?.[day] || {};
    result[day] = {
      ...a,
      ...b,
      seconds: maxNumber(a.seconds, b.seconds),
      attempts: maxNumber(a.attempts, b.attempts),
      correct: maxNumber(a.correct, b.correct),
      sessions: maxNumber(a.sessions, b.sessions),
    };
  }
  return result;
}

function mergeLearningStates(remoteRaw, localRaw) {
  const remote = cleanState(remoteRaw);
  const local = cleanState(localRaw);
  const progress = {};

  for (const id of new Set([...Object.keys(remote.progress), ...Object.keys(local.progress)])) {
    progress[id] = mergeProgressRecord(remote.progress[id] || {}, local.progress[id] || {});
  }

  const progressAttempts = Object.values(progress).reduce((sum, p) => sum + number(p.attempts), 0);
  const progressCorrect = Object.values(progress).reduce((sum, p) => sum + number(p.correct), 0);
  const remoteDate = String(remote.streak?.lastDate || '');
  const localDate = String(local.streak?.lastDate || '');
  const newerStreak = localDate > remoteDate ? local.streak : remote.streak;
  const olderStreak = newerStreak === local.streak ? remote.streak : local.streak;
  const startDates = [remote.startDate, local.startDate].filter(Boolean).sort();

  return {
    ...remote,
    ...local,
    startDate: startDates[0] || remote.startDate || local.startDate,
    progress,
    stats: {
      attempts: maxNumber(remote.stats?.attempts, local.stats?.attempts, progressAttempts),
      correct: maxNumber(remote.stats?.correct, local.stats?.correct, progressCorrect),
    },
    streak: {
      ...olderStreak,
      ...newerStreak,
      lastDate: newerStreak?.lastDate || olderStreak?.lastDate || null,
      count: remoteDate === localDate
        ? maxNumber(remote.streak?.count, local.streak?.count)
        : number(newerStreak?.count),
    },
    activity: mergeActivity(remote.activity, local.activity),
    sound: typeof local.sound === 'boolean' ? local.sound : remote.sound,
    dark: typeof local.dark === 'boolean' ? local.dark : remote.dark,
  };
}

function sameState(a, b) {
  try {
    return JSON.stringify(cleanState(a)) === JSON.stringify(cleanState(b));
  } catch {
    return false;
  }
}

function rememberLocal(uid, learningState, synced = false) {
  if (!uid || !learningState) return;
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(learningState));
    const oldMeta = readJson(cacheMetaKey(uid), {}) || {};
    const ts = Date.now();
    localStorage.setItem(cacheMetaKey(uid), JSON.stringify({
      updatedAt: Math.max(number(oldMeta.updatedAt), ts),
      syncedAt: synced ? ts : number(oldMeta.syncedAt),
    }));
  } catch (_) {}
}

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
  if (window.FIREBASE_CONFIG?.apiKey) return window.FIREBASE_CONFIG;

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
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const config = await loadConfig();
      const sdk = await importFirebase();
      firebaseApp = sdk.getApps?.().length ? sdk.getApp() : sdk.initializeApp(config);
      auth = sdk.getAuth(firebaseApp);
      db = sdk.getFirestore(firebaseApp);
      await sdk.setPersistence(auth, sdk.browserLocalPersistence);
      initialized = true;
      return { auth, db };
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error));
      throw initError;
    }
  })();

  return initPromise;
}

function requireReady() {
  if (!initialized || !auth || !db || !modules) throw new Error('Bulut bağlantısı hazır değil.');
}

export function observeAuth(callback) {
  requireReady();
  return modules.onAuthStateChanged(auth, callback);
}

export async function registerUser({ name, email, password, initialState }) {
  requireReady();
  const credential = await modules.createUserWithEmailAndPassword(auth, email, password);
  const cleanName = String(name || '').trim();
  if (cleanName) await modules.updateProfile(credential.user, { displayName: cleanName });

  const previousAuthUid = localStorage.getItem(LAST_UID_KEY);
  const safeInitialState = previousAuthUid && previousAuthUid !== credential.user.uid
    ? freshLearningState()
    : cleanState(initialState || freshLearningState());

  localStorage.setItem(ACTIVE_UID_KEY, credential.user.uid);
  localStorage.setItem(LAST_UID_KEY, credential.user.uid);
  localStorage.setItem(STATE_KEY, JSON.stringify(safeInitialState));
  rememberLocal(credential.user.uid, safeInitialState, true);

  await modules.setDoc(modules.doc(db, 'users', credential.user.uid), {
    profile: {
      name: cleanName || email.split('@')[0],
      email: credential.user.email || email,
      createdAt: modules.serverTimestamp(),
      lastLoginAt: modules.serverTimestamp(),
    },
    learningState: safeInitialState,
    schemaVersion: 3,
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
  const uid = auth.currentUser?.uid || localStorage.getItem(ACTIVE_UID_KEY) || '';
  if (uid) localStorage.setItem(LAST_UID_KEY, uid);
  await modules.signOut(auth);
  localStorage.removeItem(ACTIVE_UID_KEY);
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(LEGACY_STATE_KEY);
}

export async function sendReset(email) {
  requireReady();
  await modules.sendPasswordResetEmail(auth, email);
}

export async function loadUserDocument(uid) {
  requireReady();
  if (!uid) return { learningState: freshLearningState() };

  const previousUid = localStorage.getItem(ACTIVE_UID_KEY);
  if (previousUid && previousUid !== uid) {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(LEGACY_STATE_KEY);
  }
  localStorage.setItem(ACTIVE_UID_KEY, uid);
  localStorage.setItem(LAST_UID_KEY, uid);

  const cached = readJson(cacheKey(uid), null);
  const currentForSameUser = previousUid === uid ? readJson(STATE_KEY, null) : null;
  const localCandidate = cached && currentForSameUser
    ? mergeLearningStates(cached, currentForSameUser)
    : (cached || currentForSameUser);

  const ref = modules.doc(db, 'users', uid);
  const snapshot = await modules.getDoc(ref);
  const remote = snapshot.exists() ? snapshot.data() : null;

  if (remote?.learningState && localCandidate) {
    const merged = mergeLearningStates(remote.learningState, localCandidate);
    if (!sameState(merged, remote.learningState)) {
      await modules.setDoc(ref, {
        learningState: merged,
        schemaVersion: 3,
        updatedAt: modules.serverTimestamp(),
      }, { merge: true });
    }
    rememberLocal(uid, merged, true);
    localStorage.setItem(STATE_KEY, JSON.stringify(merged));
    return { ...remote, learningState: merged, mergedLocalProgress: true };
  }

  if (remote?.learningState) {
    const state = cleanState(remote.learningState);
    rememberLocal(uid, state, true);
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return { ...remote, learningState: state };
  }

  const initial = cleanState(localCandidate || freshLearningState());
  await modules.setDoc(ref, {
    learningState: initial,
    schemaVersion: 3,
    updatedAt: modules.serverTimestamp(),
  }, { merge: true });
  rememberLocal(uid, initial, true);
  localStorage.setItem(STATE_KEY, JSON.stringify(initial));
  return { ...(remote || {}), learningState: initial, createdLearningState: true };
}

export async function saveUserState(user, learningState) {
  requireReady();
  if (!user?.uid || !learningState) return;

  const activeUid = localStorage.getItem(ACTIVE_UID_KEY);
  if (activeUid && activeUid !== user.uid) {
    throw new Error('Hesap değiştiği için önceki hesaba ait yerel veri kaydedilmedi.');
  }

  localStorage.setItem(ACTIVE_UID_KEY, user.uid);
  localStorage.setItem(LAST_UID_KEY, user.uid);
  const localState = cleanState(learningState);
  rememberLocal(user.uid, localState, false);

  const ref = modules.doc(db, 'users', user.uid);
  const snapshot = await modules.getDoc(ref);
  const remote = snapshot.exists() ? snapshot.data() : null;
  const merged = remote?.learningState ? mergeLearningStates(remote.learningState, localState) : localState;

  await modules.setDoc(ref, {
    profile: {
      name: user.displayName || user.email?.split('@')[0] || 'Öğrenci',
      email: user.email || '',
      lastActiveAt: modules.serverTimestamp(),
    },
    learningState: merged,
    schemaVersion: 3,
    updatedAt: modules.serverTimestamp(),
  }, { merge: true });

  rememberLocal(user.uid, merged, true);
  localStorage.setItem(STATE_KEY, JSON.stringify(merged));
  return merged;
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
