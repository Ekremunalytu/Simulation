# Mimari Dokümanı

Bu doküman bugün çalışan yapıyı anlatır. Niyet veya eski planlar değil, repo içindeki gerçek akış özetlenir.

## Kaynak Ağacı

```text
app/src/
├── App.tsx
├── main.tsx
├── index.css
├── types/
│   └── simulation.ts
├── engine/
│   ├── catalog.ts
│   └── registry.ts
├── hooks/
│   ├── useSimulationNavigation.ts
│   ├── useSimulationParams.ts
│   └── useSimulationPlayback.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── IconSidebar.tsx
│   │   ├── SecondarySidebar.tsx
│   │   └── TopBar.tsx
│   └── simulation/
│       ├── ChallengePanel.tsx
│       ├── CheckpointPanel.tsx
│       ├── ControlPanel.tsx
│       ├── ExplanationPanel.tsx
│       ├── ExperimentsPanel.tsx
│       ├── FormulaPanel.tsx
│       ├── LearningPathPanel.tsx
│       ├── MetricsPanel.tsx
│       ├── PlaybackControls.tsx
│       ├── SimulationCard.tsx
│       └── SimulationErrorBoundary.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── LearningPathPage.tsx
│   └── SimulationPage.tsx
└── modules/
    ├── metadata.ts
    ├── register.ts
    ├── shared/
    │   ├── calculus.ts
    │   ├── dynamic-programming.ts
    │   ├── ml-datasets.ts
    │   ├── random.ts
    │   ├── search-grid.ts
    │   └── DynamicProgrammingVisualization.tsx
    └── <module-id>/
        ├── index.ts
        ├── logic.ts
        ├── Visualization.tsx
        └── logic.test.ts
```

Not: `LearningPathPage.tsx` repoda bulunuyor ancak `App.tsx` içinde route'a bağlı değil. Aktif kullanıcı akışı şu anda `Dashboard` ve `SimulationPage` üzerinden ilerliyor.

## Uygulama İskeleti

`App.tsx` açılışta `registerAllModules()` çağırır ve `MotionConfig reducedMotion="user"` altında iki aktif route kurar:

- `/`
- `/sim/:moduleId`

`AppShell` ortak iskeleti sağlar:

- solda 88px ikon rail (`IconSidebar`)
- seçili ders varsa açılan secondary sidebar (`SecondarySidebar`)
- üstte hızlı arama taşıyan `TopBar`
- route içeriği için sola göre kayan `<main>`

İçerik alanı secondary sidebar kapalıyken `96px`, açıkken `304px` sol offset ile çalışır. Yani layout artık tek sidebar değil, iki katmanlı sol navigasyon + tek içerik kolonudur.

## Registry ve Katalog Katmanı

Merkez kayıt noktası `app/src/engine/registry.ts`.

Sağlanan API:

| Fonksiyon | Amaç |
|-----------|------|
| `registerModule(mod)` | Enriched modülü `Map` içine kaydeder |
| `getModule(id)` | Tek modül çözer |
| `getAllModules()` | Tüm modülleri sıralı döner |
| `getModulesByCategory(category)` | Kategori bazlı liste döner |
| `getModulesByIds(ids)` | Öğrenme yolu ilişkilerini çözer |

Kayıt akışı `app/src/modules/register.ts` içindedir:

1. `import.meta.glob('./*/index.ts', { eager: true })` ile modül namespace'leri bulunur.
2. `metadata.ts` içindeki ek pedagojik metadata modüle merge edilir.
3. Modüller `featured > recommendedStarter > category > title` sırasıyla dizilir.
4. `prerequisiteModuleIds` ve `nextModuleIds` yalnızca gerçekten kayıtlı modüllerle filtrelenir.
5. `registered` guard'ı sayesinde tekrar kayıt engellenir.

`engine/catalog.ts` ise shell ve dashboard tarafındaki katalog mantığını taşır:

- ders -> kategori eşleştirmesi (`courseCategoryMeta`)
- arama ve filtreleme
- featured modül seçimi
- difficulty ve runMode etiketleri

## SimulationModule Kontratı

Ana kontrat `app/src/types/simulation.ts` içinde tanımlıdır.

Önemli tipler:

```ts
type Category = 'ml' | 'database' | 'math' | 'algorithms' | 'probability'
type RunMode = 'instant' | 'timeline'

interface SimulationModule<TParams, TResult> {
  id: string
  title: string
  subtitle: string
  category: Category
  description: string
  icon: string
  difficulty: Difficulty
  runMode: RunMode
  defaultParams: TParams
  presets: PresetConfig<TParams>[]
  controlSchema: ControlDefinition<TParams>[]
  formulaTeX?: string
  theory?: TheoryContent
  derive: (params: TParams) => TResult
  VisualizationComponent: React component | lazy component
  codeExample?: string
}
```

