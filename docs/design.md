# Tasarım Sistemi ve Arayüz Kuralları

Bu doküman mevcut UI dilini özetler. Yeni ekran veya modül eklerken görsel yönü korumak için referans metindir.

## Görsel Yön

Arayüz hâlâ "Obsidian Observatory" çizgisinde:

- koyu ve katmanlı yüzeyler
- mor + cyan vurgu sistemi
- teknik laboratuvar hissi
- sert border yerine tonal ayrışma
- büyük boşluklar ve yumuşak glow'lar

Kaçınılması gerekenler:

- saf beyaz yüzeyler
- açık gri SaaS panel estetiği
- 1px border yığını
- rastgele renk kullanımı
- pedagojik akışa hizmet etmeyen animasyon

## Tema Tokenları

Token kaynağı `app/src/index.css`.

### Surface

| Token | Değer | Kullanım |
|-------|-------|----------|
| `surface` | `#070708` | ana zemin |
| `surface-dim` | `#040405` | en koyu gölge alanları |
| `surface-bright` | `#242428` | nadir parlak ayrışım |
| `surface-container-lowest` | `#0a0a0b` | görselleştirme kuyuları |
| `surface-container-low` | `#101012` | düşük yükseltili katman |
| `surface-container` | `#151518` | standart panel |
| `surface-container-high` | `#1b1b1f` | hover/aktif katman |
| `surface-container-highest` | `#24242a` | en belirgin ayrım |

### Accent

| Token | Değer | Kullanım |
|-------|-------|----------|
| `primary` | `#d0bcff` | ana CTA ve starter vurguları |
| `primary-container` | `#a078ff` | gradient uç tonu |
| `secondary` | `#4cd7f6` | ikincil vurgu ve aktif navigasyon |
| `tertiary` | `#ffb869` | matematik / uyarı aksanı |

### Typography

| Token | Font | Rol |
|-------|------|-----|
| `font-headline` | Space Grotesk | başlıklar |
| `font-body` | Inter | gövde metni |
| `font-mono` | JetBrains Mono | metrikler, chip'ler, kısa teknik etiketler |

## Yardımcı Yüzey Sınıfları

`index.css` içindeki pratik yardımcılar:

- `glass`: sidebar ve drawer gibi yüzen yüzeyler
- `surface-card`: büyük ana kartlar
- `surface-panel`: alt panel ailesi
- `ghost-outline`: ince tonal kontur
- `eyebrow`: küçük uppercase teknik etiket
- `focus-ring`: ortak focus ve transition davranışı
- `tonal-rule`: sert border yerine kullanılan yatay ayrım çizgisi

Yeni bileşen mümkünse bu sınıflarla kurulmalı; her panel için yeni shadow dili icat edilmemeli.

## Layout Yapısı

Bugünkü shell üç parçalıdır:

- solda 88px ikon rail
- seçili ders varsa açılan yaklaşık 228px secondary sidebar
- üstte sabit top bar

Ana içerik sabit genişlikli bir kolon değil, bu offset'lere göre sola yaslanan geniş bir çalışma alanıdır. Secondary sidebar kapalıyken içerik `96px`, açıkken `304px` soldan başlar.

Bu yüzden tasarım kuralı artık "tek sidebar" değil:

- navigasyon solda kalır
- içerik yatayda boğulmaz
- asıl yoğunluk büyük içerik kartlarında taşınır

## Navigasyon Kuralları

### Icon Sidebar

- ana sayfa ve ders alanları için birincil giriş noktasıdır
- aktif ders cyan tonuyla işaretlenir
- marka butonu ve dashboard butonu mor aksan taşır
- settings ikonu bugün görsel placeholder'dır; ana akışa girmemelidir

### Secondary Sidebar

- yalnızca bir ders alanı seçildiğinde açılır
- kart listesi basit, hızlı ve taranabilir kalmalıdır
- aktif modül cyan tonlu dolgu ile ayrışır
- ders açıklaması ve modül sayısı header'da görünür

### Top Bar

- sağ tarafta hızlı modül araması taşır
- arama sonucu küçük bir komut paleti gibi davranır
- ok tuşları, `Enter` ve `Escape` desteklenir
- boş durumda gereksiz chrome üretmez

## Dashboard Kuralları

Ana sayfa iki bloktan oluşur:

1. başlık + öne çıkan modül kartı
2. filtrelenebilir katalog yüzeyi

Öne çıkan kart için kurallar:

- katalogdan kopuk özel bir layout değil, aynı görsel aile içinde olmalı
- ders, zorluk, akış tipi ve süre net görünmeli
- ana CTA tek ve belirgin olmalı

Katalog yüzeyi için kurallar:

- arama, ders, zorluk ve akış filtreleri aynı satır ailesinde kalmalı
- aktif filtreler chip olarak görünmeli
- "starter only" durumu ayrı bir toggle diliyle ayrışmalı
- boş sonuç ekranı cezalandırıcı değil yönlendirici olmalı

`SimulationCard` kuralları:

- kartın tamamı tıklanabilir
- kategori chip'i her zaman ilk okunur katmanda yer alır
- starter modül ise ayrı badge görünür
- alt kısımda zorluk, akış ve süre birlikte taşınır

## Simülasyon Sayfası Kuralları

Bugünkü simülasyon sayfası sırası:

