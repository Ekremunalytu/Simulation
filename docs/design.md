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
| `surface` | `#070708` | ana sayfa zemini |
| `surface-container-lowest` | `#0a0a0b` | en koyu alanlar |
| `surface-container-low` | `#101012` | kart dış yüzeyi |
| `surface-container` | `#151518` | standart panel |
| `surface-container-high` | `#1b1b1f` | hover/aktif katman |
| `surface-container-highest` | `#24242a` | güçlü ayrışım gereken yüzey |

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

Uygulama sadeleştirilmiş bir shell kullanır:

- solda tek, genişleyebilen sidebar
- üstte kompakt top bar
- içerikte tam genişlikli çalışma alanı

Sidebar açıkken içerik alanı sağa kayar, ancak ikinci bir navigasyon sütunu olmadığı için simülasyon alanı gereksiz yatay kayıp yaşamaz.

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

- kompakt başlık ve meta chip alanı
- büyük görselleştirme paneli
- playback bar
- görselleştirme üstünde kritik metrik overlay'leri
- altta `Analiz` ve `Öğrenme` sekmeleri
- sağda sabit sütun yerine açılır kontrol drawer'ı

Yeni modül ekranları bu düzeni kırmamalı. Modüle özel görselleştirme farklı olabilir ama ortak iskelet korunmalı.

## Etkileşim İlkeleri

### Parametre Düzeni

- panelde önce presetler, sonra kontroller gelir
- slider değeri anlık görünür
- değişiklikler `300ms` debounce ile otomatik commit edilir
- kullanıcı ayrı bir `Simülasyonu Çalıştır` adımı beklemez
- URL ve local state otomatik senkron kalır

### Playback

- timeline varsa görünür, yoksa sayfa boş playback alanı üretmez
- aktif frame etiketi üst bilgi satırında taşınır
- hız değişimi desteklenir
- yeniden başlatma her modülde aynı davranışı vermelidir

Calculus II modüllerinde playback soyut animasyon değil, pedagojik yaklaşım sırasını göstermelidir:

- limitte örnek noktalar yaklaşmalı
- türevde veya kısmi türevde fark oranı küçülmeli
- integral modüllerinde alan/hacim katkıları birikmeli
- vektör alanlarında akış çizgisi adım adım açılmalı
- sembolik çözüm modüllerinde işlem zinciri sırayla görünmeli

### Geri Bildirim

- senkron durumu `Hazır` / `Güncelleniyor` diliyle gösterilir
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
- daha kontrollü radius (`12-18px` bandı)
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
- kontrol drawer'ı dar ekranda görünür ve kapatılabilir kalmalı

Yeni görselleştirmeler sabit genişliğe kilitlenmemeli; özellikle SVG/canvas alanları kapsayıcıya uyum göstermeli.

Önemli layout kuralları:

- iki satırlı analiz panellerinde `grid-rows-[minmax(0,...)]` kullanılmalı
- scroll gereken iç alanlar kartı büyütmek yerine kart içinde scroll etmelidir
- büyük ağaç/ızgara/SVG görselleri mümkünse ölçeklenerek okunmaz hale gelmek yerine sabit boyut + scroll veya güvenli `viewBox` yaklaşımı kullanmalıdır
- node-edge tabanlı yoğun görsellerde bir ana sahne + bir veya iki yardımcı panel düzeni tercih edilmeli; aynı yüzeye hem chart hem graph hem trace bindirilmemelidir
- graph coloring, Bayesian network ve game tree gibi modüllerde aktif düğüm/kenar vurgusu renk tonu ve glow ile yapılmalı; kalın sert border yığılması kullanılmamalıdır

## İçerik Dili

Bugünkü arayüzde Türkçe ve İngilizce teknik etiketler birlikte kullanılıyor. Yeni eklerde en azından modül içinde tutarlı kalınmalı; aynı panelde rastgele dil geçişi yapılmamalı.

Yeni AI modüllerinde pratik stil şudur:

- panel başlıkları ve açıklamalar Türkçe kalır
- teknik terimler gerektiğinde İngilizce bırakılır: `forward checking`, `posterior`, `rollout`, `win rate`
- aynı modülde bir kavram ilk geçtiğinde açıklama Türkçe, kısa etiket İngilizce olabilir
