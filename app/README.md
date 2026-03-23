# Obsidian Lab App

Bu klasör Vite tabanlı React uygulamasını içerir.

## Geliştirme

```bash
npm install
npm run dev
```

## Komutlar

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```

## Klasör Özeti

```text
src/
├── components/   # layout ve ortak simülasyon UI parçaları
├── engine/       # registry
├── hooks/        # parametre ve playback yönetimi
├── modules/      # her simülasyon kendi klasöründe
├── pages/        # Ana sayfa ve simülasyon sayfası
├── test/         # test setup
└── types/        # paylaşılan TypeScript tipleri
```

## Modül Geliştirme Kuralları

- Hesaplama mantığı `logic.ts` içinde kalır.
- `Visualization.tsx` yalnızca sunum ve etkileşim katmanıdır.
- `index.ts` metadata, kontrol şeması ve `derive` entegrasyonunu taşır.
- Yeni modül eklendikten sonra `src/modules/register.ts` içine kaydedilmelidir.

Detaylı bağlam için kök dizindeki [README](../README.md) ve [`docs/`](../docs) klasörüne bak.
