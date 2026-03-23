export interface SamplePoint {
  x: number
  y: number | null
}

export interface Point2D {
  x: number
  y: number
}

export type AnalysisFunctionId = 'cubic' | 'sine' | 'exp'
export type IntegralFunctionId = 'parabola' | 'wave' | 'growth'
export type SurfaceId = 'paraboloid' | 'saddle' | 'wave'
export type VolumeSurfaceId = 'plane' | 'bowl' | 'ripple'
export type ImproperIntegralId = 'exp-tail' | 'p-tail' | 'inv-sqrt' | 'inv'
export type PolarFunctionId = 'rose' | 'cardioid' | 'spiral'
export type ParametricCurveId = 'circle' | 'lissajous' | 'cycloid'
export type ArcLengthCurveId = 'parabola' | 'sine' | 'circle'
export type SeriesTestId = 'geometric' | 'p-series' | 'alternating' | 'ratio' | 'comparison'
export type VectorFieldId = 'radial' | 'rotation' | 'sink'
export type RegionId = 'triangle' | 'disk' | 'between-curves'

export function sampleRange(min: number, max: number, count: number): number[] {
  if (count <= 1) {
    return [min]
  }

  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1))
}

export function sampleFunction(
  fn: (x: number) => number,
  min: number,
  max: number,
  count: number,
  clampAbs: number = 1_000,
): SamplePoint[] {
  return sampleRange(min, max, count).map((x) => {
    const y = fn(x)
    const visible = Number.isFinite(y) && Math.abs(y) <= clampAbs ? y : null
    return { x, y: visible }
  })
}

export function round(value: number, digits: number = 4): number {
  return Number(value.toFixed(digits))
}

export function formatSigned(value: number, digits: number = 3): string {
  const rounded = value.toFixed(digits)
  return value >= 0 ? `+${rounded}` : rounded
}

export function getAnalysisFunctionLabel(id: AnalysisFunctionId): string {
  switch (id) {
    case 'cubic':
      return 'f(x) = x^3 - 3x'
    case 'sine':
      return 'f(x) = sin(x)'
    case 'exp':
      return 'f(x) = e^x'
  }
}

export function evaluateAnalysisFunction(id: AnalysisFunctionId, x: number): number {
  switch (id) {
    case 'cubic':
      return x ** 3 - 3 * x
    case 'sine':
      return Math.sin(x)
    case 'exp':
      return Math.exp(x)
  }
}

export function derivativeAnalysisFunction(id: AnalysisFunctionId, x: number): number {
  switch (id) {
    case 'cubic':
      return 3 * x ** 2 - 3
    case 'sine':
      return Math.cos(x)
    case 'exp':
      return Math.exp(x)
  }
}

export function getAnalysisInterpretation(id: AnalysisFunctionId): string {
  switch (id) {
    case 'cubic':
      return 'Polinomlar yeterince pürüzsüz olduğu için secant eğimi tangent eğimine düzenli biçimde yaklaşır.'
    case 'sine':
      return 'Sinüs fonksiyonu periyodik yapı taşır; türev de faz kaydırılmış bir kosinüs davranışı sergiler.'
    case 'exp':
      return 'Üstel fonksiyon, büyüme hızı ile kendi değeri arasında doğrudan bağ kurduğu için türev sezgisi çok nettir.'
  }
}

function factorial(n: number): number {
  if (n <= 1) {
    return 1
  }

  let result = 1
  for (let index = 2; index <= n; index += 1) {
    result *= index
  }

  return result
}

function getDerivativeAtZero(id: AnalysisFunctionId, degree: number): number {
  switch (id) {
    case 'cubic':
      if (degree === 1) return -3
      if (degree === 3) return 6
      return 0
    case 'sine':
      if (degree % 2 === 0) return 0
      return degree % 4 === 1 ? 1 : -1
    case 'exp':
      return 1
  }
}

export function evaluateTaylorPolynomial(
  id: AnalysisFunctionId,
  degree: number,
  x: number,
): number {
  let sum = 0

  for (let order = 0; order <= degree; order += 1) {
    const derivativeAtZero = getDerivativeAtZero(id, order)
    if (derivativeAtZero === 0) {
      continue
    }

    sum += (derivativeAtZero / factorial(order)) * x ** order
  }

  return sum
}

export function getIntegralFunctionLabel(id: IntegralFunctionId): string {
  switch (id) {
    case 'parabola':
      return 'f(x) = 0.5x^2 + 1'
    case 'wave':
      return 'f(x) = sin(x) + 2'
    case 'growth':
      return 'f(x) = e^(x/2)'
  }
}

export function evaluateIntegralFunction(id: IntegralFunctionId, x: number): number {
  switch (id) {
    case 'parabola':
      return 0.5 * x ** 2 + 1
    case 'wave':
      return Math.sin(x) + 2
    case 'growth':
      return Math.exp(x / 2)
  }
}

