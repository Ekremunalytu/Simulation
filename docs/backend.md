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
- `index.ts`: kontrol şeması, presetler, açıklayıcı metadata, opsiyonel `theory` içeriği

### 3. Parametre Orkestrasyonu

`useSimulationParams` modülün istemci içi state makinesidir.

Öncelik sırası:

1. URL query
2. `localStorage`
3. `defaultParams`

Bu tercih iki kullanım senaryosunu aynı anda çözer:

- paylaşılabilir link
- kullanıcı geri döndüğünde son çalışan senaryoyu sürdürme

Bugünkü model manuel commit değil, otomatik senkron modelidir:

- kullanıcı draft değeri değiştirir
- hook `300ms` debounce sonrası committed state'i günceller
- aynı anda URL ve `localStorage` senkronize edilir
- UI tarafı bu akışı `syncState` ile izler

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

Modül metadata yüzeyi ise `derive()` dışında kalan ama sayfa seviyesinde ortak render edilen pedagojik içeriği taşır:

- `learningObjectives`
- `prerequisiteModuleIds`
- `nextModuleIds`
- `conceptTags`
- `estimatedMinutes`
- opsiyonel `syllabusWeeks`
- opsiyonel `checkpointQuestions`
- opsiyonel `challengeScenarios`

Yeni AI modüllerinde bu "modüle özgü veri" yüzeyi daha zengin kullanılmaktadır. Örnek olarak:

- `constraint-satisfaction-playground`: domain snapshot'ları, conflict kayıtları, pruning ve backtrack sayaçları
- `bayesian-network-inference`: prior/posterior tabloları, evidence seti ve influence path özetleri
- `mcts-game-lab`: candidate move listesi, visit/win-rate verileri ve rollout trace'i

Teori/formül anlatımı ise `derive()` yerine modül metadata'sındaki `theory` alanında yaşar. Bu alan özellikle Calculus II paketinde:

- ana formül
- sembol sözlüğü
- türetim adımları
- yorum
- sık hatalar

bilgilerini ortak panelde göstermek için kullanılır.

## Persistence Stratejisi

Persist edilen bilgiler:

- committed parametreler
- seçili preset adı
- kontrol drawer'ının açık/kapalı durumu

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

Sistem hem `instant` hem `timeline` modlarını taşır. `timeline` seçildiğinde derive sonucu kullanıcıya adım adım gösterilebilir bir hikâye de taşımak zorundadır.

Playback katmanı şunları modülden bağımsız biçimde çözer:

- zamanlayıcı
- frame sınırı
- hız çarpanı
- reset davranışı
- opsiyonel başlangıç frame'i

Modül tarafının temel yükümlülüğü anlamlı bir `timeline.frames` listesi döndürmektir. Gerekirse `timeline.initialFrameIndex` ile ilk açılışta hangi frame'in gösterileceği de belirtilebilir. Bu özellikle threshold sweep gibi "orta noktadan başlama" ihtiyacı olan modüller için kullanılır.

Calculus II modüllerinde bu yaklaşım örnekleri:

- limitte soldan/sağdan yaklaşım adımları
- türevde `h -> 0`
- Riemann toplamlarında dikdörtgen sayısının artması
- kısmi türevlerde fark oranlarının küçülmesi
- çift katlı integralde hücre bazlı hacim birikimi
- integral tekniklerinde sembolik çözüm adımları
- parametrik eğrilerde `t` boyunca hareket
- yay uzunluğunda segment sayısının artması
- improper integrallerde cutoff yaklaşımı
- vektör alanlarında streamline'ın frame frame açılması ve seçili vektörün birlikte güncellenmesi
- dikdörtgensel olmayan bölgelerde hücre maskesiyle alan yaklaşımı

AI tarafında aynı playback sözleşmesi artık şu tip akışları da taşır:

