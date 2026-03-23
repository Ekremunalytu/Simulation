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
      return (Math.PI * scale ** 2) / 2
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

export function secondDerivativeParametricCurve(
  id: ParametricCurveId,
  t: number,
): Point2D {
  switch (id) {
    case 'circle':
      return { x: -Math.cos(t), y: -Math.sin(t) }
    case 'lissajous':
      return { x: -4 * Math.sin(2 * t), y: -9 * Math.sin(3 * t) }
    case 'cycloid':
      return { x: Math.sin(t), y: Math.cos(t) }
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

function highPrecisionArcLength(
  fn: (x: number) => number,
  start: number,
  end: number,
  subdivisions: number = 100_000,
): number {
  const normalizedSubdivisions = subdivisions % 2 === 0 ? subdivisions : subdivisions + 1
  const h = (end - start) / normalizedSubdivisions
  let weightedSum = fn(start) + fn(end)

  for (let index = 1; index < normalizedSubdivisions; index += 1) {
    const x = start + index * h
    weightedSum += fn(x) * (index % 2 === 0 ? 2 : 4)
  }

  return (weightedSum * h) / 3
}

export function referenceArcLength(id: ArcLengthCurveId): number {
  switch (id) {
    case 'parabola': {
      const primitive = (x: number) => 0.5 * (x * Math.sqrt(1 + x ** 2) + Math.asinh(x))
      return primitive(1) - primitive(-1)
    }
    case 'sine':
      return highPrecisionArcLength((x) => Math.sqrt(1 + Math.cos(x) ** 2), 0, Math.PI)
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
      return n / parameter ** n
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
      return parameter > 1 ? 'yakinsak' : 'iraksak'
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

export type QuadricSurfaceId =
  | 'plane'
  | 'sphere'
  | 'ellipsoid'
  | 'elliptic-paraboloid'
  | 'cylinder'
  | 'cone'
export type QuadricSliceVariable = 'x' | 'y' | 'z'
export type MultivariableLimitId = 'consistent' | 'path-dependent' | 'unbounded'
export type LimitPathPairId = 'axes' | 'line-vs-parabola' | 'diagonals'
export type ExtremaSurfaceId = 'bowl' | 'hill' | 'saddle'
export type PolarRegionId = 'disk' | 'annulus' | 'sector'
export type PolarIntegrandId = 'unit' | 'radius' | 'radial-square'
export type LineIntegralCurveId = 'circle' | 'parabola' | 'line'
export type LineIntegralMode = 'scalar' | 'work'

export function surfaceGradient(id: SurfaceId, x: number, y: number): Point2D {
  return {
    x: partialDerivativeX(id, x, y),
    y: partialDerivativeY(id, x, y),
  }
}

export function secondPartialDerivativeXX(id: SurfaceId, x: number, y: number): number {
  void x
  void y

  switch (id) {
    case 'paraboloid':
      return 2
    case 'saddle':
      return 2
    case 'wave':
      return -Math.sin(x)
  }
}

export function secondPartialDerivativeYY(id: SurfaceId, x: number, y: number): number {
  void x
  void y

  switch (id) {
    case 'paraboloid':
      return 2
    case 'saddle':
      return -2
    case 'wave':
      return -Math.cos(y)
  }
}

export function secondPartialDerivativeXY(id: SurfaceId, x: number, y: number): number {
  void id
  void x
  void y
  return 0
}

export function directionalDerivativeSurface(
  id: SurfaceId,
  x: number,
  y: number,
  direction: Point2D,
): number {
  const gradient = surfaceGradient(id, x, y)
  return gradient.x * direction.x + gradient.y * direction.y
}

export function sampleSurfaceContourGrid(
  id: SurfaceId,
  min: number,
  max: number,
  count: number,
): Array<{ x: number; y: number; z: number }> {
  return sampleRange(min, max, count).flatMap((x) =>
    sampleRange(min, max, count).map((y) => ({
      x,
      y,
      z: evaluateSurface(id, x, y),
    })),
  )
}

export function surfaceLevelPoints(
  id: SurfaceId,
  level: number,
  min: number,
  max: number,
  count: number,
  tolerance: number = 0.18,
): Point2D[] {
  return sampleSurfaceContourGrid(id, min, max, count)
    .filter((sample) => Math.abs(sample.z - level) <= tolerance)
    .map((sample) => ({ x: sample.x, y: sample.y }))
}

export function getQuadricLabel(id: QuadricSurfaceId): string {
  switch (id) {
    case 'plane':
      return 'Düzlem'
    case 'sphere':
      return 'Küre'
    case 'ellipsoid':
      return 'Elipsoid'
    case 'elliptic-paraboloid':
      return 'Eliptik Paraboloid'
    case 'cylinder':
      return 'Silindir'
    case 'cone':
      return 'Koni'
  }
}

export function getQuadricEquation(id: QuadricSurfaceId): string {
  switch (id) {
    case 'plane':
      return 'z = 1 - 0.5x - 0.3y'
    case 'sphere':
      return 'x² + y² + z² = 4'
    case 'ellipsoid':
      return 'x²/4 + y²/2.25 + z² = 1'
    case 'elliptic-paraboloid':
      return 'z = 0.4x² + 0.25y²'
    case 'cylinder':
      return 'x² + y² = 1.44'
    case 'cone':
      return 'z² = x² + y²'
  }
}

export function quadricSliceRange(id: QuadricSurfaceId): [number, number] {
  switch (id) {
    case 'plane':
      return [-2, 2]
    case 'sphere':
      return [-2, 2]
    case 'ellipsoid':
      return [-2, 2]
    case 'elliptic-paraboloid':
      return [-1.5, 2.5]
    case 'cylinder':
      return [-1.2, 1.2]
    case 'cone':
      return [-2, 2]
  }
}

export function quadricSliceAxes(
  sliceVariable: QuadricSliceVariable,
): { horizontal: string; vertical: string; plane: string } {
  switch (sliceVariable) {
    case 'x':
      return { horizontal: 'y', vertical: 'z', plane: 'yz-düzlemi' }
    case 'y':
      return { horizontal: 'x', vertical: 'z', plane: 'xz-düzlemi' }
    case 'z':
      return { horizontal: 'x', vertical: 'y', plane: 'xy-düzlemi' }
  }
}

export function sampleQuadricSection(
  id: QuadricSurfaceId,
  sliceVariable: QuadricSliceVariable,
  sliceValue: number,
  count: number = 80,
): Array<{ u: number; upper: number | null; lower: number | null }> {
  const domain = sampleRange(-2.4, 2.4, count)
  const lineDomain = sampleRange(-2, 2, count)

  switch (id) {
    case 'plane': {
      if (sliceVariable === 'x') {
        return lineDomain.map((y) => ({
          u: y,
          upper: 1 - 0.5 * sliceValue - 0.3 * y,
          lower: null,
        }))
      }
      if (sliceVariable === 'y') {
        return lineDomain.map((x) => ({
          u: x,
          upper: 1 - 0.5 * x - 0.3 * sliceValue,
          lower: null,
        }))
      }
      return lineDomain.map((x) => ({
        u: x,
        upper: (1 - 0.5 * x - sliceValue) / 0.3,
        lower: null,
      }))
    }
    case 'sphere':
      return domain.map((u) => {
        const radiusSquared = 4 - sliceValue ** 2 - u ** 2
        if (radiusSquared < 0) {
          return { u, upper: null, lower: null }
        }

        const radius = Math.sqrt(radiusSquared)
        return { u, upper: radius, lower: -radius }
      })
    case 'ellipsoid': {
      const scale = sliceVariable === 'x' ? 2.25 : 4
      const constant =
        sliceVariable === 'x'
          ? sliceValue ** 2 / 4
          : sliceVariable === 'y'
            ? sliceValue ** 2 / 2.25
            : sliceValue ** 2
      return domain.map((u) => {
        const remaining = 1 - constant - u ** 2 / scale
        if (remaining < 0) {
          return { u, upper: null, lower: null }
        }

        const amplitude = sliceVariable === 'z' ? 1.5 * Math.sqrt(remaining) : Math.sqrt(remaining)
        return { u, upper: amplitude, lower: -amplitude }
      })
    }
    case 'elliptic-paraboloid':
      if (sliceVariable === 'z') {
        return domain.map((u) => {
          const remaining = sliceValue - 0.4 * u ** 2
          if (remaining < 0) {
            return { u, upper: null, lower: null }
          }

          return { u, upper: Math.sqrt(remaining / 0.25), lower: -Math.sqrt(remaining / 0.25) }
        })
      }
      return lineDomain.map((u) => ({
        u,
        upper:
          sliceVariable === 'x'
            ? 0.4 * sliceValue ** 2 + 0.25 * u ** 2
            : 0.4 * u ** 2 + 0.25 * sliceValue ** 2,
        lower: null,
      }))
    case 'cylinder':
      if (sliceVariable === 'z') {
        return domain.map((u) => {
          const remaining = 1.44 - u ** 2
          if (remaining < 0) {
            return { u, upper: null, lower: null }
          }

          return { u, upper: Math.sqrt(remaining), lower: -Math.sqrt(remaining) }
        })
      }
      {
        if (Math.abs(sliceValue) > 1.2) {
          return lineDomain.map((u) => ({ u, upper: null, lower: null }))
        }

        const height = Math.sqrt(1.44 - sliceValue ** 2)
        return lineDomain.map((u) => ({ u, upper: height, lower: -height }))
      }
    case 'cone':
      if (sliceVariable === 'z') {
        return domain.map((u) => {
          const remaining = sliceValue ** 2 - u ** 2
          if (remaining < 0) {
            return { u, upper: null, lower: null }
          }

          return { u, upper: Math.sqrt(remaining), lower: -Math.sqrt(remaining) }
        })
      }
      return lineDomain.map((u) => {
        const remaining = u ** 2 + sliceValue ** 2
        return { u, upper: Math.sqrt(remaining), lower: -Math.sqrt(remaining) }
      })
  }
}

export function describeQuadricSection(
  id: QuadricSurfaceId,
  sliceVariable: QuadricSliceVariable,
  sliceValue: number,
): string {
  if (id === 'plane') {
    return `${sliceVariable} = ${sliceValue.toFixed(2)} için kesit doğrusal kalır.`
  }

  if (id === 'cylinder' && sliceVariable !== 'z') {
    return `${sliceVariable} sabitken kesit iki paralel doğruya indirgenir.`
  }

  if (id === 'elliptic-paraboloid' && sliceVariable !== 'z') {
    return `${sliceVariable} sabitken z yönünde açılan bir parabol elde edilir.`
  }

  return `${sliceVariable} = ${sliceValue.toFixed(2)} kesiti kuadratik yüzeyin yerel geometriğini açığa çıkarır.`
}

export function getMultivariableLimitLabel(id: MultivariableLimitId): string {
  switch (id) {
    case 'consistent':
      return 'f(x,y) = (x-a)² + (y-b)²'
    case 'path-dependent':
      return 'f(x,y) = ((x-a)(y-b))/((x-a)²+(y-b)²)'
    case 'unbounded':
      return 'f(x,y) = 1/√((x-a)²+(y-b)²)'
  }
}

export function evaluateMultivariableLimitFunction(
  id: MultivariableLimitId,
  x: number,
  y: number,
  targetX: number,
  targetY: number,
): number | null {
  const dx = x - targetX
  const dy = y - targetY
  const radiusSquared = dx ** 2 + dy ** 2

  if (radiusSquared < 1e-10) {
    return null
  }

  switch (id) {
    case 'consistent':
      return radiusSquared
    case 'path-dependent':
      return (dx * dy) / radiusSquared
    case 'unbounded':
      return 1 / Math.sqrt(radiusSquared)
  }
}

export function getLimitPathPairLabel(id: LimitPathPairId): string {
  switch (id) {
    case 'axes':
      return 'x-ekseni vs y-ekseni'
    case 'line-vs-parabola':
      return 'doğru vs parabol'
    case 'diagonals':
      return 'iki diagonal'
  }
}

export function sampleLimitPathPair(
  id: LimitPathPairId,
  targetX: number,
  targetY: number,
  count: number = 6,
): {
  first: Array<{ step: number; x: number; y: number; h: number }>
  second: Array<{ step: number; x: number; y: number; h: number }>
  firstLabel: string
  secondLabel: string
} {
  const hs = Array.from({ length: count }, (_, index) => 1 / 2 ** index)

  switch (id) {
    case 'axes':
      return {
        first: hs.map((h, index) => ({ step: index + 1, x: targetX + h, y: targetY, h })),
        second: hs.map((h, index) => ({ step: index + 1, x: targetX, y: targetY + h, h })),
        firstLabel: 'y = b',
        secondLabel: 'x = a',
      }
    case 'line-vs-parabola':
      return {
        first: hs.map((h, index) => ({ step: index + 1, x: targetX + h, y: targetY + h, h })),
        second: hs.map((h, index) => ({ step: index + 1, x: targetX + h, y: targetY + h ** 2, h })),
        firstLabel: 'y-b = x-a',
        secondLabel: 'y-b = (x-a)²',
      }
    case 'diagonals':
      return {
        first: hs.map((h, index) => ({ step: index + 1, x: targetX + h, y: targetY + h, h })),
        second: hs.map((h, index) => ({ step: index + 1, x: targetX + h, y: targetY - h, h })),
        firstLabel: 'y-b = x-a',
        secondLabel: 'y-b = -(x-a)',
      }
  }
}

export function getExtremaSurfaceLabel(id: ExtremaSurfaceId): string {
  switch (id) {
    case 'bowl':
      return 'f(x,y) = x² + y²'
    case 'hill':
      return 'f(x,y) = -(x² + y²)'
    case 'saddle':
      return 'f(x,y) = x² - y²'
  }
}

export function evaluateExtremaSurface(id: ExtremaSurfaceId, x: number, y: number): number {
  switch (id) {
    case 'bowl':
      return x ** 2 + y ** 2
    case 'hill':
      return -(x ** 2 + y ** 2)
    case 'saddle':
      return x ** 2 - y ** 2
  }
}

export function extremaGradient(id: ExtremaSurfaceId, x: number, y: number): Point2D {
  switch (id) {
    case 'bowl':
      return { x: 2 * x, y: 2 * y }
    case 'hill':
      return { x: -2 * x, y: -2 * y }
    case 'saddle':
      return { x: 2 * x, y: -2 * y }
  }
}

export function extremaSecondPartials(
  id: ExtremaSurfaceId,
): { fxx: number; fyy: number; fxy: number } {
  switch (id) {
    case 'bowl':
      return { fxx: 2, fyy: 2, fxy: 0 }
    case 'hill':
      return { fxx: -2, fyy: -2, fxy: 0 }
    case 'saddle':
      return { fxx: 2, fyy: -2, fxy: 0 }
  }
}

export function classifyCriticalPoint(
  gradient: Point2D,
  fxx: number,
  fyy: number,
  fxy: number,
): 'yerel minimum' | 'yerel maksimum' | 'eyer noktası' | 'kritik değil' | 'belirsiz' {
  const isCritical = Math.hypot(gradient.x, gradient.y) < 1e-6
  if (!isCritical) {
    return 'kritik değil'
  }

  const determinant = fxx * fyy - fxy ** 2
  if (determinant > 0 && fxx > 0) {
    return 'yerel minimum'
  }
  if (determinant > 0 && fxx < 0) {
    return 'yerel maksimum'
  }
  if (determinant < 0) {
    return 'eyer noktası'
  }
  return 'belirsiz'
}

export function getPolarRegionLabel(id: PolarRegionId): string {
  switch (id) {
    case 'disk':
      return 'Disk'
    case 'annulus':
      return 'Halka'
    case 'sector':
      return 'Sektör'
  }
}

export function polarRegionBounds(
  id: PolarRegionId,
): { rMin: number; rMax: number; thetaMin: number; thetaMax: number } {
  switch (id) {
    case 'disk':
      return { rMin: 0, rMax: 1.5, thetaMin: 0, thetaMax: 2 * Math.PI }
    case 'annulus':
      return { rMin: 0.7, rMax: 1.6, thetaMin: 0, thetaMax: 2 * Math.PI }
    case 'sector':
      return { rMin: 0, rMax: 2, thetaMin: 0, thetaMax: Math.PI / 2 }
  }
}

export function getPolarIntegrandLabel(id: PolarIntegrandId): string {
  switch (id) {
    case 'unit':
      return 'f(x,y) = 1'
    case 'radius':
      return 'f(x,y) = √(x²+y²)'
    case 'radial-square':
      return 'f(x,y) = x² + y²'
  }
}

export function evaluatePolarIntegrand(id: PolarIntegrandId, r: number): number {
  switch (id) {
    case 'unit':
      return 1
    case 'radius':
      return r
    case 'radial-square':
      return r ** 2
  }
}

export function exactPolarIntegral(
  regionId: PolarRegionId,
  integrandId: PolarIntegrandId,
): number {
  const bounds = polarRegionBounds(regionId)
  const angleSpan = bounds.thetaMax - bounds.thetaMin
  const primitivePower =
    integrandId === 'unit' ? 2 : integrandId === 'radius' ? 3 : 4
  const coefficient =
    integrandId === 'unit' ? 1 / 2 : integrandId === 'radius' ? 1 / 3 : 1 / 4

  return (
    angleSpan *
    coefficient *
    (bounds.rMax ** primitivePower - bounds.rMin ** primitivePower)
  )
}

export function polarSectorArea(rMid: number, deltaR: number, deltaTheta: number): number {
  return rMid * deltaR * deltaTheta
}

export function getLineIntegralCurveLabel(id: LineIntegralCurveId): string {
  switch (id) {
    case 'circle':
      return 'r(t) = <cos t, sin t>, t ∈ [0, 2π]'
    case 'parabola':
      return 'r(t) = <t, 0.5t²>, t ∈ [-1, 1]'
    case 'line':
      return 'r(t) = <-1 + 2t, 0.5 + 0.5t>, t ∈ [0, 1]'
  }
}

export function lineIntegralCurveRange(id: LineIntegralCurveId): [number, number] {
  switch (id) {
    case 'circle':
      return [0, 2 * Math.PI]
    case 'parabola':
      return [-1, 1]
    case 'line':
      return [0, 1]
  }
}

export function evaluateLineIntegralCurve(
  id: LineIntegralCurveId,
  t: number,
): Point2D {
  switch (id) {
    case 'circle':
      return { x: Math.cos(t), y: Math.sin(t) }
    case 'parabola':
      return { x: t, y: 0.5 * t ** 2 }
    case 'line':
      return { x: -1 + 2 * t, y: 0.5 + 0.5 * t }
  }
}

export function derivativeLineIntegralCurve(
  id: LineIntegralCurveId,
  t: number,
): Point2D {
  switch (id) {
    case 'circle':
      return { x: -Math.sin(t), y: Math.cos(t) }
    case 'parabola':
      return { x: 1, y: t }
    case 'line':
      return { x: 2, y: 0.5 }
  }
}

export function scalarFieldLabel(id: VectorFieldId): string {
  switch (id) {
    case 'radial':
      return 'g(x,y) = 1 + x² + y²'
    case 'rotation':
      return 'g(x,y) = 2 + x - y'
    case 'sink':
      return 'g(x,y) = 2.5 - 0.5x - 0.5y'
  }
}

export function evaluateScalarField(id: VectorFieldId, x: number, y: number): number {
  switch (id) {
    case 'radial':
      return 1 + x ** 2 + y ** 2
    case 'rotation':
      return 2 + x - y
    case 'sink':
      return 2.5 - 0.5 * x - 0.5 * y
  }
}