export function antiderivativeIntegralFunction(id: IntegralFunctionId, x: number): number {
  switch (id) {
    case 'parabola':
      return x ** 3 / 6 + x
    case 'wave':
      return -Math.cos(x) + 2 * x
    case 'growth':
      return 2 * Math.exp(x / 2)
  }
}

export function exactIntegral(
  id: IntegralFunctionId,
  start: number,
  end: number,
): number {
  return antiderivativeIntegralFunction(id, end) - antiderivativeIntegralFunction(id, start)
}

export function getSurfaceLabel(id: SurfaceId): string {
  switch (id) {
    case 'paraboloid':
      return 'f(x, y) = x^2 + y^2'
    case 'saddle':
      return 'f(x, y) = x^2 - y^2'
    case 'wave':
      return 'f(x, y) = sin(x) + cos(y)'
  }
}

export function evaluateSurface(id: SurfaceId, x: number, y: number): number {
  switch (id) {
    case 'paraboloid':
      return x ** 2 + y ** 2
    case 'saddle':
      return x ** 2 - y ** 2
    case 'wave':
      return Math.sin(x) + Math.cos(y)
  }
}

export function partialDerivativeX(id: SurfaceId, x: number, y: number): number {
  void y

  switch (id) {
    case 'paraboloid':
      return 2 * x
    case 'saddle':
      return 2 * x
    case 'wave':
      return Math.cos(x)
  }
}

export function partialDerivativeY(id: SurfaceId, x: number, y: number): number {
  void x

  switch (id) {
    case 'paraboloid':
      return 2 * y
    case 'saddle':
      return -2 * y
    case 'wave':
      return -Math.sin(y)
  }
}

export function getVolumeSurfaceLabel(id: VolumeSurfaceId): string {
  switch (id) {
    case 'plane':
      return 'f(x, y) = x + y + 4'
    case 'bowl':
      return 'f(x, y) = 0.25x^2 + 0.25y^2 + 1'
    case 'ripple':
      return 'f(x, y) = 2 + sin(x)cos(y)'
  }
}

export function evaluateVolumeSurface(id: VolumeSurfaceId, x: number, y: number): number {
  switch (id) {
    case 'plane':
      return x + y + 4
    case 'bowl':
      return 0.25 * x ** 2 + 0.25 * y ** 2 + 1
    case 'ripple':
      return 2 + Math.sin(x) * Math.cos(y)
  }
}

export function exactDoubleIntegral(
  id: VolumeSurfaceId,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): number {
  switch (id) {
    case 'plane': {
      const xPart = ((xMax ** 2 - xMin ** 2) / 2) * (yMax - yMin)
      const yPart = ((yMax ** 2 - yMin ** 2) / 2) * (xMax - xMin)
      const constantPart = 4 * (xMax - xMin) * (yMax - yMin)
      return xPart + yPart + constantPart
    }
    case 'bowl': {
      const xPart = ((xMax ** 3 - xMin ** 3) / 12) * (yMax - yMin)
      const yPart = ((yMax ** 3 - yMin ** 3) / 12) * (xMax - xMin)
      const constantPart = (xMax - xMin) * (yMax - yMin)
      return xPart + yPart + constantPart
    }
    case 'ripple': {
      const base = 2 * (xMax - xMin) * (yMax - yMin)
      const ripple =
        (-Math.cos(xMax) + Math.cos(xMin)) * (Math.sin(yMax) - Math.sin(yMin))
      return base + ripple
    }
  }
}

export function getImproperIntegralLabel(id: ImproperIntegralId): string {
  switch (id) {
    case 'exp-tail':
      return '∫[0,∞) e^(-x) dx'
    case 'p-tail':
      return '∫[1,∞) 1/x^p dx'
    case 'inv-sqrt':
      return '∫(0,1] 1/√x dx'
    case 'inv':
      return '∫[1,∞) 1/x dx'
  }
}

export function evaluateImproperIntegrand(
  id: ImproperIntegralId,
  x: number,
  exponent: number = 2,
): number {
  switch (id) {
    case 'exp-tail':
      return Math.exp(-x)
    case 'p-tail':
      return 1 / x ** exponent
    case 'inv-sqrt':
      return 1 / Math.sqrt(x)
    case 'inv':
      return 1 / x
  }
}

export function partialImproperIntegral(
  id: ImproperIntegralId,
  cutoff: number,
  exponent: number = 2,
): number {
  switch (id) {
    case 'exp-tail':
      return 1 - Math.exp(-cutoff)
    case 'p-tail':
      if (Math.abs(exponent - 1) < 1e-6) {
        return Math.log(cutoff)
      }

      return (cutoff ** (1 - exponent) - 1) / (1 - exponent)
    case 'inv-sqrt':
      return 2 * (1 - Math.sqrt(Math.max(cutoff, 1e-6)))
    case 'inv':
      return Math.log(cutoff)
  }
}

