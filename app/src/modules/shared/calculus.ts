export interface SamplePoint {
  x: number
  y: number | null
}

export type AnalysisFunctionId = 'cubic' | 'sine' | 'exp'
export type IntegralFunctionId = 'parabola' | 'wave' | 'growth'
export type SurfaceId = 'paraboloid' | 'saddle' | 'wave'
export type VolumeSurfaceId = 'plane' | 'bowl' | 'ripple'

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
