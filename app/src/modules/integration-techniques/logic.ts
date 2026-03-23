import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { sampleFunction, type SamplePoint } from '../shared/calculus'

export interface IntegrationTechniquesParams extends SimulationParamsBase {
  technique: string
}

export interface TechniqueFrame {
  step: number
  title: string
  expression: string
  explanation: string
}

export interface IntegrationTechniquesResult extends SimulationResultBase {
  originalCurve: SamplePoint[]
  helperCurve: SamplePoint[]
  frames: TechniqueFrame[]
  finalAntiderivative: string
}

function buildTechniqueData(technique: string): {
  title: string
  originalLabel: string
  helperLabel: string
  finalAntiderivative: string
  originalCurve: SamplePoint[]
  helperCurve: SamplePoint[]
  frames: TechniqueFrame[]
} {
  switch (technique) {
    case 'parts':
      return {
        title: 'Parçalı İntegrasyon',
        originalLabel: '∫ x e^x dx',
        helperLabel: 'u=x, dv=e^x dx',
        finalAntiderivative: 'x e^x - e^x + C',
        originalCurve: sampleFunction((x) => x * Math.exp(x / 3), -3, 3, 140, 25),
        helperCurve: sampleFunction((x) => Math.exp(x / 3), -3, 3, 140, 25),
        frames: [
          {
            step: 1,
            title: 'u ve dv seçimi',
            expression: 'u = x,  dv = e^x dx',
            explanation: 'Çarpımın bir parçası türev alınca basitleşsin, diğeri integral alınca yapısını korusun diye seçim yap.',
          },
          {
            step: 2,
            title: 'Formülü uygula',
            expression: '∫u dv = uv - ∫v du',
            explanation: 'Parçalı integrasyon, çarpımı tek seferde çözmek yerine bir terimi dışarı taşır.',
          },
          {
            step: 3,
            title: 'Yeni integrali çöz',
            expression: 'x e^x - ∫e^x dx',
            explanation: 'Kalan integral daha basit hale gelir ve doğrudan hesaplanabilir.',
          },
          {
            step: 4,
            title: 'Sonuç',
            expression: 'x e^x - e^x + C',
            explanation: 'Parçalı integrasyonun amacı integrali daha kolay bir forma dönüştürmektir.',
          },
        ],
      }
    case 'partial-fractions':
      return {
        title: 'Kısmi Kesirlere Ayırma',
        originalLabel: '∫ 1/(x^2-1) dx',
        helperLabel: '1/(x^2-1)=1/2·(1/(x-1)-1/(x+1))',
        finalAntiderivative: '1/2 ln|(x-1)/(x+1)| + C',
        originalCurve: sampleFunction((x) => 1 / (x ** 2 - 1), -3, 3, 160, 12),
        helperCurve: sampleFunction((x) => 0.5 * (1 / (x - 1) - 1 / (x + 1)), -3, 3, 160, 12),
        frames: [
          {
            step: 1,
            title: 'Rasyonel yapıyı fark et',
            expression: '1/(x^2-1) = 1/[(x-1)(x+1)]',
            explanation: 'Payda çarpanlara ayrılıyorsa kısmi kesir ayrışımı adaydır.',
          },
          {
            step: 2,
            title: 'Parçala',
            expression: 'A/(x-1) + B/(x+1)',
            explanation: 'Kesri basit logaritmik integrallere ayrıştıracak katsayıları bul.',
          },
          {
            step: 3,
            title: 'Katsayıları çöz',
            expression: 'A = 1/2, B = -1/2',
            explanation: 'Eşitlik her x için geçerli olacak şekilde katsayıları sabitle.',
          },
          {
            step: 4,
            title: 'Terim terim integre et',
            expression: '1/2 ∫1/(x-1)dx - 1/2 ∫1/(x+1)dx',
            explanation: 'Her terim logaritma verir; fark yapısı korunur.',
          },
        ],
      }
    default:
      return {
        title: 'Değişken Dönüşümü',
        originalLabel: '∫ 2x cos(x^2) dx',
        helperLabel: 'u = x^2, du = 2x dx',
        finalAntiderivative: 'sin(x^2) + C',
        originalCurve: sampleFunction((x) => 2 * x * Math.cos(x ** 2), -3, 3, 140, 25),
        helperCurve: sampleFunction((u) => Math.cos(u), -3, 3, 140, 25),
        frames: [
          {
            step: 1,
            title: 'İç fonksiyonu seç',
            expression: 'u = x^2',
            explanation: 'Dışarıdaki cos ifadesinin içinde türevle birlikte görünen yapı substitution için güçlü işarettir.',
          },
          {
            step: 2,
            title: 'Diferansiyeli eşleştir',
            expression: 'du = 2x dx',
            explanation: 'İntegrandaki 2x çarpanı doğrudan du ile eşleştiği için integral sadeleşir.',
          },
          {
            step: 3,
            title: 'u-uzayına geç',
            expression: '∫ cos(u) du',
            explanation: 'Substitution, zor görünen integrali tek değişkenli daha tanıdık bir forma dönüştürür.',
          },
          {
            step: 4,
            title: 'Geri dönüştür',
            expression: 'sin(x^2) + C',
            explanation: 'u ile bulunan sonucu tekrar x cinsine çevirerek antitürevi tamamla.',
          },
        ],
      }
  }
}

function buildTimeline(frames: TechniqueFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.step}. adım`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Teknik Seçimini Karşılaştır',
      change: 'Substitution, parts ve partial fractions arasında geçiş yap.',
      expectation: 'Her teknikte ilk görsel işaretin farklı olduğunu; bazı integrallerin dönüşüm, bazılarının yapı bozma istediğini göreceksin.',
    },
    {
      title: 'İç Yapıya Bak',
      change: 'Özellikle substitution modunda yardımcı grafiği incele.',
      expectation: 'u-dönüşümü sonrası eğrinin daha tanıdık ve okunabilir hale geldiğini göreceksin.',
    },
    {
      title: 'Formül Ezberini Kır',
      change: 'Aynı tekniğin neden seçildiğini theory panelindeki adımlarla birlikte takip et.',
      expectation: 'Teknik seçimi ezber değil, integrand yapısına dayalı bir karar gibi görünmeye başlayacak.',
    },
  ]
}

export function deriveIntegrationTechniquesResult(
  params: IntegrationTechniquesParams,
): IntegrationTechniquesResult {
  const data = buildTechniqueData(params.technique)

  return {
    originalCurve: data.originalCurve,
    helperCurve: data.helperCurve,
    frames: data.frames,
    finalAntiderivative: data.finalAntiderivative,
    metrics: [
      { label: 'Teknik', value: data.title, tone: 'primary' },
      { label: 'Adım', value: String(data.frames.length), tone: 'secondary' },
      { label: 'Başlangıç', value: data.originalLabel, tone: 'neutral' },
      { label: 'Sonuç', value: data.finalAntiderivative, tone: 'tertiary' },
    ],
    learning: {
      summary: `${data.originalLabel} integrali ${data.title.toLowerCase()} ile adım adım çözüldü.`,
      interpretation: 'Bu modülde asıl öğrenilen şey sonuç formülü değil, integrandın hangi görsel/cebirsel yapısının hangi tekniği çağırdığıdır.',
      warnings: 'Yanlış teknik seçimi çoğu zaman integralin daha da karmaşık hale gelmesine yol açar; ilk karar adımına dikkat et.',
      tryNext: 'Tekniği değiştirip aynı panel ritmiyle üç farklı integral ailesinin nasıl farklı parçalandığını karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(data.frames),
  }
}
