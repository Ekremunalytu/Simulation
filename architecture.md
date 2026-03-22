# Mimari Döküman — Obsidian Lab

Bu döküman projenin teknik yapısını, bileşen ilişkilerini ve yeni modül ekleme sürecini detaylıca açıklar.

---

## Dosya Yapısı

```
app/src/
├── main.tsx                         # React uygulamasını DOM'a bağlar
├── App.tsx                          # Router kurulumu + modül kayıtları
├── index.css                        # Tailwind + tema renkleri + global stiller
│
├── types/
│   └── simulation.ts                # Tüm paylaşılan tipler ve interface'ler
│
├── engine/
│   └── registry.ts                  # Modül kayıt ve sorgulama sistemi
│
├── hooks/
│   └── useSimulationParams.ts       # Simülasyon parametreleri için custom hook
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Ana layout: sidebar + topbar + <Outlet>
│   │   ├── IconSidebar.tsx          # Sol ikon sidebar (ders kategorileri)
│   │   ├── SecondarySidebar.tsx     # Açılır yan panel (kategori modülleri)
│   │   └── TopBar.tsx              # Üst navigasyon barı
│   │
│   └── simulation/
│       ├── SimulationCard.tsx       # Dashboard'daki modül kartı
│       ├── ControlPanel.tsx         # Sağ taraf parametre kontrol paneli
│       ├── ExplanationPanel.tsx     # Dinamik açıklama paneli
│       └── FormulaPanel.tsx         # Formül gösterim paneli
│
├── pages/
│   ├── Dashboard.tsx                # Ana sayfa — tüm modülleri listeler
│   └── SimulationPage.tsx           # Simülasyon sayfası — modülü render eder
│
└── modules/                         # Her simülasyon kendi klasöründe yaşar
    ├── gradient-descent/
    │   ├── index.ts                 # SimulationModule objesi
    │   ├── logic.ts                 # Matematik ve algoritma
    │   └── Visualization.tsx        # Görselleştirme bileşeni
    ├── linear-regression/
    │   ├── index.ts
    │   ├── logic.ts
    │   └── Visualization.tsx
    └── decision-tree/
        ├── index.ts
        ├── logic.ts
        └── Visualization.tsx
```

---

## Bileşen Hiyerarşisi

```
App
└── BrowserRouter
    └── Routes
        └── Route (layout: AppShell)
            ├── IconSidebar            ← sabit sol ikon barı
            ├── SecondarySidebar       ← açılır/kapanır modül listesi
            ├── TopBar                 ← üst navigasyon
            └── <Outlet>               ← sayfa içeriği
                ├── "/" → Dashboard
                │       ├── Featured card (ilk modül)
                │       └── SimulationCard grid
                └── "/sim/:moduleId" → SimulationPage
                        ├── VisualizationComponent (modüle özel)
                        ├── ExplanationPanel
                        ├── FormulaPanel
                        ├── Code example
                        └── ControlPanel (sağ sidebar, sticky)
```

---

## Modül Registry Sistemi

Merkezi kayıt sistemi `engine/registry.ts` dosyasında bir `Map<string, SimulationModule>` kullanır.

### Fonksiyonlar

| Fonksiyon | Açıklama |
|-----------|----------|
| `registerModule(mod)` | Modülü `mod.id` ile kayıt eder |
| `getModule(id)` | Tek modül döner |
| `getAllModules()` | Tüm modüllerin listesi |
| `getModulesByCategory(cat)` | Kategoriye göre filtreler |

### Kayıt Akışı

```
App.tsx
  ├── import { gradientDescentModule } from './modules/gradient-descent'
  ├── import { linearRegressionModule } from './modules/linear-regression'
  ├── import { decisionTreeModule } from './modules/decision-tree'
  │
  ├── registerModule(gradientDescentModule)
  ├── registerModule(linearRegressionModule)
  └── registerModule(decisionTreeModule)
```

Yeni modül eklerken `App.tsx`'e import + registerModule satırı eklenir.

---

## Tip Sistemi

### SimulationModule (ana kontrat)

```typescript
interface SimulationModule {
  id: string                    // URL routing için: /sim/{id}
  title: string                 // Başlık
  subtitle: string              // Alt başlık
  category: Category            // 'ml' | 'database' | 'math' | 'algorithms' | 'probability'
  description: string           // Açıklama
  icon: string                  // Emoji ikon
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  defaultParams: Record<string, number | boolean | string>
  presets: PresetConfig[]       // Hazır parametre setleri
  controlSchema: ControlDefinition[]   // Slider/toggle/select tanımları
  formulaTeX?: string           // Formül stringi
  explanationGenerator: (params) => string  // Parametrelere göre dinamik açıklama
  VisualizationComponent: ComponentType     // React görselleştirme bileşeni
  codeExample?: string          // Python kod örneği
}
```

### ControlDefinition

```typescript
interface ControlDefinition {
  key: string                   // params objesindeki anahtar
  label: string                 // UI etiketi
  type: 'slider' | 'toggle' | 'select'
  min?: number                  // slider için
  max?: number
  step?: number
  options?: { label: string; value: string }[]  // select için
}
```

### Modüle Özel Tipler

Her modül kendi `logic.ts` dosyasında kendi tiplerini tanımlar:
- `GDPoint` (gradient-descent)
- `DataPoint`, `RegressionResult` (linear-regression)
- `TreeNode`, `DataPoint2D` (decision-tree)

---

## Routing

```
/                    → Dashboard (tüm modül kartları)
/sim/:moduleId       → SimulationPage (modülün id'siyle eşleşir)
```

