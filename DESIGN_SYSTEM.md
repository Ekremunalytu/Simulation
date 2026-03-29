# Obsidian Lab Design System

Bu doküman, Obsidian Lab simülasyon arayüzünün tasarım mantığını, yazı tiplerini, renk paletini ve animasyon stillerini özetler.

## 1. Tasarım Mantığı (Obsidian Observatory)
Obsidian Lab, "Obsidian Observatory" adını verdiğimiz, derin karanlık yüzeyler ve teknik detayların ön planda olduğu bir estetiğe sahiptir.

- **Derinlik ve Katmanlar:** Tasarımda `1px solid border` yerine tonal geçişler, `backdrop-filter: blur` (glassmorphism) ve negatif boşluklar tercih edilir.
- **Teknik Vurgu:** Veri alanlarının köşelerinde `+` işaretleri (`.data-perimeter`), monospace "eyebrow" başlıklar ve yüksek kontrastlı vurgu renkleri ile mühendislik hissi pekiştirilir.
- **Yumuşak Geçişler:** Saf beyaz (`#fff`) yerine daha göz yormayan krem/gri tonları (`#e7e3e0`) kullanılır.

## 2. Renk Sistemi (Tailwind @theme)

| Kategori | Değişken | Renk Kodu | Kullanım |
| :--- | :--- | :--- | :--- |
| **Ana Arka Plan** | `--color-surface` | `#070708` | En alt katman |
| **Konteyner** | `--color-surface-container` | `#151518` | Kartlar ve paneller |
| **Birincil** | `--color-primary` | `#d0bcff` | Vurgular, ana butonlar (Mor) |
| **İkincil** | `--color-secondary` | `#4cd7f6` | İkincil aksiyonlar (Cyan) |
| **Üçüncül** | `--color-tertiary` | `#ffb869` | Uyarı ve dikkat (Turuncu) |
| **Metin** | `--color-on-surface` | `#e7e3e0` | Gövde metni |

## 3. Tipografi

| Kullanım | Font Ailesi | Stil Özellikleri |
| :--- | :--- | :--- |
| **Başlıklar** | `Space Grotesk` | Geometrik, modern |
| **Gövde Metni** | `Inter` | Okunabilirlik odaklı |
| **Teknik Metinler** | `JetBrains Mono` | Kod, metrikler, "eyebrow" etiketler |

> [!TIP]
> **Eyebrow Stili:** `font-mono`, `text-xs`, `tracking-[0.18em]`, `uppercase` kombinasyonu ile teknik etiketler oluşturulur.

## 4. Animasyon Stilleri
Projede `framer-motion` kütüphanesi kullanılmaktadır.

- **Giriş Animasyonları:** Sayfa ve kartlar genellikle `opacity: 0` ve `y: 20` durumundan yumuşak bir `spring` veya `ease-out` transisyonu ile belirir.
- **Etkileşimler:** Buton ve kart hover durumlarında hafif bir `scale: 1.02` veya arka plan parlaklığı artışı uygulanır.
- **Layout:** Kenar çubuğu genişlediğinde veya kapandığında içerik `transition-[left] duration-300` ile akıcı bir şekilde kayar.

## 5. Görsel Bileşenler
- **Glassmorphism:** `.glass` sınıfı ile `backdrop-blur(20px)` ve iç ışık (`inset border`) uygulanmış paneller.
- **Data Perimeter:** Önemli grafik ve veri tablolarının köşelerine yerleştirilen dekoratif `+` karakterleri.
- **Scrollbar:** İnce (4px), koyu ve köşeleri yuvarlatılmış özel tasarım.
