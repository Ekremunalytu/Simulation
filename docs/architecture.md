# Mimari Dokümanı

Bu doküman uygulamanın mevcut teknik yapısını açıklar. Odak noktası gerçek kod akışıdır; tasarım niyeti değil, bugün çalışan mimari anlatılır.

## Kaynak Ağacı

```text
app/src/
├── App.tsx
├── main.tsx
├── index.css
├── types/
│   └── simulation.ts
├── engine/
│   └── registry.ts
├── hooks/
│   ├── useSimulationParams.ts
│   └── useSimulationPlayback.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── IconSidebar.tsx
│   │   └── TopBar.tsx
│   └── simulation/
│       ├── ControlPanel.tsx
│       ├── PlaybackControls.tsx
│       ├── MetricsPanel.tsx
│       ├── FormulaPanel.tsx
│       ├── ExplanationPanel.tsx
│       ├── ExperimentsPanel.tsx
│       ├── SimulationCard.tsx
│       ├── SimulationErrorBoundary.tsx
│       └── LearningPathPanel.tsx
├── pages/
│   ├── Dashboard.tsx
│   └── SimulationPage.tsx
└── modules/
    ├── register.ts
    ├── shared/
    │   ├── calculus.ts
    │   ├── random.ts
    │   └── search-grid.ts
    └── <module-id>/
        ├── index.ts
        ├── logic.ts
        ├── Visualization.tsx
        └── logic.test.ts
```

## Uygulama İskeleti

`App.tsx` iki işi yapar:

1. `registerAllModules()` çağrısıyla modülleri tek seferde registry'ye yükler.
2. `BrowserRouter` altında iki route kurar:
   - `/`
   - `/sim/:moduleId`

`AppShell` ise tüm sayfalara ortak layout sağlar:

- tek, genişleyebilen sol sidebar
- üst bar
- route içeriği için `<Outlet />`

## Registry Katmanı

Merkez kayıt noktası [`app/src/engine/registry.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/engine/registry.ts).

Sağlanan fonksiyonlar:

| Fonksiyon | Amaç |
|-----------|------|
| `registerModule(mod)` | Modülü `Map` içine kaydeder |
| `getModule(id)` | Tek modül döner |
| `getAllModules()` | Tüm modülleri listeler |
| `getModulesByCategory(category)` | Kategori filtresi yapar |

Kayıt akışı [`app/src/modules/register.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/register.ts) içinde tutulur. Bu sayede modül kayıtları `App.tsx` içinde dağılmaz ve tekrar kayıt `registered` guard'ı ile engellenir.

## SimulationModule Kontratı

Ana kontrat [`app/src/types/simulation.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/types/simulation.ts) içinde tanımlı.

Önemli alanlar:

```ts
interface SimulationModule<TParams, TResult> {
  id: string
  title: string
  subtitle: string
  category: Category
  description: string
  icon: string
  difficulty: Difficulty
  runMode: 'instant' | 'timeline'
  defaultParams: TParams
  presets: PresetConfig<TParams>[]
  controlSchema: ControlDefinition<TParams>[]
  formulaTeX?: string
  theory?: {
    primaryFormula: string
    formulaLabel?: string
    symbols: Array<{ symbol: string; meaning: string }>
    derivationSteps: string[]
    interpretation: string
    pitfalls?: string[]
  }
  derive: (params: TParams) => TResult
  VisualizationComponent: React bileşeni veya lazy bileşen
  codeExample?: string
}
```

Bu yapı önceki sürümdeki `explanationGenerator` yaklaşımından farklıdır. Öğrenme notları artık `derive()` sonucunun bir parçası olarak dönülür.

## Sonuç Modeli

Her modülün `derive()` fonksiyonu en az `SimulationResultBase` sözleşmesine uyar.

```ts
interface SimulationResultBase {
  learning: {
    summary: string
    interpretation: string
    warnings: string
    tryNext: string
  }
  metrics: Array<{ label: string; value: string; tone?: ... }>
  experiments: Array<{ title: string; change: string; expectation: string }>
  timeline?: { frames: Array<{ label: string }> }
}
```

Bunun sonucu olarak `SimulationPage` her modülde ortak panelleri garanti şekilde render edebilir:

- `MetricsPanel`
- `FormulaPanel` veya yapılandırılmış `theory` içeriği
- `ExplanationPanel`
- `ExperimentsPanel`
- `PlaybackControls` (yalnızca `timeline` modunda)

## Parametre Yönetimi

Parametre akışının merkezi [`app/src/hooks/useSimulationParams.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/hooks/useSimulationParams.ts).

