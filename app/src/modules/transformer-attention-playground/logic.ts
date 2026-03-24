import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface TransformerAttentionPlaygroundParams extends SimulationParamsBase {
  scenario: 'pronoun-resolution' | 'negation-scope' | 'order-sensitive'
  attentionTemperature: number
  positionEncoding: boolean
  positionStrength: number
}

interface TokenDefinition {
  token: string
  semantic: number[]
}

interface ScenarioDefinition {
  label: string
  description: string
  tokens: TokenDefinition[]
}

export interface ProjectionVector {
  token: string
  values: number[]
}

export interface AttentionContributor {
  token: string
  index: number
  weight: number
}

export interface AttentionSnapshot {
  queryIndex: number
  queryToken: string
  rawScores: number[]
  attentionWeights: number[]
  contextVector: number[]
  entropy: number
  topContributors: AttentionContributor[]
}

export interface TransformerAttentionPlaygroundResult extends SimulationResultBase {
  scenarioLabel: string
  scenarioDescription: string
  tokens: string[]
  queryVectors: ProjectionVector[]
  keyVectors: ProjectionVector[]
  valueVectors: ProjectionVector[]
  attentionMatrix: number[][]
  scoreMatrix: number[][]
  snapshots: AttentionSnapshot[]
  averageEntropy: number
  sharpestAttention: number
  positionalDrift: number
}

const queryProjection = [
  [1.15, -0.2, 0.35, 0.15],
  [0.25, 0.95, 0.1, -0.25],
  [0.2, 0.15, 1.05, 0.3],
  [0.1, -0.15, 0.25, 1.1],
]

const keyProjection = [
  [1.05, 0.1, 0.2, -0.1],
  [-0.15, 1.08, 0.18, 0.2],
  [0.32, 0.05, 0.95, 0.18],
  [0.08, 0.24, 0.12, 1.04],
]

const valueProjection = [
  [0.95, 0.28, 0.18, 0.1],
  [0.2, 0.92, 0.16, 0.18],
  [0.12, 0.14, 1.02, 0.22],
  [0.18, 0.08, 0.24, 0.94],
]

const scenarios: Record<TransformerAttentionPlaygroundParams['scenario'], ScenarioDefinition> = {
  'pronoun-resolution': {
    label: 'Pronoun Resolution',
    description: 'Tekrarlayan isimler ile zamir arasındaki bağlantıyı attention üstünden okumaya odaklanır.',
    tokens: [
      { token: 'Ada', semantic: [1.1, 0.15, 0.25, 0.05] },
      { token: 'handed', semantic: [0.12, 0.1, 0.95, 0.08] },
      { token: 'Mina', semantic: [0.22, 1.08, 0.18, 0.04] },
      { token: 'the', semantic: [0.08, 0.08, 0.08, 0.04] },
      { token: 'sensor', semantic: [0.36, 0.3, 0.72, 0.12] },
      { token: 'because', semantic: [0.05, 0.06, 0.42, 0.18] },
      { token: 'she', semantic: [0.78, 0.86, 0.2, 0.02] },
      { token: 'calibrated', semantic: [0.18, 0.12, 0.98, 0.1] },
      { token: 'it', semantic: [0.25, 0.22, 0.54, 0.02] },
    ],
  },
  'negation-scope': {
    label: 'Negation Scope',
    description: 'Olumsuzluk sinyalinin hangi sıfata ya da fiile yayıldığını görmeye odaklanır.',
    tokens: [
      { token: 'The', semantic: [0.08, 0.08, 0.1, 0.04] },
      { token: 'model', semantic: [0.32, 0.28, 0.72, 0.06] },
      { token: 'is', semantic: [0.1, 0.1, 0.26, 0.04] },
      { token: 'not', semantic: [0.05, 0.04, 0.2, 1.1] },
      { token: 'consistently', semantic: [0.16, 0.12, 0.44, 0.14] },
      { token: 'accurate', semantic: [0.24, 0.2, 0.98, 0.16] },
      { token: 'yet', semantic: [0.08, 0.06, 0.3, 0.12] },
      { token: 'promising', semantic: [0.28, 0.24, 0.82, 0.06] },
    ],
  },
  'order-sensitive': {
    label: 'Order Sensitive',
    description: 'Aynı token tekrar ettiğinde positional encoding olmadan sıranın nasıl bulanıklaştığını gösterir.',
    tokens: [
      { token: 'first', semantic: [0.42, 0.12, 0.24, 0.05] },
      { token: 'A', semantic: [1.05, 0.14, 0.18, 0.02] },
      { token: 'then', semantic: [0.1, 0.08, 0.42, 0.06] },
      { token: 'B', semantic: [0.18, 1.02, 0.16, 0.02] },
      { token: 'then', semantic: [0.1, 0.08, 0.42, 0.06] },
      { token: 'A', semantic: [1.05, 0.14, 0.18, 0.02] },
    ],
  },
}