export function exactImproperIntegral(
  id: ImproperIntegralId,
  exponent: number = 2,
): number | null {
  switch (id) {
    case 'exp-tail':
      return 1
    case 'p-tail':
      return exponent > 1 ? 1 / (exponent - 1) : null
    case 'inv-sqrt':
      return 2
    case 'inv':
      return null
  }
}

export function improperCutoffSequence(id: ImproperIntegralId): number[] {
  switch (id) {
    case 'inv-sqrt':
      return [0.4, 0.2, 0.1, 0.05, 0.02, 0.005]
    default:
      return [1, 2, 3, 5, 8, 12]
  }
}

export function getPolarFunctionLabel(id: PolarFunctionId, scale: number): string {
  switch (id) {
    case 'rose':
      return `r = ${scale.toFixed(2)}cos(2θ)`
    case 'cardioid':
      return `r = ${scale.toFixed(2)}(1 + cos θ)`
    case 'spiral':
      return `r = (${scale.toFixed(2)}/π)θ`
  }
}

export function evaluatePolarFunction(
  id: PolarFunctionId,
  theta: number,
  scale: number,
): number {
  switch (id) {
    case 'rose':
      return scale * Math.cos(2 * theta)
    case 'cardioid':
      return scale * (1 + Math.cos(theta))
    case 'spiral':
      return (scale / Math.PI) * theta
  }
}

export function polarThetaMax(id: PolarFunctionId): number {
  switch (id) {
    case 'spiral':
      return 2 * Math.PI
    default:
      return 2 * Math.PI
  }
}

export function exactPolarArea(id: PolarFunctionId, scale: number): number {
  switch (id) {
    case 'rose':
      return (Math.PI * scale ** 2) / 4
    case 'cardioid':
      return (3 * Math.PI * scale ** 2) / 2
    case 'spiral':
      return (4 * Math.PI * scale ** 2) / 3
  }
}

export function samplePolarCurve(
  id: PolarFunctionId,
  scale: number,
  thetaMax: number,
  count: number = 180,
): Array<{ theta: number; x: number; y: number; r: number }> {
  return sampleRange(0, thetaMax, count).map((theta) => {
    const r = evaluatePolarFunction(id, theta, scale)
    return {
      theta,
      r,
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    }
  })
}

export function getParametricCurveLabel(id: ParametricCurveId): string {
  switch (id) {
    case 'circle':
      return 'x(t)=cos(t), y(t)=sin(t)'
    case 'lissajous':
      return 'x(t)=sin(2t), y(t)=sin(3t)'
    case 'cycloid':
      return 'x(t)=t-sin(t), y(t)=1-cos(t)'
  }
}

export function evaluateParametricCurve(
  id: ParametricCurveId,
  t: number,
): Point2D {
  switch (id) {
    case 'circle':
      return { x: Math.cos(t), y: Math.sin(t) }
    case 'lissajous':
      return { x: Math.sin(2 * t), y: Math.sin(3 * t) }
    case 'cycloid':
      return { x: t - Math.sin(t), y: 1 - Math.cos(t) }
  }
}

export function derivativeParametricCurve(
  id: ParametricCurveId,
  t: number,
): Point2D {
  switch (id) {
    case 'circle':
      return { x: -Math.sin(t), y: Math.cos(t) }
    case 'lissajous':
      return { x: 2 * Math.cos(2 * t), y: 3 * Math.cos(3 * t) }
    case 'cycloid':
      return { x: 1 - Math.cos(t), y: Math.sin(t) }
  }
}

export function parametricRange(id: ParametricCurveId): [number, number] {
  switch (id) {
    case 'circle':
      return [0, 2 * Math.PI]
    case 'lissajous':
      return [0, 2 * Math.PI]
    case 'cycloid':
      return [0, 2 * Math.PI]
  }
}

export function sampleParametricCurve(
  id: ParametricCurveId,
  count: number = 160,
): Array<{ t: number; x: number; y: number }> {
  const [start, end] = parametricRange(id)
  return sampleRange(start, end, count).map((t) => ({
    t,
    ...evaluateParametricCurve(id, t),
  }))
}

export function getArcLengthCurveLabel(id: ArcLengthCurveId): string {
  switch (id) {
    case 'parabola':
      return 'y = x^2 / 2, x ∈ [-1, 1]'
    case 'sine':
      return 'y = sin(x), x ∈ [0, π]'
    case 'circle':
      return 'çeyrek çember, t ∈ [0, π/2]'
  }
}