Hook şu davranışı uygular:

1. Önce URL query string okunur.
2. Query yoksa modül bazlı `localStorage` durumu okunur.
3. O da yoksa `defaultParams` kullanılır.

Aynı anda şu state'ler tutulur:

- `draftParams`: kullanıcı panelde değiştirir
- `committedParams`: gerçekten çalıştırılan parametre seti
- `selectedPresetName`: seçili preset bilgisi
- `syncState`: `idle | updating | synced`

Ek davranışlar:

- parametre değişikliği `300ms` debounce ile commit edilir
- URL ve `localStorage` otomatik güncellenir
- `reset()` aktif preset veya default değerlere döner
- panel açık/kapalı durumu da persist edilir

Storage anahtarı formatı:

```text
obsidian-lab:<moduleId>
```

## Playback Katmanı

Zaman akışlı modüller için [`app/src/hooks/useSimulationPlayback.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/hooks/useSimulationPlayback.ts) kullanılır.

Desteklenen özellikler:

- oynat
- durdur
- tek adım ilerlet
- başa sar
- hız değiştir (`0.5x`, `1x`, `2x`)

Playback state, `result.timeline.frames.length` değerine göre senkronize edilir. Parametre commit edildiğinde `resetKey` değişir ve oynatma başa alınır.

Not: sistem hem `instant` hem `timeline` modlarını birlikte taşır. Calculus tarafında `limit-explorer`, `multivariable-surfaces`, `quadric-surfaces`, `multivariable-limit-paths`, `derivative-lab`, `partial-derivatives`, `directional-derivative-gradient`, `extrema-second-derivative-test`, `riemann-integral`, `double-integral`, `polar-area`, `change-of-variables`, `parametric-curves`, `arc-length`, `line-integrals`, `sequence-series`, `taylor-series`, `series-tests-lab`, `vector-fields` ve `multiple-integral-regions` gibi modüller timeline kullanır. AI tarafında da `expert-system-inference`, `knowledge-representation-lab`, `constraint-satisfaction-playground`, `bayesian-network-inference`, `minimax-alpha-beta`, `mcts-game-lab` ve `q-learning-gridworld` gibi modüller adım adım reasoning ya da search akışı döndürür. Özellikle `vector-fields`, `constraint-satisfaction-playground` ve `mcts-game-lab` gibi modüller iç scroll + playback kombinasyonuyla yoğun görsel yüzeyleri taşır. Bazı eski modüller ise anlık sonuç üretmeye devam eder.

## Sayfa Akışı

### Ana Sayfa

[`app/src/pages/Dashboard.tsx`](/Users/ekrem/Desktop/Okul/Simulations/app/src/pages/Dashboard.tsx):

- registry'den tüm modülleri alır
- ilk modülü öne çıkan kart olarak gösterir
- kalan modülleri grid içinde `SimulationCard` ile render eder

### Simülasyon Sayfası

[`app/src/pages/SimulationPage.tsx`](/Users/ekrem/Desktop/Okul/Simulations/app/src/pages/SimulationPage.tsx):

1. URL'den `moduleId` alır
2. registry'den modülü çözer
3. `useSimulationParams` ile state'i kurar
4. `mod.derive(committedParams)` ile sonucu üretir
5. sonucu query string bazlı cache'ler
6. görselleştirmeyi `Suspense` ile lazy yükler
7. kritik metrikleri görselleştirme üstüne overlay olarak taşır
8. alt içerikleri `Analiz` ve `Öğrenme` sekmelerine böler
9. kontrol panelini sağ sütun yerine drawer olarak açar
10. `theory` varsa adım adım teori panelini, yoksa legacy formül panelini render eder
11. metadata içindeki `prerequisiteModuleIds` ve `nextModuleIds` alanlarını `LearningPathPanel` ile görselleştirir
12. render hatalarını `SimulationErrorBoundary` ile sınırlar

## Bundle ve Yükleme

Görselleştirme bileşenleri modül bazında `lazy()` ile yüklenmeye devam eder. Bunun üstüne build katmanında [`app/vite.config.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/vite.config.ts) içindeki `manualChunks` ayarıyla:

