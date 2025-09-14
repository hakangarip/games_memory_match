# Google Play Yayın Rehberi (Memory Match)

Bu proje Capacitor + Phaser tabanlıdır. Aşağıdaki adımlar ile imzalı AAB üretip Google Play Console'a yükleyebilirsiniz.

## 1) Ön Gereksinimler
- Android Studio kurulu (JDK 17 içeren sürüm)
- Google Play Console geliştirici hesabı
- AdMob hesabı (uygulama içinde reklam kullanıyorsanız)

## 2) Sürüm Numarası
`source/android/app/build.gradle` içindeki:
- `versionCode` (her yayında +1 artırın)
- `versionName` (örn. 1.0.1)

## 3) Yayın Anahtarı (Upload Key) Oluşturma
Windows PowerShell'de (Java yüklü olmalı):

```
keytool -genkeypair -v -keystore upload-key.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000 -storepass YOUR_PASS -keypass YOUR_PASS -dname "CN=YourName, OU=Dev, O=YourCompany, L=City, S=State, C=TR"
```

Dosyayı `source/android/` klasörüne koyabilirsiniz.

## 4) keystore.properties dosyası
`source/android/keystore.properties.example` dosyasını kopyalayıp aynı klasörde `keystore.properties` olarak düzenleyin:

```
storeFile=../upload-key.jks
storePassword=YOUR_PASS
keyAlias=upload
keyPassword=YOUR_PASS
```

> Güvenlik: Bu dosyayı repo'ya asla commit etmeyin.

## 5) AAB (Release) Derleme
Proje kökünde (source klasörü içinde) çalıştırın:

```
npm run android:aab
```

Çıktı dosyası:
- `source/android/app/build/outputs/bundle/release/app-release.aab`

APK isterseniz:

```
npm run android:apk
```

## 6) Google Play Console
- Yeni bir uygulama oluşturun (Paket adı: `dev.hakangarip.memorymatch`)
- Uygulama ayrıntıları: Başlık, kısa/açıklama, kategori: Games > Puzzle
- Gizlilik Politikası URL'si ekleyin (reklam kullanıldığı için gerekli)
- Veri Güvenliği (Data Safety): AdMob nedeniyle reklam kimlikleri toplandığını beyan edin.
- Hedef Kitle (Target Audience) ve içerik derecelendirme anketlerini doldurun.
- Uygulama içi reklamlar var mı? Evet.
- Mağaza görselleri: 
  - 512x512 ikon (PNG, saydam olmayan), 
  - 1024x500 feature graphic, 
  - En az 2 telefon ekran görüntüsü (1080x1920 önerilir)

## 7) İmzalama ve Yükleme
- Play App Signing'i etkinleştirmeniz önerilir (varsayılan). Siz AAB'yi kendi upload anahtarınızla imzalarsınız, Google üretim anahtarını saklar.
- `app-release.aab` dosyasını iç test (Internal testing) kanalına yükleyin.
- Testçiler ekleyin, kurulum yapıp kontrol edin.
- Sorun yoksa Prodüksiyon'a tanıtın (Promote to production).

## 8) Reklam (AdMob) Notları
- `AndroidManifest.xml` içinde `com.google.android.gms.ads.APPLICATION_ID` `@string/admob_app_id` ile ayarlı.
- `res/values/strings.xml` içindeki `admob_app_id` değerini prod ile güncellediniz (bu projede güncel).
- Play Console'da "Ads" bölümünde uygulamanın reklam içerdiğini işaretleyin.

## 9) Sık Karşılaşılan Hatalar
- JDK hatası: Android Studio JBR kullanın ya da JAVA_HOME=Android Studio\jbr
- Target SDK: Proje zaten 35, Play gereksinimini karşılar.
- İmzalama yok: `keystore.properties` oluşturulmadıysa release imzalama devre dışı kalır. Yükleme için imzalama gerekir.

## 10) Yeni Sürüm Yayınlama
- `versionCode` +1, `versionName` güncelle
- `npm run android:aab`
- Play Console'a yükle, sürüm notu ekle, yayınla.

İyi yayınlar!
