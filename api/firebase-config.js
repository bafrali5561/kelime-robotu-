module.exports = function handler(req, res) {
  const envMap = {
    apiKey: 'FIREBASE_API_KEY',
    authDomain: 'FIREBASE_AUTH_DOMAIN',
    projectId: 'FIREBASE_PROJECT_ID',
    storageBucket: 'FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
    appId: 'FIREBASE_APP_ID',
    measurementId: 'FIREBASE_MEASUREMENT_ID',
  };

  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
  ];
  const missing = required.filter((key) => !process.env[key]);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (missing.length) {
    res.status(503).json({ configured: false, missing });
    return;
  }

  const config = {};
  for (const [key, envName] of Object.entries(envMap)) {
    if (process.env[envName]) config[key] = process.env[envName];
  }

  res.status(200).json({ configured: true, config });
};
