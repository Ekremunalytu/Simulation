# Tasarım Sistemi ve Arayüz Kuralları

Bu doküman mevcut arayüz dilini ve yeni ekran/modül eklerken korunması gereken tasarım kararlarını özetler.

## Görsel Yön

Arayüz "Obsidian Observatory" yaklaşımını kullanır:

- koyu, katmanlı yüzeyler
- düşük kontrastlı ama okunaklı arka planlar
- mor ve cyan vurgu renkleri
- teknik laboratuvar hissi
- yoğun border yerine tonal ayrışma

Kaçınılması gerekenler:

- saf beyaz yüzeyler
- düz SaaS kontrol paneli görünümü
- rastgele renk patlamaları
- 1px sert border ağırlıklı kartlar
- öğrenme değerinden bağımsız süs animasyonları

## Tema Tokenları

Token kaynağı [`app/src/index.css`](/Users/ekrem/Desktop/Okul/Simulations/app/src/index.css).

### Surface

| Token | Değer | Kullanım |
|-------|-------|----------|
| `surface-container-lowest` | `#050505` | en koyu alanlar |
| `surface` | `#0a0a0a` | ana sayfa zemini |
| `surface-container-low` | `#0f0f0f` | kart dış yüzeyi |
| `surface-container` | `#161616` | standart panel |
| `surface-container-high` | `#1e1e1e` | hover/aktif katman |
| `surface-container-highest` | `#272727` | güçlü ayrışım gereken yüzey |

### Accent

| Token | Değer | Kullanım |
|-------|-------|----------|
| `primary` | `#d0bcff` | ana vurgu |
| `primary-container` | `#a078ff` | gradient ve CTA |
| `secondary` | `#4cd7f6` | ikincil vurgu |
| `tertiary` | `#ffb869` | uyarı / ara vurgu |

### Typography

| Token | Font | Rol |
|-------|------|-----|
| `font-headline` | Space Grotesk | başlıklar |
| `font-body` | Inter | gövde metni |
| `font-mono` | JetBrains Mono | parametre, metric, kod |

## Layout Yapısı

Uygulama üç parçalı bir shell kullanır:

- sabit sol ikon sidebar
- seçili kategoriye göre açılan secondary sidebar
- üstte sabit top bar

İçerik alanı, secondary sidebar açıkken sola değil sağa kayar; bu yüzden yeni sayfalar `main` margin davranışını bozmayacak şekilde tasarlanmalı.

## Ana Sayfa Kuralları

Ana sayfa iki düzeyli bir giriş sunar:

1. öne çıkan kart
2. modül grid'i

`SimulationCard` davranış kuralları:

- ikon modül kategorisine göre renk tonuna bağlanır
- kartın tamamı tıklanabilir
- açıklama kısa tutulur
- zorluk seviyesi teknik bir etiket olarak gösterilir

Yeni kart tipleri eklenirse aynı yoğunluk korunmalı; ana sayfa katalog, içerik duvarı değil.

## Simülasyon Sayfası Kuralları

Simülasyon sayfasının ana bölümleri:

- başlık ve metadata alanı
- büyük görselleştirme paneli
- playback bar
- metrik ve teori/formül paneli
- çalışma notları
- yönlendirilmiş deneyler
- sağda sticky control panel

Yeni modül ekranları bu düzeni kırmamalı. Modüle özel görselleştirme farklı olabilir ama ortak iskelet korunmalı.

## Etkileşim İlkeleri

### Parametre Düzeni

- panelde önce presetler, sonra kontroller gelir
- slider değeri anlık görünür
- değişiklik hemen sonucu değiştirmez; önce draft oluşur
- kullanıcı `Simülasyonu Çalıştır` ile commit eder

Bu gecikmeli çalışma biçimi özellikle timeline modüllerde bilinçli seçimdir; her slider hareketinde pahalı derive çalıştırılmaz.

### Playback

- timeline varsa görünür, yoksa sayfa boş playback alanı üretmez
- aktif frame etiketi üst bilgi satırında taşınır
- hız değişimi desteklenir
- yeniden başlatma her modülde aynı davranışı vermelidir

Calculus II modüllerinde playback soyut animasyon değil, pedagojik yaklaşım sırasını göstermelidir:

- limitte örnek noktalar yaklaşmalı
- türevde veya kısmi türevde fark oranı küçülmeli
- integral modüllerinde alan/hacim katkıları birikmeli

### Geri Bildirim

- `dirty` durumunda kullanıcıya draft değiştiği açıkça gösterilir
- link kopyalama kısa süreli metin değişimi ile doğrulanır
- panel aç/kapa ve fullscreen kontrolleri ikincil ama görünür tutulur

## Animasyon Kuralları

Framer Motion kullanımı mevcut sistemde üç amaca hizmet eder:

- sayfa/panel girişleri
- sidebar geçişleri
- kart hover ve yüklenme hissi

Kural:

- hareket yönü bilgi mimarisini desteklemeli
- kısa ve kontrollü olmalı
- öğretici içeriğin önüne geçmemeli

## Bileşen Tonları

Ortak panel ailesi:

- `MetricsPanel`
- `FormulaPanel`
- `ExplanationPanel`
- `ExperimentsPanel`
- `ControlPanel`

Bu panellerde ortak desen:

- `bg-surface-container`
- yumuşak radius
- düşük opaklıklı border
- üstte küçük uppercase teknik etiket

`FormulaPanel` bugün iki farklı rol taşır:

- legacy modüllerde tek satır formül yüzeyi
- Calculus II modüllerinde sembol sözlüğü ve türetim akışını içeren genişletilmiş teori yüzeyi

Yeni paneller de aynı ritmi sürdürmeli.

## Responsive Notlar

Uygulama laptop/desktop ağırlıklı. Yine de:

- grid'ler tek kolona düşebilmeli
- üst bar içeriği dar ekranda sıkışmamalı
- kontrol paneli mobilde içerikten kopmamalı

Yeni görselleştirmeler sabit genişliğe kilitlenmemeli; özellikle SVG/canvas alanları kapsayıcıya uyum göstermeli.

## İçerik Dili

Bugünkü arayüzde Türkçe ve İngilizce teknik etiketler birlikte kullanılıyor. Yeni eklerde en azından modül içinde tutarlı kalınmalı; aynı panelde rastgele dil geçişi yapılmamalı.