- knowledge representation ve expert system modüllerinde rule firing / proof chain ilerlemesi
- CSP modüllerinde variable selection, domain pruning, conflict ve backtrack olayları
- Bayesian network modüllerinde prior → evidence → posterior yorum akışı
- MCTS modüllerinde rollout ve move selection özeti

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

Build tarafında buna ek olarak [`app/vite.config.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/vite.config.ts) içinde `manualChunks` kullanılır. `react`, `react-router-dom`, `recharts`, `framer-motion` ve kalan vendor paketleri ayrıştırılarak tek büyük giriş chunk'ının şişmesi engellenir.

## Görselleştirme Yerleşim Kuralları

Bazı modüller yoğun grid, SVG veya iki satırlı analiz kartları taşır. Bu yüzden görsel katmanda şu kurallar geçerlidir:

- panel içi satır oranları `fr` yerine `minmax(0, …fr)` ile tanımlanmalıdır
- scroll gereken iç liste/ızgara alanı dış kartın yüksekliğini büyütmemelidir
- `ResponsiveContainer` kullanılan chart kartlarında ara kapsayıcı `min-h-0` taşımalıdır
- büyük oyun ağacı veya rota haritası gibi SVG tabanlı görseller gerektiğinde iç scroll veya dinamik `viewBox` ile korunmalıdır

## Shared Hesap Yardımcıları

Modüller arası ortak matematiksel yardımcılar [`app/src/modules/shared/calculus.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/shared/calculus.ts) altında tutulur.

Buradaki amaç:

- tekrar eden fonksiyon tanımlarını merkezileştirmek
- testlenebilir yardımcıları UI'dan ayrı tutmak
- Calculus II modüllerinde aynı fonksiyon ailesini tutarlı kullanmak

AI tarafında ise deterministik simülasyon ihtiyacı için [`app/src/modules/shared/random.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/shared/random.ts) kullanılır. Özellikle `mcts-game-lab` gibi örneklemeli görünen modüller burada seeded random ile tekrar üretilebilir hale getirilir; böylece `logic.test.ts` seviyesinde kararlı beklentiler yazılabilir.

## Test Stratejisi

Bugün kullanılan test katmanları:

- `logic.test.ts`: modül hesaplarının deterministik ve tutarlı olması
- `useSimulationParams.test.tsx`: URL ve storage öncelik kuralları
- `SimulationPage.test.tsx`: ortak sayfa panelleri, sekmeler ve playback entegrasyonu
- `ControlPanel.test.tsx`: kontrol etkileşimleri

Yeni modüllerde en az derive seviyesi test beklenmelidir.

Özellikle yeni AI dalgasında testlerin odaklandığı davranış türleri şunlardır:

- çözüm bulunabilir / bulunamaz ayrımı
- aynı parametre setiyle deterministik çıktı
- heuristic veya rollout bütçesi gibi ayarların metrikleri beklenen yönde değiştirmesi
- proof chain, posterior delta, candidate move confidence gibi pedagojik çıktıların boş kalmaması

Bugün bu testlere ek olarak:

- theory panelinin render edildiğini doğrulayan sayfa testleri
- legacy `formulaTeX` fallback davranışı
- timeline'a çevrilen limit, kısmi türev ve vektör alanı modülleri için playback testleri
- metadata ile gelen checkpoint/challenge panellerinin render testleri
- seçili threshold frame'inden açılan fairness playback testi
- beam width ve karşılaştırmalı log-olasılık düzeltmeleri için decoding testleri

de repo içinde bulunur.

## Genişletme Kuralları

Yeni bir sistem eklerken şu çizgiyi koru:

- simülasyon hesabı React component'ine taşınmamalı
- route katmanı modül detaylarını bilmemeli
- persistence isteğe bağlı ve hafif kalmalı
- modül çıktısı ortak panelleri besleyecek kadar zengin olmalı
- global store sadece gerçek paylaşılmış state ihtiyacı doğarsa düşünülmeli

Bu proje için doğru mimari, mümkün olan en küçük ama tutarlı iç platformdur.
