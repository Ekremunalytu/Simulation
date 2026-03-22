# Obsidian Lab

Bilgisayar Muhendisligi konularini interaktif simulasyonlarla ogrenmek icin kisisel, lokal bir calisma alani.

## Ozellikler

- **Interaktif simulasyonlar** — parametre ayarla, sonucu aninda gor
- **Modul tabanli mimari** — her simulasyon bagimsiz bir modul olarak yasiyorr
- **Koyu tema** — Obsidian Observatory tasarim dili
- **Tam ekran modu** — simulasyonu buyutup detayli inceleme
- **Acilir/kapanir kontrol paneli** — daha genis gorsellesltirme alani

## Mevcut Moduller

| Modul | Kategori | Zorluk |
|-------|----------|--------|
| Linear Regression | ML | Beginner |
| Gradient Descent | ML | Intermediate |
| Decision Trees | ML | Intermediate |

## Hizli Baslangic

```bash
cd app
npm install
npm run dev
```

Tarayicida `http://localhost:5173` adresine git.

## Make Komutlari

```bash
make dev        # Dev server
make build      # Production build
make lint       # ESLint
make typecheck  # TypeScript kontrolu
make clean      # Build temizligi
make fresh      # Sifirdan: clean + install + build
```

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Lucide React
- React Router v6

## Yeni Modul Ekleme

1. `app/src/modules/<isim>/` klasoru olustur
   - `index.ts` — modul tanimlari ve metadata
   - `logic.ts` — hesaplama mantigi (saf fonksiyonlar)
   - `Visualization.tsx` — gorsellesltirme bileseni
2. `SimulationModule` interface'ine uygun obje export et
3. `app/src/App.tsx`'de import et ve `registerModule()` ile kaydet
4. Otomatik olarak `/sim/<id>` adresinde ve sidebar'da gorunur

Detayli rehber: [docs/architecture.md](docs/architecture.md)

## Proje Yapisi

```
.
├── README.md
├── CLAUDE.md              # AI asistan talimatlari
├── Makefile               # Build kisa yollari
├── docs/
│   ├── architecture.md    # Mimari dokumani
│   ├── backend.md         # Modul sistemi spesifikasyonu
│   └── design.md          # Frontend tasarim spesifikasyonu
├── ui_suggestions/        # UI mockup'lari
└── app/                   # React uygulamasi
    └── src/
        ├── modules/       # Simulasyon modulleri
        ├── components/    # Paylasilan bilesenler
        ├── pages/         # Sayfa bilesenleri
        ├── engine/        # Modul registry
        ├── hooks/         # Custom hook'lar
        └── types/         # TypeScript tipleri
```

## Dokumantasyon

| Dosya | Icerik |
|-------|--------|
| [docs/architecture.md](docs/architecture.md) | Detayli mimari, tip sistemi, yeni modul rehberi |
| [docs/backend.md](docs/backend.md) | Modul sistemi ve state yonetimi spesifikasyonu |
| [docs/design.md](docs/design.md) | UI/UX tasarim yonergeleri ve bileseen sistemi |
| [CLAUDE.md](CLAUDE.md) | AI asistan icin proje kurallari |