function addVectors(left: number[], right: number[]) {
  return left.map((value, index) => value + (right[index] ?? 0))
}

function dotProduct(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

function multiplyMatrix(vector: number[], matrix: number[][]) {
  return matrix.map((row) => dotProduct(vector, row))
}

function positionalSignal(index: number, total: number, strength: number) {
  const normalized = total > 1 ? index / (total - 1) : 0

  return [
    Math.sin((index + 1) * 0.8) * 0.18 * strength,
    Math.cos((index + 1) * 0.6) * 0.16 * strength,
    (normalized - 0.5) * 0.42 * strength,
    ((index % 2 === 0 ? 1 : -1) * 0.2 + normalized * 0.15) * strength,
  ]
}

function softmax(scores: number[]) {
  const maxScore = Math.max(...scores)
  const exps = scores.map((score) => Math.exp(score - maxScore))
  const total = exps.reduce((sum, value) => sum + value, 0)

  return exps.map((value) => value / total)
}

function buildAttentionFromEmbeddings(embeddings: number[][], temperature: number) {
  const queryVectors = embeddings.map((vector) => multiplyMatrix(vector, queryProjection))
  const keyVectors = embeddings.map((vector) => multiplyMatrix(vector, keyProjection))
  const valueVectors = embeddings.map((vector) => multiplyMatrix(vector, valueProjection))
  const scale = Math.sqrt(queryVectors[0]?.length ?? 1) * temperature

  const scoreMatrix = queryVectors.map((query) =>
    keyVectors.map((key) => dotProduct(query, key) / scale),
  )
  const attentionMatrix = scoreMatrix.map((scores) => softmax(scores))

  return {
    queryVectors,
    keyVectors,
    valueVectors,
    scoreMatrix,
    attentionMatrix,
  }
}

function formatVector(token: string, values: number[]): ProjectionVector {
  return {
    token,
    values: values.map((value) => Number(value.toFixed(3))),
  }
}

function buildTimeline(tokens: string[]): SimulationTimeline {
  return {
    frames: tokens.map((token, index) => ({
      label: `${index + 1}. sorgu ${token}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Pozisyonu Kapat',
      change: 'Order Sensitive presetinde positional encodingi kapat ve aynı tokenlerin hangi satırlarda karıştığını izle.',
      expectation:
        'Tekrarlayan A ve then tokenleri daha benzer attention dağılımı üretir; positional drift metriği düşer.',
    },
    {
      title: 'Temperature Yükselt',
      change: 'Attention temperature değerini 1.4 civarına taşı.',
      expectation:
        'Softmax dağılımı daha yumuşak olur; tek bir tokene kilitlenmek yerine attention map yayılır ve entropy artar.',
    },
    {
      title: 'Negation Scope',
      change: 'Negation Scope senaryosuna geçip active query olarak accurate ve promising satırlarını izle.',
      expectation:
        'Not tokeni tüm satırlarda baskın kalmaz; yalnızca kapsam içindeki sıfatlarla daha güçlü eşleşir.',
    },
  ]
}

export function deriveTransformerAttentionPlaygroundResult(
  params: TransformerAttentionPlaygroundParams,
): TransformerAttentionPlaygroundResult {
  const scenario = scenarios[params.scenario]
  const tokens = scenario.tokens.map((item) => item.token)
  const embeddings = scenario.tokens.map((item, index) =>
    params.positionEncoding
      ? addVectors(item.semantic, positionalSignal(index, scenario.tokens.length, params.positionStrength))
      : [...item.semantic],
  )
  const baselineEmbeddings = scenario.tokens.map((item) => [...item.semantic])

  const enriched = buildAttentionFromEmbeddings(embeddings, params.attentionTemperature)
  const baseline = buildAttentionFromEmbeddings(baselineEmbeddings, params.attentionTemperature)

  const snapshots = enriched.attentionMatrix.map((weights, queryIndex) => {
    const rawScores = enriched.scoreMatrix[queryIndex] ?? []
    const contextVector = (enriched.valueVectors[0] ?? []).map((_, valueIndex) =>
      weights.reduce(
        (sum, weight, tokenIndex) => sum + weight * (enriched.valueVectors[tokenIndex]?.[valueIndex] ?? 0),
        0,
      ),
    )
    const entropy = weights.reduce((sum, weight) => {
      if (weight <= 0) {
        return sum
      }

      return sum - weight * Math.log2(weight)
    }, 0)
    const topContributors = weights
      .map((weight, index) => ({
        token: tokens[index] ?? '',
        index,
        weight,
      }))
      .sort((left, right) => right.weight - left.weight)
      .slice(0, 3)

    return {
      queryIndex,
      queryToken: tokens[queryIndex] ?? '',
      rawScores: rawScores.map((score) => Number(score.toFixed(4))),
      attentionWeights: weights.map((weight) => Number(weight.toFixed(4))),
      contextVector: contextVector.map((value) => Number(value.toFixed(4))),
      entropy: Number(entropy.toFixed(4)),
      topContributors: topContributors.map((item) => ({
        ...item,
        weight: Number(item.weight.toFixed(4)),
      })),
    }
  })

  const averageEntropy =
    snapshots.reduce((sum, snapshot) => sum + snapshot.entropy, 0) / Math.max(snapshots.length, 1)
  const sharpestAttention = Math.max(...snapshots.flatMap((snapshot) => snapshot.attentionWeights), 0)
  const positionalDrift =
    enriched.attentionMatrix.reduce((sum, row, rowIndex) => {
      return (
        sum +
        row.reduce(
          (inner, weight, columnIndex) =>
            inner + Math.abs(weight - (baseline.attentionMatrix[rowIndex]?.[columnIndex] ?? 0)),
          0,
        )
      )
    }, 0) / Math.max(tokens.length * tokens.length, 1)

  const result: TransformerAttentionPlaygroundResult = {
    scenarioLabel: scenario.label,
    scenarioDescription: scenario.description,
    tokens,
    queryVectors: tokens.map((token, index) =>
      formatVector(token, enriched.queryVectors[index] ?? []),
    ),
    keyVectors: tokens.map((token, index) =>
      formatVector(token, enriched.keyVectors[index] ?? []),
    ),
    valueVectors: tokens.map((token, index) =>
      formatVector(token, enriched.valueVectors[index] ?? []),
    ),
    attentionMatrix: enriched.attentionMatrix.map((row) => row.map((value) => Number(value.toFixed(4)))),
    scoreMatrix: enriched.scoreMatrix.map((row) => row.map((value) => Number(value.toFixed(4)))),
    snapshots,
    averageEntropy,
    sharpestAttention,
    positionalDrift,
    learning: {
      summary:
        `${scenario.label} senaryosunda ${tokens.length} token için tek-head attention dağılımı üretildi. En keskin eşleşme ${(sharpestAttention * 100).toFixed(1)}% ile öne çıkıyor.`,
      interpretation:
        params.positionEncoding
          ? 'Positional encoding açıkken tekrar eden tokenler yalnızca içeriklerine göre değil, sıralarına göre de ayırt ediliyor.'
          : 'Positional encoding kapalı olduğu için attention sadece içerik benzerliğine yaslanıyor; tekrarlar daha kolay çakışıyor.',
      warnings:
        params.attentionTemperature > 1.25
          ? 'Yüksek temperature dikkat dağılımını fazla yumuşatabilir; hangi tokenin gerçekten baskın olduğunu okumak zorlaşır.'
          : 'Attention mapi doğrudan açıklama olarak görmek yanıltıcı olabilir; projeksiyon matrisleri de sonucu belirler.',
      tryNext:
        'Bu modülden sonra LLM Decoding Lab ile attention sonrası üretilen logitslerin nasıl token seçimine dönüştüğünü izle.',
    },
    metrics: [
      {
        label: 'Ort Entropy',
        value: averageEntropy.toFixed(2),
        tone: 'secondary',
      },
      {
        label: 'En Güçlü Weight',
        value: `${(sharpestAttention * 100).toFixed(1)}%`,
        tone: 'primary',
      },
      {
        label: 'Positional Drift',
        value: positionalDrift.toFixed(3),
        tone: params.positionEncoding ? 'tertiary' : 'neutral',
      },
      {
        label: 'Token Sayısı',
        value: tokens.length.toString(),
        tone: 'neutral',
      },
    ],
    experiments: buildExperiments(),
    timeline: buildTimeline(tokens),
  }

  return result
}