Repo içinde authored modül ile registered modül ayrımı vardır:

- modül klasöründeki `index.ts` authored modülü tanımlar
- `register.ts` bunu metadata ile zenginleştirir
- uygulama genelde `RegisteredSimulationModule` ile çalışır

Ortak metadata alanları:

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

## Sonuç Modeli

Her `derive()` çağrısı en az şu ortak gövdeyi üretir:

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
  timeline?: {
    frames: Array<{ label: string }>
    initialFrameIndex?: number
  }
}
```

Bu ortak sözleşme sayesinde `SimulationPage` modülden bağımsız olarak şu yüzeyleri render eder:

- `MetricsPanel`
- `FormulaPanel`
- `ExplanationPanel`
- `ExperimentsPanel`
- `CheckpointPanel`
- `ChallengePanel`
- opsiyonel `PlaybackControls`
- opsiyonel `codeExample` bloğu

Görselleştirmeye ayrıca `SimulationRuntime` geçilir:

- `runMode`
- `frameIndex`
- `totalFrames`
- `isPlaying`
- `speed`

## Parametre Yönetimi

Parametre yaşam döngüsünün merkezi `app/src/hooks/useSimulationParams.ts`.

Başlangıç önceliği:

1. URL query
2. `localStorage`
3. `defaultParams`

Tutulan state'ler:

- `draftParams`
- `committedParams`
- `panelOpen`
- `syncState`
- `selectedPresetName`
- internal olarak `lastPresetName`

Davranış:

- kullanıcı panelde değişiklik yapar
- `draftParams` anında güncellenir
- `300ms` debounce sonrası `committedParams` güncellenir
- query string `replace: true` ile senkronize edilir
- `localStorage` persist edilir

Persist edilen alanlar:

- `committedParams`
- `panelOpen`

Persist edilmeyen alanlar:

- `selectedPresetName`
- `draftParams`
- playback frame'i
- fullscreen durumu

Storage anahtarı formatı:

```text
obsidian-lab:<moduleId>
```

Reset davranışı yalnızca default değerlere dönmez; kullanıcı en son hangi preset mantığı içinde çalışıyorsa `lastPresetName` üzerinden o preset hedefi de korunabilir.

## Playback ve Kardeş Navigasyon

`useSimulationPlayback` zaman akışlı modüller için ortak reducer tabanlı akışı taşır.

Desteklenen davranışlar:

- oynat
- durdur
- tek adım ilerlet
- yeniden başlat
- hız değiştir (`0.5x`, `1x`, `2x`)

Önemli ayrıntılar:

- `initialFrameIndex` desteklenir
- parametre commit edildiğinde `resetKey` değişir ve playback resetlenir
- kullanıcı sona gelmişse tekrar `play()` ilk anlamlı frame'den başlatır

`useSimulationNavigation` ise aynı kategorideki modüller arasında gezinti sağlar:

- header içindeki önceki/sonraki butonları
- `Alt + ArrowLeft`
- `Alt + ArrowRight`

## Sayfa Akışı

### Dashboard

`app/src/pages/Dashboard.tsx` üç katmanlı bir katalog akışı sunar:

1. giriş kopyası ve toplam modül sayısı
2. `pickFeaturedModule()` ile seçilen öne çıkan modül kartı
3. arama + filtre + grid görünümü

Dashboard filtreleri:

- serbest metin arama
- ders
- zorluk
- akış türü
- sadece starter modüller

Arama input'u `useDeferredValue` ile yumuşatılır. Aktif filtreler chip olarak görünür. Boş sonuç halinde ayrı bir empty state kartı açılır.

### SimulationPage

`app/src/pages/SimulationPage.tsx` akışı:

1. `moduleId` route parametresini çözer
2. registry'den modülü bulur
3. `useSimulationParams` ile committed/draft state'i kurar
4. `mod.derive(committedParams)` sonucunu üretir
5. sonucu `simulationResultCache` içinde `moduleId + committedQuery` anahtarıyla cache'ler
6. `useSimulationPlayback` ile runtime oluşturur
7. `useSimulationNavigation` ile kategori içi prev/next modülleri bulur
8. görselleştirmeyi `Suspense` altında lazy yükler
9. üstte ilk üç metriği overlay olarak taşır
10. `LearningPathPanel` ile önkoşul, sonraki modül, hedef ve hafta bilgisini gösterir
11. alt içeriği `Analiz` ve `Öğrenme` sekmelerine böler
12. kontrol yüzeyini modal drawer olarak açar
13. fullscreen overlay desteği sunar
14. render hatalarını `SimulationErrorBoundary` ile izole eder

`Öğrenme` sekmesinde sırayla şu bloklar görünebilir:

- `ExplanationPanel`
- `ExperimentsPanel`
- `CheckpointPanel`
- `ChallengePanel`
- `codeExample`

## Kategori Sistemi

Tip seviyesinde desteklenen kategoriler:

- `ml`
- `database`
- `math`
- `algorithms`
- `probability`

Kullanıcıya açık ders alanı eşleştirmesi `app/src/engine/catalog.ts` içindeki `courseCategoryMeta` ile yapılır:

| UI kategorisi | Modül kategorisi |
|---------------|------------------|
| `ai` | `ml` |
| `database` | `database` |
| `calculus` | `math` |
| `image-processing` | `algorithms` |

Bugünkü gerçek modül dağılımı:

- toplam 51 modül
- `ml`: 27 modül
- `math`: 24 modül
- `database` ve `algorithms`: UI seviyesinde ayrılmış ama henüz modül yok
- `probability`: tip seviyesinde mevcut fakat shell navigasyonunda ayrı bir lane olarak expose edilmiyor

## Güncel Modül Aileleri

Bugünkü katalog pratikte şu kümelerden oluşuyor:

- ML search/decision: `blind-search`, `heuristic-search`, `local-search`, `constraint-satisfaction-playground`, `minimax-alpha-beta`, `mcts-game-lab`, `q-learning-gridworld`, `value-iteration`, `policy-iteration`
- ML supervised/representation: `linear-regression`, `gradient-descent`, `decision-tree`, `knn-classifier`, `naive-bayes-classifier`, `logistic-regression`, `perceptron-trainer`, `svm-margin-explorer`, `backpropagation-network`, `transformer-attention-playground`, `llm-decoding-lab`, `bias-fairness-explorer`, `bayesian-network-inference`, `knowledge-representation-lab`, `expert-system-inference`, `pca-explorer`, `k-means-clustering`, `genetic-algorithm`
- Calculus II core: `limit-explorer`, `multivariable-surfaces`, `quadric-surfaces`, `multivariable-limit-paths`, `derivative-lab`, `partial-derivatives`, `directional-derivative-gradient`, `extrema-second-derivative-test`
- Calculus II integrals/series/vector analysis: `riemann-integral`, `double-integral`, `multiple-integral-regions`, `polar-area`, `change-of-variables`, `integration-techniques`, `improper-integrals`, `parametric-curves`, `arc-length`, `line-integrals`, `vector-fields`, `divergence-curl-microscope`, `sequence-series`, `series-tests-lab`, `taylor-series`, `fourier-series-builder`

## Tasarım Tokenları

Tema tokenları `app/src/index.css` içindeki `@theme` bloğunda tutulur.

Özellikle kullanılan yardımcı sınıflar:

- `glass`
- `surface-card`
- `surface-panel`
- `ghost-outline`
- `eyebrow`
- `focus-ring`
- `tonal-rule`

Chart ve tooltip tonları için ortak yardımcılar `app/src/components/simulation/chartTheme.ts` içinde bulunur.

## Yeni Modül Ekleme

### 1. Klasörü oluştur

```text
app/src/modules/<module-id>/
├── index.ts
├── logic.ts
├── Visualization.tsx
└── logic.test.ts
```

### 2. `logic.ts` içinde hesap katmanını yaz

Kurallar:

- React bağımsız kalmalı
- deterministik ya da en azından tekrar üretilebilir davranmalı
- `learning`, `metrics`, `experiments` alanlarını doldurmalı
- gerekiyorsa `timeline.frames` ve `initialFrameIndex` döndürmeli

### 3. `Visualization.tsx` içinde yalnızca sunumu yaz

Bileşen `params`, `result`, `runtime` alır. Matematik veya algoritma hesabı burada yaşamamalı.

### 4. `index.ts` içinde authored modülü tanımla

`defineSimulationModule(...)` kullanımı tavsiye edilir. Visualization bileşeni lazy yüklenmelidir.

### 5. `metadata.ts` içine pedagojik metadata ekle

Otomatik keşif `register.ts` ile yapılır; manuel import gerekmez. Metadata eksikse modül kayıt sırasında zenginleşemez.

### 6. Test yaz

Minimum beklenti:

- `logic.test.ts`
- gerekiyorsa visualization veya sayfa seviyesi test

## Test Katmanı

Bugün repoda şu test aileleri var:

- her modül için `logic.test.ts`
- `register.test.ts`
- `Dashboard.test.tsx`
- `SimulationPage.test.tsx`
- `TopBar.test.tsx`
- `ControlPanel.test.tsx`
- `useSimulationParams.test.tsx`
- ek olarak `svm-margin-explorer/Visualization.test.tsx`

Pratik sonuç: 51 modülün tamamı metadata ile kayıtlı ve tamamı derive seviyesinde testlenmiş durumda.
