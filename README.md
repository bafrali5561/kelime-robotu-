# 8. Sınıf Kelime Robotu — Vercel + Firebase sürümü

Bu sürüm herkesin internetten erişebileceği şekilde Vercel'e yayınlanmak ve her öğrencinin kendi hesabıyla giriş yapıp ilerlemesini Firebase üzerinde saklamak için hazırlanmıştır.

## Neler hazır?

- 10 ünite / kelime çalışma sistemi
- E-posta + şifre ile kayıt
- E-posta + şifre ile giriş
- Şifre sıfırlama
- Kişiye özel kelime ilerlemesi
- Doğru / yanlış / öğrenme seviyesi kaydı
- Günlük çalışma süresi
- Günlük seri
- Ünite bazlı ilerleme
- Cihazlar arası senkronizasyon
- Misafir modu
- JSON yedek alma / geri yükleme
- PWA desteği
- Vercel için `/api/firebase-config` fonksiyonu
- Firestore güvenlik kuralları

## Mimari

```text
Öğrenci telefonu / bilgisayarı
          |
          v
       Vercel
  (web uygulaması)
          |
          v
      Firebase
  Authentication
    + Firestore
```

## 1) Firebase projesi oluştur

Firebase Console'da bir proje oluşturun veya mevcut uygun bir projeyi kullanın.

### Authentication

Firebase Console > Build > Authentication > Sign-in method bölümünde:

- `Email/Password` sağlayıcısını etkinleştirin.

### Firestore

Firebase Console > Build > Firestore Database bölümünde Firestore veritabanı oluşturun.

Ardından bu projedeki `firestore.rules` içeriğini Firestore > Rules bölümüne yapıştırıp Publish edin.

Kurallar her kullanıcının yalnızca kendi `users/{uid}` belgesini okuyup yazmasına izin verir.

## 2) Firebase Web App oluştur

Firebase Console > Project settings > General > Your apps > Web app (`</>`) seçin.

Size buna benzer bir config verilir:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Bu değerleri Vercel'e Environment Variable olarak gireceğiz.

## 3) GitHub'a yükle

Bu klasörün içeriğini yeni bir GitHub repository'sine yükleyin. Önerilen ad:

`kelime-robotu`

Repo private olabilir; Vercel private GitHub repository'lerini de deploy edebilir.

## 4) Vercel'e bağla

Vercel > Add New > Project > GitHub repository'nizi Import edin.

Framework Preset olarak `Other` / statik proje kullanılabilir. Build command gerekmiyor.

## 5) Vercel Environment Variables

Vercel projesinde Settings > Environment Variables bölümüne aşağıdakileri ekleyin:

| Vercel değişkeni | Firebase config karşılığı |
|---|---|
| `FIREBASE_API_KEY` | `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `FIREBASE_PROJECT_ID` | `projectId` |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `FIREBASE_APP_ID` | `appId` |
| `FIREBASE_MEASUREMENT_ID` | `measurementId` (varsa, opsiyonel) |

En az şu dört alan zorunludur:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`

Environment Variables eklendikten sonra Vercel'de **Redeploy** yapın.

## 6) Firebase Authorized Domains

Vercel size örneğin şu adresi verebilir:

`https://kelime-robotu.vercel.app`

Firebase Console > Authentication > Settings > Authorized domains bölümüne Vercel domaininizi ekleyin:

`kelime-robotu.vercel.app`

Özel alan adı bağlarsanız onu da ayrıca ekleyin.

## 7) Test

Canlı sitede:

1. `Hesap oluştur` seçin.
2. Ad, e-posta ve şifre girin.
3. Birkaç kelime çözün.
4. Çıkış yapın.
5. Başka tarayıcı/cihazdan aynı hesapla giriş yapın.
6. İlerleme aynı görünmelidir.

## Veri yapısı

Her öğrenci için Firestore'da tek bir kullanıcı belgesi tutulur:

```text
users
  └── <firebase uid>
      ├── profile
      │   ├── name
      │   ├── email
      │   ├── createdAt
      │   └── lastActiveAt
      ├── learningState
      │   ├── progress
      │   ├── stats
      │   ├── streak
      │   ├── activity
      │   └── startDate
      ├── schemaVersion
      └── updatedAt
```

`learningState.progress` içinde her kelimenin doğru, yanlış, seviye ve tekrar zamanı tutulur.

## Yerelde Firebase ile test etmek

İsterseniz `firebase-local-config.js` dosyasına Firebase web config değerlerini ekleyebilirsiniz. Bu dosya sadece yerel test kolaylığı içindir. Vercel'de Environment Variables yöntemi önerilir.

Yerel sunucu örneği:

```bash
python3 -m http.server 8080
```

Daha sonra `http://localhost:8080` adresini açın.

Not: Yerelde `/api/firebase-config` Vercel fonksiyonu çalışmaz. Yerelde Firebase kullanacaksanız `firebase-local-config.js` doldurulmalıdır. Sadece misafir modu için doldurmaya gerek yoktur.

## Sonraki sürüm için öneri

Bir sonraki aşamada ayrı bir veli/yönetici rolü eklenebilir. Böylece veli kendi hesabından bağlı öğrencilerin çalışma süresini, başarı yüzdesini ve en çok yanlış yapılan kelimeleri görebilir.

## Firebase proje durumu (07.09.2026)

Web App yapılandırması projeye eklenmiştir (`firebase-local-config.js`). Canlıya almadan önce Firebase Console'da **Email/Password Authentication** etkinleştirilmeli, **Cloud Firestore** oluşturulmalı ve `firestore.rules` yayınlanmalıdır. Vercel alan adı belli olduğunda Authentication → Settings → Authorized domains listesine eklenmelidir.
