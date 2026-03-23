import type { SVMSnapshot } from './logic'

export function boundarySeries(snapshot: SVMSnapshot, offset: number) {
  if (Math.abs(snapshot.w2) >= 0.0001) {
    return [-6, 6].map((x) => ({
      x,
      y: (offset - snapshot.bias - snapshot.w1 * x) / snapshot.w2,
    }))
  }

  if (Math.abs(snapshot.w1) < 0.0001) {
    return []
  }

  const x = (offset - snapshot.bias) / snapshot.w1

  return [
    { x, y: -6 },
    { x, y: 6 },
  ]
}