`SimulationPage` URL'deki `moduleId`'yi alır, `getModule(moduleId)` ile registry'den modülü çeker, bulamazsa hata gösterir.

---

## Sidebar Kategori Eşleştirmesi

UI'daki ders kategorileri ile modül kategorileri farklı isimlendirilir. Eşleştirme `SecondarySidebar.tsx` içinde yapılır:

| Sidebar (CategoryKey) | Görünen İsim | Modül Kategorisi (Category) |
|------------------------|--------------|----------------------------|
| `ai` | Yapay Zeka | `ml` |
| `database` | Veri Tabanı Sistemleri | `database` |
| `calculus` | Calculus 2 | `math` |
| `image-processing` | Görüntü İşleme | `algorithms` |

Bir ikona tıklandığında `getModulesByCategory(mappedCategory)` çağrılır ve o kategorideki modüller listelenir.

---

## State Yönetimi

### useSimulationParams Hook

```typescript
const { params, setParam, reset, applyPreset } = useSimulationParams(mod.defaultParams)
```

- `params` — güncel parametre değerleri
- `setParam(key, value)` — tek parametre güncelle
- `reset()` — defaultParams'a dön
- `applyPreset(presetParams)` — preset uygula

### Veri Akışı

```
ControlPanel → setParam() → params güncellenir
                                ↓
                    VisualizationComponent (params prop'u ile)
                    ExplanationPanel (explanationGenerator çıktısı ile)
```

Parametre değişince visualization ve açıklama otomatik güncellenir (React reactivity).

---

## Tema Sistemi

Renkler `index.css` içinde `@theme` bloğunda tanımlı. Tailwind class'larında direkt kullanılır.

### Surface Katmanları (koyu → açık)

| Token | Hex | Kullanım |
|-------|-----|----------|
| `surface-container-lowest` | `#050505` | En derin arka plan |
| `surface-dim` | `#080808` | Karartılmış alan |
| `surface` | `#0a0a0a` | Ana arka plan |
| `surface-container-low` | `#0f0f0f` | Kart arka planları |
| `surface-container` | `#161616` | İçerik alanları |
| `surface-container-high` | `#1e1e1e` | Aktif kartlar |
| `surface-container-highest` | `#272727` | En yakın yüzey |

### Accent Renkler

| Token | Hex | Kullanım |
|-------|-----|----------|
| `primary` | `#d0bcff` | Ana mor vurgu |
| `primary-container` | `#a078ff` | Gradient bitiş |
| `secondary` | `#4cd7f6` | Cyan vurgu |
| `tertiary` | `#ffb869` | Turuncu vurgu |

### Fontlar

| Token | Font | Kullanım |
|-------|------|----------|
| `font-headline` | Space Grotesk | Başlıklar |
| `font-body` | Inter | Gövde metin |
| `font-mono` | JetBrains Mono | Formüller, kod, teknik veriler |

---

## Yeni Modül Ekleme Rehberi

### 1. Klasör oluştur

```
src/modules/<modül-adı>/
├── index.ts
├── logic.ts
└── Visualization.tsx
```

### 2. logic.ts — Hesaplama mantığı

```typescript
// Saf fonksiyonlar, React bağımlılığı yok
export function hesapla(params: ...) { ... }
```

### 3. Visualization.tsx — Görselleştirme

```typescript
import { useMemo } from 'react'
import { hesapla } from './logic'

interface Props {
  params: Record<string, any>
}

export function ModulVisualization({ params }: Props) {
  const sonuc = useMemo(() => hesapla(...), [params.x, params.y])
  return <div>...</div>
}
```

### 4. index.ts — Modül tanımı

```typescript
import type { SimulationModule } from '../../types/simulation'
import { ModulVisualization } from './Visualization'

export const modulAdi: SimulationModule = {
  id: 'modul-adi',
  title: 'Modül Başlığı',
  subtitle: 'Alt Başlık',
  category: 'ml',        // sidebar'da hangi dersin altında görüneceğini belirler
  description: '...',
  icon: '📊',
  difficulty: 'intermediate',
  defaultParams: { ... },
  presets: [ ... ],
  controlSchema: [ ... ],
  formulaTeX: '...',
  explanationGenerator: (params) => '...',
  VisualizationComponent: ModulVisualization,
  codeExample: `...`,
}
```

### 5. App.tsx'e kaydet

```typescript
import { modulAdi } from './modules/modul-adi'
registerModule(modulAdi)
```

### 6. Test et

Sayfa otomatik olarak `/sim/modul-adi` adresinde erişilebilir olur. Sidebar'da ilgili ders kategorisinin altında görünür.

---

## Mevcut Modüller

| Modül | ID | Kategori | Zorluk |
|-------|----|----------|--------|
| Gradient Descent | `gradient-descent` | ml | intermediate |
| Linear Regression | `linear-regression` | ml | beginner |
| Decision Trees | `decision-tree` | ml | intermediate |

---

## Gelecek İterasyonlar İçin Notlar

- **Boş kategoriler:** `database`, `math`, `algorithms` kategorileri henüz modülsüz
- **Yeni kategoriler:** `types/simulation.ts`'deki `Category` tipine eklenmeli + `SecondarySidebar.tsx`'deki `categoryMeta` mapping'e eklenmeli
- **localStorage persistence:** `useSimulationParams` hook'una eklenebilir — son parametre değerleri hatırlanır
- **Lazy loading:** Modül sayısı arttığında `React.lazy()` ile modüller dinamik import edilebilir
- **Yeni kontrol tipleri:** `ControlDefinition`'a `'color'`, `'text'`, `'radio'` gibi tipler eklenebilir
