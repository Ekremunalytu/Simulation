# Obsidian Lab

Bilgisayar Mühendisliği konularını interaktif simülasyonlarla çalışmak için hazırlanmış lokal bir öğrenme alanı. Proje bir ürün değil; auth, backend, veritabanı ve deployment katmanları bilinçli olarak yok.

## Kapsam

- İnteraktif parametre kontrollü simülasyonlar
- Modül tabanlı genişletilebilir mimari
- Zaman akışlı oynatma desteği
- URL ile paylaşılabilen senaryolar
- `localStorage` ile modül bazlı oturum/panel durumu hatırlama
- Obsidian Observatory koyu tema sistemi

## Mevcut Modüller

| Modül | ID | Kategori | Zorluk | Mod |
|-------|----|----------|--------|-----|
| Kör Arama | `blind-search` | `ml` | `intermediate` | `timeline` |
| Sezgisel Arama | `heuristic-search` | `ml` | `intermediate` | `timeline` |
| Yerel Arama | `local-search` | `ml` | `intermediate` | `timeline` |
| Genetik Algoritma | `genetic-algorithm` | `ml` | `advanced` | `timeline` |
| Minimax ve Alpha-Beta | `minimax-alpha-beta` | `ml` | `advanced` | `timeline` |
| Q-Learning Gridworld | `q-learning-gridworld` | `ml` | `advanced` | `timeline` |
| Gradyan İnişi | `gradient-descent` | `ml` | `intermediate` | `timeline` |
| Doğrusal Regresyon | `linear-regression` | `ml` | `beginner` | `timeline` |
| Karar Ağaçları | `decision-tree` | `ml` | `intermediate` | `timeline` |

Not: `Category` tipinde `database`, `math`, `algorithms` ve `probability` alanları da tanımlı. Şu an kayıtlı modüllerin tamamı `ml` altında.

## Hızlı Başlangıç

```bash
cd app
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## Komutlar

`app/` altında:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```

Kök dizindeki kısa yollar:

```bash
make dev
make build
make lint
make typecheck
make clean
make fresh
```

## Teknik Yapı

- Vite + React + TypeScript
- Tailwind CSS v4 (`@theme` token sistemi)
- Framer Motion
- React Router ile client-side routing
- Recharts
- Lucide React
- Vitest + Testing Library

## Uygulama Akışı

1. Tüm modüller `app/src/modules/register.ts` içinde `registerAllModules()` ile registry'ye yüklenir.
2. Ana sayfa, registry'den gelen modül listesiyle kartları render eder.
3. `/sim/:moduleId` sayfası modülü alır, parametreleri `useSimulationParams` ile yönetir.
4. Parametreler önce taslak (`draft`) olarak tutulur; `Simülasyonu Çalıştır` ile `committed` hale gelir.
5. Commit edilen parametreler:
   - URL query string'e yazılır
   - `localStorage`'a kaydedilir
   - modülün `derive()` fonksiyonuna gönderilir
6. Sonuçtan metrik, öğrenme notu, deney önerileri ve varsa timeline üretilir.

## Yeni Modül Ekleme

1. `app/src/modules/<modul-adi>/` klasörü oluştur.
2. `logic.ts` içinde saf hesaplama katmanını yaz.
3. `Visualization.tsx` içinde sadece sunum katmanını yaz.
4. `index.ts` içinde `defineSimulationModule(...)` ile modülü tanımla.
5. `app/src/modules/register.ts` içine ekle.

Detaylı rehber için [docs/architecture.md](docs/architecture.md) dosyasına bak.

## Dokümantasyon Haritası

| Dosya | İçerik |
|-------|--------|
| [docs/architecture.md](docs/architecture.md) | Kaynak ağacı, registry, state akışı, modül kontratı |
| [docs/backend.md](docs/backend.md) | Simülasyon motoru, veri akışı, persistence ve playback detayları |
| [docs/design.md](docs/design.md) | Tema tokenları, layout sistemi ve UI kuralları |
| [app/README.md](app/README.md) | `app/` klasörü için geliştirici odaklı kısa rehber |
| [AGENTS.md](AGENTS.md) | Kod asistanı çalışma kuralları |
