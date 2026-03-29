# Simülasyon Motoru ve Veri Akışı

Bu proje klasik anlamda backend içermez. Bu dosya, backend yerine çalışan istemci içi motoru ve veri akışını açıklar.

## Sistem Sınırı

Bilinçli olarak olmayan parçalar:

- auth
- API
- veritabanı
- sunucu tarafı iş mantığı
- deployment bağımlı servisler
- uzak persistence

Buna rağmen uygulama içinde gerçek bir engine katmanı vardır:

- modül keşfi ve kayıt
- katalog filtreleme
- parametre yaşam döngüsü
- derive hesapları
- playback ve kardeş navigasyon
- istemci tarafı persistence
- sayfa seviyesi sonuç cache'i

## Katmanlar

### 1. Registry ve Katalog

`engine/registry.ts` modüllerin tek kayıt noktasıdır. Route katmanı, dashboard ve learning path yüzeyleri modül klasörlerini doğrudan bilmez; registry API'sini kullanır.

Temel sorumluluklar:

- modül kaydı
- tekil modül çözme
- kategori bazlı listeleme
- ilişki bazlı çözümleme (`getModulesByIds`)
- featured/starter öncelikli sıralama

`engine/catalog.ts` ise UI dostu katalog mantığını taşır:

- ders alanı eşleştirmeleri (`courseCategoryMeta`)
- arama normalizasyonu
- dashboard filtreleme
- featured modül seçimi
- difficulty ve runMode etiket üretimi

### 2. Modül Tanımı + Metadata

Her modül üç ana dosyada yaşar:

- `index.ts`: authored modül tanımı
- `logic.ts`: saf hesaplama
- `Visualization.tsx`: React sunumu

Buna ek olarak modülün pedagojik metadata'sı `modules/metadata.ts` içindedir.

Kayıt akışında olanlar:

1. `register.ts` `import.meta.glob('./*/index.ts', { eager: true })` ile authored modülü bulur.
2. `getSimulationModuleMetadata(module.id)` ile metadata merge edilir.
3. Önkoşul ve sonraki modül id'leri geçerli kayıtlarla filtrelenir.

Bu ayrım önemlidir:

- `logic.ts`: testlenebilir, framework bağımsız
- `Visualization.tsx`: render davranışı
- `index.ts`: kontrol şeması, presetler, opsiyonel teori, opsiyonel kod örneği
- `metadata.ts`: öğrenme yolu ve ders bağlamı

### 3. Parametre Orkestrasyonu

`useSimulationParams` istemci içi state makinesidir.

Başlangıç önceliği:

1. URL query
2. `localStorage`
3. `defaultParams`

Bugünkü model manuel submit değil, otomatik senkron modelidir:

- kullanıcı `draftParams` üstünde çalışır
- hook `300ms` debounce sonrası `committedParams` üretir
- query string otomatik güncellenir
- `localStorage` otomatik güncellenir
- UI bu geçişi `syncState` ile izler

Persist edilen bilgiler:

- `committedParams`
- `panelOpen`

Persist edilmeyen bilgiler:

- `selectedPresetName`
- `draftParams`
- playback frame'i
- fullscreen durumu
- geçici UI geri bildirimleri

`selectedPresetName` bugün storage'dan okunmaz; her render'da mevcut parametrelerle preset eşleşmesi üzerinden türetilir. Reset davranışı için kullanılan `lastPresetName` ise yalnızca hook içi bellek durumudur.

### 4. Derive Katmanı

Her modülün ana API'si `derive(params)` fonksiyonudur.

Beklenen özellikler:

- UI'dan bağımsız çalışma
- deterministik ya da tekrar üretilebilir davranış
- tek çağrıda görsel ve açıklayıcı tüm sonucu üretme
- ortak panel yüzeylerini besleyecek kadar zengin veri döndürme

Pratikte `derive()` şunları üretir:

- `learning`
- `metrics`
- `experiments`
- opsiyonel `timeline`
- modüle özel görselleştirme verisi

Ortak pedagojik metadata ise `derive()` dışında kalır:

- `learningObjectives`
- `prerequisiteModuleIds`
- `nextModuleIds`
- `conceptTags`
- `estimatedMinutes`
- opsiyonel `syllabusWeeks`
- opsiyonel `checkpointQuestions`
- opsiyonel `challengeScenarios`
- opsiyonel `featured`
- opsiyonel `recommendedStarter`

Teori/formül anlatımı da derive sonucunda değil, modül tanımındaki `theory` veya `formulaTeX` alanında taşınır.

### 5. Sayfa Seviyesi Runtime

`SimulationPage` derive sonucunu doğrudan her render'da çöpe atmaz. `simulationResultCache` isimli bir `Map`, sonucu `moduleId + committedQuery` anahtarıyla sayfa oturumu boyunca saklar.

Bu katman ayrıca:

- `useSimulationPlayback` ile runtime üretir
- `useSimulationNavigation` ile aynı kategoride prev/next modülleri çözer
- sonucu visualization bileşenine `params`, `result`, `runtime` olarak geçirir

## URL ve Persistence Sözleşmesi

