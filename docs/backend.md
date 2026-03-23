# Simülasyon Motoru ve Veri Akışı

Bu proje klasik anlamda bir backend içermez. Bu dosya, backend yerine çalışan istemci içi veri akışını ve simülasyon motoru sorumluluklarını açıklar.

## Sistem Sınırı

Bilinçli olarak olmayan parçalar:

- auth
- API
- veritabanı
- sunucu tarafı iş mantığı
- uzak persistence

Buna karşılık uygulama içinde gerçek bir "engine layer" vardır:

- modül registry
- parametre yaşam döngüsü
- derive hesapları
- timeline oynatma
- istemci tarafı persistence

## Katmanlar

### 1. Registry

Registry, modül keşfini çözer. Route katmanı veya dashboard, modül klasörlerini doğrudan bilmez; yalnızca registry API'sini kullanır.

Sorumluluklar:

- modül kaydı
- tekil modül çözme
- kategori bazlı listeleme

### 2. Modül Tanımı

Her modül `index.ts` içinde metadata ve entegrasyon sözleşmesini, `logic.ts` içinde saf hesaplamayı, `Visualization.tsx` içinde ise render davranışını taşır.

Bu ayrım kritik:

- `logic.ts`: testlenebilir, framework bağımsız
- `Visualization.tsx`: React ve çizim kütüphaneleriyle ilgilenir
- `index.ts`: kontrol şeması, presetler, açıklayıcı metadata

### 3. Parametre Orkestrasyonu

`useSimulationParams` modülün istemci içi state makinesidir.

Öncelik sırası:

1. URL query
2. `localStorage`
3. `defaultParams`

Bu tercih iki kullanım senaryosunu aynı anda çözer:

- paylaşılabilir link
- kullanıcı geri döndüğünde son çalışan senaryoyu sürdürme

### 4. Derive Katmanı

Her modülün ana API'si `derive(params)` fonksiyonudur.

Beklenen özellikler:

- saf veya en azından deterministik davranış
- UI'dan bağımsız çalışma
- tek çağrıda tam sonucu döndürme
- panel bileşenlerinin ihtiyaç duyduğu tüm türetilmiş veriyi sağlama

Pratikte `derive()` şu alanları üretir:

- öğrenme kartları için `learning`
- özet ölçümler için `metrics`
- kullanıcı yönlendirmesi için `experiments`
- adım adım oynatma için opsiyonel `timeline`
- modüle özgü görselleştirme verileri

## Persistence Stratejisi

Persist edilen bilgiler:

- committed parametreler
- seçili preset adı
- sağ panelin açık/kapalı durumu

Persist edilmeyen bilgiler:

- draft state
- playback frame'i
- fullscreen durumu
- geçici UI geri bildirimleri

Bu seçim doğru çünkü yalnızca tekrar girişte anlamlı olan durumlar saklanıyor.

## URL Sözleşmesi

Her committed parametre query string'e düz olarak yazılır:

```text
/sim/gradient-descent?learningRate=0.05&iterations=100&momentum=false
```

Bunun sonucu:

- senaryo linki kopyalanabilir
- sayfa yenilendiğinde aynı konfigürasyon geri gelir
- modül state'i inspect etmek kolaylaşır

## Playback Tasarımı

Tüm mevcut modüller `timeline` modunda çalışıyor. Bu, her derive sonucunun kullanıcıya adım adım gösterilebilir bir hikâye taşıdığı anlamına geliyor.

Playback katmanı şunları modülden bağımsız biçimde çözer:

- zamanlayıcı
- frame sınırı
- hız çarpanı
- reset davranışı

Modül tarafının tek yükümlülüğü anlamlı bir `timeline.frames` listesi döndürmek.

## Hata İzolasyonu

[`app/src/components/simulation/SimulationErrorBoundary.tsx`](/Users/ekrem/Desktop/Okul/Simulations/app/src/components/simulation/SimulationErrorBoundary.tsx) görselleştirme veya panel katmanında oluşan hataları tüm uygulamaya yaymadan izole eder.

Bu özellikle önemli çünkü:

- modüller birbirinden bağımsız geliştirilir
- lazy-loaded visualization bileşenleri ayrı hata yüzeyleri oluşturur
- deneysel modüller tüm uygulamayı düşürmemelidir

## Lazy Loading Stratejisi

Mevcut modüllerin tamamı `Visualization.tsx` bileşenlerini `lazy()` ile yüklüyor. Bu tercih:

- ilk yükleme maliyetini azaltır
- modül sayısı arttıkça dashboard açılışını korur
- route bazlı değil, bileşen bazlı parçalama sağlar

`SimulationPage` bu davranışı `Suspense` fallback'i ile tamamlar.

## Test Stratejisi

Bugün kullanılan test katmanları:

- `logic.test.ts`: modül hesaplarının deterministik ve tutarlı olması
- `useSimulationParams.test.tsx`: URL ve storage öncelik kuralları
- `SimulationPage.test.tsx`: ortak sayfa panelleri ve playback entegrasyonu
- `ControlPanel.test.tsx`: kontrol etkileşimleri

Yeni modüllerde en az derive seviyesi test beklenmelidir.

## Genişletme Kuralları

Yeni bir sistem eklerken şu çizgiyi koru:

- simülasyon hesabı React component'ine taşınmamalı
- route katmanı modül detaylarını bilmemeli
- persistence isteğe bağlı ve hafif kalmalı
- modül çıktısı ortak panelleri besleyecek kadar zengin olmalı
- global store sadece gerçek paylaşılmış state ihtiyacı doğarsa düşünülmeli

Bu proje için doğru mimari, mümkün olan en küçük ama tutarlı iç platformdur.