1. üst meta chip alanı + modül başlığı
2. kategori içi önceki/sonraki modül navigasyonu
3. büyük görselleştirme kartı
4. varsa playback bar
5. ilk üç metriğin overlay kartları
6. `LearningPathPanel`
7. `Analiz` / `Öğrenme` sekmeleri
8. sağdan açılan control drawer

### Görselleştirme Kartı

- ana sahne mümkün olduğunca tam genişlikli hissedilmeli
- görselleştirme kuyusu `surface-container-lowest` tonu içinde oturmalı
- metrik overlay en fazla ilk üç metriği göstermeli
- timeline etiketi başlık satırında görünmeli

### Analysis Tab

- `MetricsPanel` ilk satırda olmalı
- modülde `theory` veya `formulaTeX` varsa `FormulaPanel` ikinci ana yüzeydir
- bu sekme açıklama metni duvarına dönüşmemeli

### Learning Tab

- `ExplanationPanel` ve `ExperimentsPanel` tabanın omurgasıdır
- metadata varsa `CheckpointPanel` ve `ChallengePanel` eklenir
- `codeExample` varsa kendi kartında gelir

### Learning Path Panel

- sekmelerden önce gelir
- önkoşul, sıradaki modül, öğrenme hedefi ve kavram etiketlerini tek yerde toplar
- hafta bilgisi varsa chip olarak görünür

### Control Drawer

- sağdan overlay olarak açılır; sabit sağ sütun kullanılmaz
- drawer kapalıyken görselleştirme tam alanı korur
- `Escape` ile kapanabilir
- presetler her zaman parametre kontrollerinden önce gelir

### Fullscreen

- görselleştirme ayrı bir overlay yüzeyde büyür
- playback varsa fullscreen modda da korunur
- dış arka plana tıklama ve `Escape` ile kapanma tutarlı olmalıdır

## Etkileşim İlkeleri

### Parametre Akışı

- kullanıcı ayrı bir "çalıştır" butonu beklemez
- değişiklikler `300ms` debounce ile commit edilir
- `Hazır` / `Güncelleniyor` dili kısa ve teknik kalır
- preset seçimi hızlı senaryo geçişi gibi davranmalıdır
- reset butonu bağlamsal preset mantığını bozmadan çalışmalıdır

### Playback

- sadece `timeline` modüllerinde görünür
- hız seçenekleri sınırlı ve tutarlı kalmalıdır
- ilk açılış frame'i modülün pedagojik niyetini bozmayacak şekilde seçilmelidir
- kullanıcı sona geldiyse tekrar oynatmada akış mantıklı yerden yeniden başlamalıdır

### Kısayollar ve Navigation

- hızlı aramada ok tuşları ve `Enter` desteklenir
- simülasyon sayfasında `Alt + ArrowLeft/Right` kategori içi modül geçişi yapar
- `Escape` önce fullscreen'i, sonra drawer'ı kapatır

## Animasyon Kuralları

Framer Motion kullanımı şu alanlarda yoğunlaşır:

- sidebar açılıp kapanması
- kart girişleri
- sekme geçişleri
- drawer ve fullscreen overlay

Kurallar:

- hareket bilgi mimarisini anlatmalı
- süreler kısa kalmalı
- parallax veya ağır spring yığılmamalı
- `MotionConfig reducedMotion="user"` kararına uyulmalı

## Bileşen Tonları

Ortak panel ailesi:

- `MetricsPanel`
- `FormulaPanel`
- `ExplanationPanel`
- `ExperimentsPanel`
- `ControlPanel`
- `LearningPathPanel`
- `CheckpointPanel`
- `ChallengePanel`

Ortak ton:

- koyu tonal yüzey
- 16-24px arası radius
- sert border yerine inset shadow
- küçük uppercase üst etiket

Özel notlar:

- `CheckpointPanel` geri bildirimi renk tonu ile verir, kart yüksekliği zıplamamalı
- `ChallengePanel` preset badge'lerini kısa tutmalı
- `ControlPanel` slider/toggle/select yüzeyleri aynı ritimde görünmeli
- `FormulaPanel` legacy tek formül ve yapılandırılmış teori modlarını aynı ailede taşımalıdır

## Responsive Notlar

Uygulama laptop/desktop ağırlıklı ama dar genişlikte de çalışmalıdır:

- dashboard grid'i tek kolona düşebilmelidir
- top bar araması dar alanda kaybolur; bu kabul edilen davranıştır
- control drawer `max-w-[calc(100vw-2rem)]` sınırında kalmalıdır
- fullscreen görselleştirme yatay taşma üretmemelidir

Yoğun SVG/chart/grid modülleri için:

- dış kartı büyütmek yerine iç scroll kullan
- `min-h-0` ve `min-w-0` zincirini kırma
- okunabilirliği korumak için gerektiğinde sabit sahne + scroll tercih et
- büyük graph veya grid yüzeylerinde aynı karta birden fazla ana odak bindirme

## İçerik Dili

Arayüz dili ağırlıklı olarak Türkçe, teknik terimler gerektiğinde İngilizce kalabilir.

Tutarlılık kuralları:

- panel başlıkları Türkçe kalmalı
- kavram etiketi veya algoritma adı İngilizce olabilir
- aynı kart içinde rastgele dil sıçraması yapılmamalı
- bir kavram ilk kez geçtiğinde açıklama Türkçe, kısa etiket İngilizce olabilir