- `react` ve `react-dom`
- `react-router-dom`
- `recharts`
- `framer-motion`
- kalan vendor kodu

ayrı chunk'lara bölünür. Amaç, modül sayısı arttıkça ana uygulama chunk'ını sabit tutmak ve büyük grafik bağımlılıklarının başlangıç yükünü azaltmaktır.

## Kategori Sistemi

Tip tarafında desteklenen kategoriler:

- `ml`
- `database`
- `math`
- `algorithms`
- `probability`

Sidebar eşleştirmesi [`app/src/components/layout/SecondarySidebar.tsx`](/Users/ekrem/Desktop/Okul/Simulations/app/src/components/layout/SecondarySidebar.tsx) içindeki `categoryMeta` ile yapılır:

| UI kategorisi | Modül kategorisi |
|---------------|------------------|
| `ai` | `ml` |
| `database` | `database` |
| `calculus` | `math` |
| `image-processing` | `algorithms` |

Not: `probability` şu anda tip seviyesinde var ama sidebar'da expose edilmiyor.

## Tasarım Tokenları

Tema tokenları [`app/src/index.css`](/Users/ekrem/Desktop/Okul/Simulations/app/src/index.css) içindeki `@theme` bloğunda tutulur.

Ana yüzey tokenları:

| Token | Değer |
|-------|-------|
| `--color-surface` | `#070708` |
| `--color-surface-container-low` | `#101012` |
| `--color-surface-container` | `#151518` |
| `--color-surface-container-high` | `#1b1b1f` |
| `--color-surface-container-highest` | `#24242a` |

Vurgu tokenları:

| Token | Değer |
|-------|-------|
| `--color-primary` | `#d0bcff` |
| `--color-primary-container` | `#a078ff` |
| `--color-secondary` | `#4cd7f6` |
| `--color-tertiary` | `#ffb869` |

