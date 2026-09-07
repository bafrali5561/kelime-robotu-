# Kelime Robotu — Canlıya Alma Kontrol Listesi

## 1) Firebase Web App ✅
Proje yapılandırması `firebase-local-config.js` içine eklendi.

## 2) Firebase Authentication
Firebase Console → Build → Authentication → Get started → Sign-in method

Açılacak sağlayıcı:
- Email/Password: Enabled
- Email link: Kapalı kalabilir

## 3) Cloud Firestore
Firebase Console → Build → Firestore Database → Create database

- Production mode seçin.
- Kullanıcılarınıza en yakın bölgeyi seçin.
- Database oluşturulduktan sonra Rules sekmesine geçin.
- Projedeki `firestore.rules` dosyasının içeriğini yapıştırın ve Publish seçin.

## 4) Authorized domains
Authentication → Settings → Authorized domains

İlk testte aşağıdakiler bulunmalı:
- localhost
- kelime-robotu.firebaseapp.com

Vercel adresiniz belli olunca örneğin `kelime-robotu.vercel.app` alan adını da ekleyin.
Özel alan adı kullanırsanız onu da ekleyin.

## 5) Vercel
Bu proje statik web uygulamasıdır; framework preset olarak Other seçilebilir.

- Build Command: boş
- Output Directory: boş / proje kökü
- Install Command: boş

`firebase-local-config.js` yapılandırmayı içerdiği için Firebase ortam değişkeni eklemek zorunlu değildir.

## 6) İlk canlı test
1. Yeni öğrenci hesabı oluşturun.
2. Birkaç soru çözün.
3. Çıkış yapın.
4. Aynı hesapla yeniden giriş yapın.
5. İlerlemenin geri geldiğini kontrol edin.
6. Firestore → Data altında `users/{uid}` belgesinin oluştuğunu kontrol edin.