Committed parametreler query string'e düz anahtar/değer olarak yazılır:

```text
/sim/gradient-descent?learningRate=0.05&iterations=100&momentum=false
```

Bunun sonucu:

- senaryo linki paylaşılabilir
- sayfa yenilendiğinde aynı konfigürasyon geri gelir
- derive sonucu cache anahtarı sabit kalır

Storage anahtarı formatı:

```text
obsidian-lab:<moduleId>
```

Storage payload'ı preset adı taşımaz; yalnızca gerçekten geri dönüldüğünde anlamlı olan committed parametreler ve drawer durumu tutulur.

## Playback Tasarımı

Sistem hem `instant` hem `timeline` modlarını taşır.

`useSimulationPlayback` modülden bağımsız olarak şunları çözer:

- zamanlayıcı
- frame sınırları
- hız çarpanı
- restart davranışı
- opsiyonel başlangıç frame'i

Önemli ayrıntılar:

- `initialFrameIndex` desteklenir
- `play()` sona gelinmişse ilk anlamlı frame'den yeniden başlatır
- `resetKey` değiştiğinde reducer resetlenir
- `0.5x`, `1x`, `2x` dışında hız yoktur

Modül tarafının yükümlülüğü:

- anlamlı bir `timeline.frames` listesi döndürmek
- gerekiyorsa `timeline.initialFrameIndex` belirlemek

Bu özellikle sweep veya senaryo odaklı modüllerde kritik:

- fairness threshold akışı
- symbolic calculus adımları
- search / planning reasoning zincirleri
- dynamic programming iterasyonları

## Hata İzolasyonu

`SimulationErrorBoundary` modül bazlı render hatalarını tüm uygulamaya yaymadan sınırlar.

Bu önemli çünkü:

- modüller bağımsız geliştirilir
- visualization bileşenleri lazy-loaded'dır
- deneysel modül davranışları tüm shell'i düşürmemelidir

## Lazy Loading ve Build

Görselleştirme bileşenleri modül bazında lazy yüklenir. `SimulationPage` bunu `Suspense` fallback'i ile tamamlar.

Amaç:

- dashboard ilk yükünü korumak
- modül sayısı artsa da ana shell'i hafif tutmak
- büyük visualization paketlerini route bazlı değil modül bazlı bölmek

Build tarafında `vite.config.ts` içindeki `manualChunks` ayarıyla büyük bağımlılıklar ayrılır:

- `react`
- `react-dom`
- `react-router-dom`
- `recharts`
- `framer-motion`
- kalan vendor kodu

## Shared Yardımcılar

`modules/shared/` altı artık sadece calculus fonksiyonlarından ibaret değil.

Başlıca yardımcı aileler:

- `calculus.ts`: numerik ve analitik calculus yardımcıları
- `dynamic-programming.ts`: value/policy iteration benzeri modüller için ortak işlevler
- `search-grid.ts`: grid tabanlı search görselleştirmeleri
- `ml-datasets.ts`: bazı ML modüllerinde tekrar kullanılan örnek veri setleri
- `random.ts`: seeded random ile tekrar üretilebilir senaryolar
- `DynamicProgrammingVisualization.tsx`: DP ailesi için ortak UI parçaları

Prensip değişmiyor: ortak mantık React'tan ayrı tutulur, tekrar eden hesap merkezi yardımcıya taşınır.

## Test Stratejisi

Bugünkü test katmanları:

- her modül için `logic.test.ts`
- `register.test.ts`
- `Dashboard.test.tsx`
- `SimulationPage.test.tsx`
- `TopBar.test.tsx`
- `ControlPanel.test.tsx`
- `useSimulationParams.test.tsx`
- ek olarak `svm-margin-explorer/Visualization.test.tsx`

Testlerin odaklandığı davranış türleri:

- derive çıktısının boş veya çelişkili olmaması
- aynı parametrelerle tekrar üretilebilir sonuç
- playback ve page sekme akışının ortak contract'ı bozup bozmaması
- URL ve storage öncelik kuralları
- katalog arama ve hızlı arama davranışı
- registry kayıt ve metadata merge akışı

Bugünkü repo durumunda:

- 51 modül metadata ile kayıtlı
- 51 modülün tamamında derive seviyesi test var
- shell, dashboard ve sayfa akışı için ayrı UI testleri var

## Genişletme Kuralları

Yeni bir şey eklerken şu çizgiyi koru:

- simülasyon mantığı React component'ine taşınmamalı
- registry dışına paralel modül keşif mekanizması kurulmamalı
- route katmanı modül detayını bilmemeli
- persistence hafif ve yerel kalmalı
- metadata ile derive sonucu çelişmemeli
- playback kullanan modüllerde ilk frame, özet ve metrikler aynı pedagojik anı göstermeli

Bu proje için "backend" dediğimiz şey, istemci içindeki bu motor akışıdır. Karmaşıklık eklemeden önce her zaman şu soruyu sor: gerçekten ortak engine ihtiyacı mı var, yoksa bu bilgi modülün `logic.ts` içinde mi kalmalı?
