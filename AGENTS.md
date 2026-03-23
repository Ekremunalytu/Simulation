# Obsidian Lab — Interactive CS Simulation Workspace

## Proje Özeti
Bilgisayar Mühendisliği konularını interaktif simülasyonlarla öğrenmek için kişisel, lokal bir çalışma alanı. Ürün DEĞİL — auth, backend, veritabanı, deployment yok.

## Tech Stack
- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4 (`@theme` bloğu ile renk sistemi)
- **Animations:** Framer Motion
- **Routing:** React Router v6 (client-side)
- **Charts:** Recharts
- **Icons:** Lucide React
- **State:** React hooks (useSimulationParams custom hook)

## Komutlar
```bash
cd app
npm run dev      # Dev server (localhost:5173)
npm run build    # Production build (tsc + vite build)
npm run lint     # ESLint
```

## Ders Kategorileri
Sidebar'daki 4 ana ders ve modül kategori eşleştirmesi:

| Sidebar | Modül Kategorisi (`Category` type) |
|---------|-----------------------------------|
| Yapay Zeka | `ml` |
| Veri Tabanı Sistemleri | `database` |
| Calculus 2 | `math` |
| Görüntü İşleme | `algorithms` |

Eşleştirme: `src/components/layout/IconSidebar.tsx` içindeki `categoryMeta`

## Mimari
Detaylı mimari bilgi için bkz: `docs/architecture.md`

### Kısa Özet
- **Modül registry pattern:** `src/engine/registry.ts` — Map tabanlı, `registerModule()` ile kayıt
- **Her modül** 3 dosyadan oluşur: `index.ts` (config), `logic.ts` (hesaplama), `Visualization.tsx` (UI)
- **SimulationModule interface:** `src/types/simulation.ts` — tüm modüllerin uyması gereken kontrat
- **Kayıt yeri:** `src/App.tsx` — import + `registerModule()` çağrısı
- **Sayfalar:** Dashboard (`/`) ve SimulationPage (`/sim/:moduleId`)
- **Shell:** tek genişleyebilen sidebar + kompakt top bar
- **Kontroller:** `useSimulationParams` ile debounce auto-run; ayrı `Simülasyonu Çalıştır` akışı yok
- **Simülasyon sayfası:** tam genişlikli ana görsel + altta `Analiz/Öğrenme` sekmeleri + sağda drawer kontrol paneli

### Dosya Yapısı
```
app/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + modül kayıtları
├── index.css                   # Tema renkleri + global stiller
├── types/simulation.ts         # Paylaşılan tipler
├── engine/registry.ts          # Modül registry
├── hooks/useSimulationParams.ts
├── components/
│   ├── layout/                 # AppShell, IconSidebar, TopBar
│   └── simulation/             # ControlPanel, ExplanationPanel, FormulaPanel, SimulationCard
├── pages/                      # Dashboard, SimulationPage
└── modules/                    # Her modül kendi klasöründe
    ├── gradient-descent/       # Yapay Zeka (ml)
    ├── linear-regression/      # Yapay Zeka (ml)
    └── decision-tree/          # Yapay Zeka (ml)
```

## Tema — Obsidian Observatory (Koyu)
Surface renkleri `index.css` `@theme` bloğunda:
- `#070708` (ana bg) → `#0a0a0b` → `#101012` → `#151518` → `#1b1b1f` → `#24242a`
- Primary: `#d0bcff` / `#a078ff` (mor)
- Secondary: `#4cd7f6` (cyan)
- Fontlar: Space Grotesk (headline), Inter (body), JetBrains Mono (code)
- Asla pure white (`#fff`) kullanma — text rengi `#dbd8d7`
- Asla 1px solid border kullanma — tonal geçişler ve negatif boşluk tercih et

## Tasarım Referansları
- `docs/design.md` — Detaylı frontend tasarım spesifikasyonu
- `docs/backend.md` — Mimari ve modül sistemi spesifikasyonu
- `ui_suggestions/` — UI mockup'ları ve ekran görüntüleri

## Yeni Modül Ekleme (Kısa)
1. `src/modules/<isim>/` klasörü oluştur → `index.ts`, `logic.ts`, `Visualization.tsx`
2. `SimulationModule` interface'ine uygun obje export et
3. `src/App.tsx`'de import et ve `registerModule()` ile kaydet
4. Otomatik olarak `/sim/<id>` adresinde ve sidebar'da ilgili ders altında görünür

## Kurallar
- Simülasyon mantığı (matematik/algoritma) her zaman `logic.ts`'de yaşar, React bileşenlerinde DEĞİL
- State yönetimi: önce local state/hooks, Zustand sadece zorunluysa
- Yeni kategori eklerken: `types/simulation.ts`'deki `Category` tipine + `IconSidebar.tsx` içindeki `categoryMeta`'ya ekle
- Bu kişisel bir öğrenme aracı — production kalitesi, over-engineering, SEO gibi şeyler gereksiz
- Yoğun grid/SVG/chart görsellerinde kartın dış yüksekliğini büyütmek yerine iç scroll, `min-h-0` ve gerekirse dinamik `viewBox` kullan
