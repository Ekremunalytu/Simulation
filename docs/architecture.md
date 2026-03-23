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
│   │   ├── SecondarySidebar.tsx
│   │   └── TopBar.tsx
│   └── simulation/
│       ├── ControlPanel.tsx
│       ├── PlaybackControls.tsx
│       ├── MetricsPanel.tsx
│       ├── FormulaPanel.tsx
│       ├── ExplanationPanel.tsx
│       ├── ExperimentsPanel.tsx
│       ├── SimulationCard.tsx
│       └── SimulationErrorBoundary.tsx
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

- sol ikon sidebar
- açılır secondary sidebar
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

Aynı anda üç state tutulur:

- `draftParams`: kullanıcı panelde değiştirir
- `committedParams`: gerçekten çalıştırılan parametre seti
- `selectedPresetName`: seçili preset bilgisi

Ek davranışlar:

- `dirty` bayrağı draft ile committed farkını gösterir
- `runSimulation()` draft'ı commit eder ve URL'yi günceller
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

Not: sistem hem `instant` hem `timeline` modlarını birlikte taşır. Calculus II paketindeki `limit-explorer`, `derivative-lab`, `riemann-integral`, `sequence-series`, `taylor-series`, `partial-derivatives` ve `double-integral` modülleri timeline kullanırken bazı diğer modüller anlık sonuç üretmeye devam edebilir.

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
7. `theory` varsa adım adım teori panelini, yoksa legacy formül panelini render eder
8. render hatalarını `SimulationErrorBoundary` ile sınırlar

## Kategori Sistemi

Tip tarafında desteklenen kategoriler:

- `ml`
- `database`
- `math`
- `algorithms`
- `probability`

Sidebar eşleştirmesi [`app/src/components/layout/SecondarySidebar.tsx`](/Users/ekrem/Desktop/Okul/Simulations/app/src/components/layout/SecondarySidebar.tsx) içinde yapılır:

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
| `--color-surface` | `#0a0a0a` |
| `--color-surface-container-low` | `#0f0f0f` |
| `--color-surface-container` | `#161616` |
| `--color-surface-container-high` | `#1e1e1e` |
| `--color-surface-container-highest` | `#272727` |

Vurgu tokenları:

| Token | Değer |
|-------|-------|
| `--color-primary` | `#d0bcff` |
| `--color-primary-container` | `#a078ff` |
| `--color-secondary` | `#4cd7f6` |
| `--color-tertiary` | `#ffb869` |

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

### 5. `register.ts` dosyasına ekle

Yeni modülün görünmesi için [`app/src/modules/register.ts`](/Users/ekrem/Desktop/Okul/Simulations/app/src/modules/register.ts) içine import ve `registerModule(...)` çağrısı eklenmeli.

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
| Q-Learning Gridworld | `q-learning-gridworld` | `ml` | `advanced` |
| Gradyan İnişi | `gradient-descent` | `ml` | `intermediate` |
| Doğrusal Regresyon | `linear-regression` | `ml` | `beginner` |
| Karar Ağaçları | `decision-tree` | `ml` | `intermediate` |
| Limit Kaşifi | `limit-explorer` | `math` | `beginner` |
| Türev Laboratuvarı | `derivative-lab` | `math` | `beginner` |
| Riemann İntegrali | `riemann-integral` | `math` | `beginner` |
| Diziler ve Seriler | `sequence-series` | `math` | `intermediate` |
| Taylor Serileri | `taylor-series` | `math` | `intermediate` |
| Kısmi Türevler | `partial-derivatives` | `math` | `intermediate` |
| Çift Katlı İntegral | `double-integral` | `math` | `advanced` |