Görselleştirme bileşenleri için ortak çizim ve tooltip tokenları [`app/src/components/simulation/chartTheme.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/components/simulation/chartTheme.ts) içinde tutulur.

Layout tarafında önemli bir pratik kural da yerleşim stabilitesidir:

- iki satırlı panel grid'lerinde `minmax(0, …fr)` kullanılmalıdır
- `ResponsiveContainer` veya büyük SVG kullanan kartlarda ara kapsayıcı `min-h-0` olmalıdır
- büyük ağaç/ızgara görselleri ölçekle küçültülmek yerine gerektiğinde iç scroll ile korunmalıdır
- graph coloring, Bayesian network ve game tree gibi node-edge görsellerinde sabit `viewBox` + kapsayıcı scroll yaklaşımı tercih edilmelidir

## Yeni Modül Ekleme

### 1. Klasörü oluştur

```text
app/src/modules/<module-id>/
├── index.ts
├── logic.ts
├── Visualization.tsx
└── logic.test.ts
```

### 2. `logic.ts` içinde türetme katmanını yaz

Kurallar:

- React import etme
- deterministik hesap üret
- `learning`, `metrics`, `experiments` alanlarını doldur
- gerekiyorsa `timeline.frames` döndür
- hesap yardımcılarını gerekirse `modules/shared/` altına taşı

### 3. `Visualization.tsx` içinde sadece sunum katmanını yaz

Bileşen `params`, `result`, `runtime` prop'larını alır. Hesaplama mümkün olduğunca `logic.ts` içinde kalmalıdır.

### 4. `index.ts` içinde modülü tanımla

`defineSimulationModule(...)` kullanımı tavsiye edilir. Mevcut tüm modüller lazy-loaded visualization pattern'i kullanıyor.

### 5. Metadata ekle

Yeni modülün metadata'sını [`app/src/modules/metadata.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/metadata.ts) dosyasına ekle. Modülün kendisi `import.meta.glob` ile otomatik keşfedilir — [`app/src/modules/register.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/register.ts) içinde manuel import gerekmez.

### 6. Test yaz

Tercih edilen minimum:

- `logic.test.ts` ile derive fonksiyonu
- gerekiyorsa sayfa/hook davranışı için Vitest + Testing Library

## Güncel Modül Envanteri

| Modül | ID | Kategori | Zorluk |
|-------|----|----------|--------|
| Kör Arama | `blind-search` | `ml` | `intermediate` |
| Sezgisel Arama | `heuristic-search` | `ml` | `intermediate` |
| Yerel Arama | `local-search` | `ml` | `intermediate` |
| Genetik Algoritma | `genetic-algorithm` | `ml` | `advanced` |
| Minimax ve Alpha-Beta | `minimax-alpha-beta` | `ml` | `advanced` |
| MCTS Game Lab | `mcts-game-lab` | `ml` | `advanced` |
| Q-Learning Gridworld | `q-learning-gridworld` | `ml` | `advanced` |
| Gradyan İnişi | `gradient-descent` | `ml` | `intermediate` |
| Doğrusal Regresyon | `linear-regression` | `ml` | `beginner` |
| Karar Ağaçları | `decision-tree` | `ml` | `intermediate` |
| KNN Sınıflandırıcı | `knn-classifier` | `ml` | `beginner` |
| Naive Bayes Sınıflandırıcı | `naive-bayes-classifier` | `ml` | `intermediate` |
| Bayesian Network Inference | `bayesian-network-inference` | `ml` | `intermediate` |
| Perceptron Eğitici | `perceptron-trainer` | `ml` | `intermediate` |
| SVM Margin Kaşifi | `svm-margin-explorer` | `ml` | `intermediate` |
| Geri Yayılım Ağı | `backpropagation-network` | `ml` | `advanced` |
| K-Means Kümeleme | `k-means-clustering` | `ml` | `intermediate` |
| Constraint Satisfaction Playground | `constraint-satisfaction-playground` | `ml` | `intermediate` |
| Uzman Sistem Çıkarımı | `expert-system-inference` | `ml` | `intermediate` |
| Knowledge Representation Lab | `knowledge-representation-lab` | `ml` | `intermediate` |
| Limit Kaşifi | `limit-explorer` | `math` | `beginner` |
| Çok Değişkenli Yüzeyler | `multivariable-surfaces` | `math` | `beginner` |
| Kuadratik Yüzeyler | `quadric-surfaces` | `math` | `intermediate` |
| İki Değişkenli Limit Yolları | `multivariable-limit-paths` | `math` | `intermediate` |
| Türev Laboratuvarı | `derivative-lab` | `math` | `beginner` |
| Riemann İntegrali | `riemann-integral` | `math` | `beginner` |
| Diziler ve Seriler | `sequence-series` | `math` | `intermediate` |
| Taylor Serileri | `taylor-series` | `math` | `intermediate` |
| Kısmi Türevler | `partial-derivatives` | `math` | `intermediate` |
| Yönlü Türev ve Gradyan | `directional-derivative-gradient` | `math` | `intermediate` |
| Ekstremum ve İkinci Türev Testi | `extrema-second-derivative-test` | `math` | `advanced` |
| Çift Katlı İntegral | `double-integral` | `math` | `advanced` |
| İntegral Teknikleri | `integration-techniques` | `math` | `intermediate` |
| İmproper İntegraller | `improper-integrals` | `math` | `intermediate` |
| Polar Alan | `polar-area` | `math` | `intermediate` |
| Değişken Dönüşümü ve Jacobian | `change-of-variables` | `math` | `advanced` |
| Parametrik Eğriler | `parametric-curves` | `math` | `intermediate` |
| Yay Uzunluğu | `arc-length` | `math` | `intermediate` |
| Eğrisel İntegraller | `line-integrals` | `math` | `advanced` |
| Seri Testleri Laboratuvarı | `series-tests-lab` | `math` | `advanced` |
| Vektör Alanları | `vector-fields` | `math` | `advanced` |
| Bölgeye Göre Çoklu İntegral | `multiple-integral-regions` | `math` | `advanced` |

Calculus II kapsama haritası artık haftalık akışı daha doğrudan karşılar: week 1-2 için `multivariable-surfaces`, `quadric-surfaces`, `multivariable-limit-paths`; week 3-4 için `partial-derivatives`, `directional-derivative-gradient`, `extrema-second-derivative-test`; week 5-9 için `double-integral`, `polar-area`, `change-of-variables`, `parametric-curves`, `arc-length`, `vector-fields`; week 10 için `line-integrals`; week 11-14 için `sequence-series`, `series-tests-lab`, `taylor-series`.