export function sampleArcLengthCurve(
  id: ArcLengthCurveId,
  count: number = 160,
): Array<{ u: number; x: number; y: number }> {
  switch (id) {
    case 'parabola':
      return sampleRange(-1, 1, count).map((x) => ({ u: x, x, y: 0.5 * x ** 2 }))
    case 'sine':
      return sampleRange(0, Math.PI, count).map((x) => ({ u: x, x, y: Math.sin(x) }))
    case 'circle':
      return sampleRange(0, Math.PI / 2, count).map((t) => ({
        u: t,
        x: Math.cos(t),
        y: Math.sin(t),
      }))
  }
}

export function exactArcLength(id: ArcLengthCurveId): number {
  switch (id) {
    case 'parabola': {
      const primitive = (x: number) => 0.5 * (x * Math.sqrt(1 + x ** 2) + Math.asinh(x))
      return primitive(1) - primitive(-1)
    }
    case 'sine':
      return numericArcLength(
        sampleRange(0, Math.PI, 800).map((x) => ({ x, y: Math.sin(x) })),
      )
    case 'circle':
      return Math.PI / 2
  }
}

export function numericArcLength(points: Point2D[]): number {
  let total = 0

  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    )
  }

  return total
}

export function getSeriesScenarioLabel(id: SeriesTestId): string {
  switch (id) {
    case 'geometric':
      return 'Geometrik Seri'
    case 'p-series':
      return 'p-Serisi'
    case 'alternating':
      return 'Alternating Seri'
    case 'ratio':
      return 'Oran Testi'
    case 'comparison':
      return 'Karşılaştırma Testi'
  }
}

export function evaluateSeriesTerm(
  id: SeriesTestId,
  n: number,
  parameter: number,
): number {
  switch (id) {
    case 'geometric':
      return parameter ** (n - 1)
    case 'p-series':
      return 1 / n ** parameter
    case 'alternating':
      return ((n % 2 === 0 ? -1 : 1) * 1) / n
    case 'ratio':
      return factorial(n - 1) / parameter ** n
    case 'comparison':
      return 1 / (n ** 2 + n)
  }
}

export function seriesExpectedClassification(
  id: SeriesTestId,
  parameter: number,
): 'yakinsak' | 'iraksak' {
  switch (id) {
    case 'geometric':
      return Math.abs(parameter) < 1 ? 'yakinsak' : 'iraksak'
    case 'p-series':
      return parameter > 1 ? 'yakinsak' : 'iraksak'
    case 'alternating':
      return 'yakinsak'
    case 'ratio':
      return 'yakinsak'
    case 'comparison':
      return 'yakinsak'
  }
}

export function ratioTestValue(n: number, parameter: number): number {
  const current = evaluateSeriesTerm('ratio', n, parameter)
  const next = evaluateSeriesTerm('ratio', n + 1, parameter)
  return Math.abs(next / current)
}

export function comparisonReferenceTerm(n: number): number {
  return 1 / n ** 2
}

export function getVectorFieldLabel(id: VectorFieldId): string {
  switch (id) {
    case 'radial':
      return 'F(x,y) = <x, y>'
    case 'rotation':
      return 'F(x,y) = <-y, x>'
    case 'sink':
      return 'F(x,y) = <-x, -y>'
  }
}

export function evaluateVectorField(id: VectorFieldId, x: number, y: number): Point2D {
  switch (id) {
    case 'radial':
      return { x, y }
    case 'rotation':
      return { x: -y, y: x }
    case 'sink':
      return { x: -x, y: -y }
  }
}

export function vectorFieldDivergence(id: VectorFieldId): number {
  switch (id) {
    case 'radial':
      return 2
    case 'rotation':
      return 0
    case 'sink':
      return -2
  }
}

export function vectorFieldCurl(id: VectorFieldId): number {
  switch (id) {
    case 'radial':
      return 0
    case 'rotation':
      return 2
    case 'sink':
      return 0
  }
}

export function regionContains(id: RegionId, x: number, y: number): boolean {
  switch (id) {
    case 'triangle':
      return x >= 0 && y >= 0 && x + y <= 2
    case 'disk':
      return x ** 2 + y ** 2 <= 1.5 ** 2
    case 'between-curves':
      return x >= -1 && x <= 1 && y >= x ** 2 && y <= 1
  }
}

export function regionBounds(id: RegionId): { xMin: number; xMax: number; yMin: number; yMax: number } {
  switch (id) {
    case 'triangle':
      return { xMin: 0, xMax: 2, yMin: 0, yMax: 2 }
    case 'disk':
      return { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 }
    case 'between-curves':
      return { xMin: -1, xMax: 1, yMin: 0, yMax: 1 }
  }
}

export function regionExactArea(id: RegionId): number {
  switch (id) {
    case 'triangle':
      return 2
    case 'disk':
      return Math.PI * 1.5 ** 2
    case 'between-curves':
      return 4 / 3
  }
}
