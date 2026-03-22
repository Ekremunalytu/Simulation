export type SeededRandom = () => number

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function randomBetween(random: SeededRandom, min: number, max: number): number {
  return min + random() * (max - min)
}

export function randomInt(random: SeededRandom, min: number, max: number): number {
  return Math.floor(randomBetween(random, min, max + 1))
}

export function pickOne<T>(random: SeededRandom, items: T[]): T {
  return items[randomInt(random, 0, items.length - 1)] as T
}

export function shuffle<T>(random: SeededRandom, items: T[]): T[] {
  const clone = [...items]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, 0, index)
    const current = clone[index]
    clone[index] = clone[swapIndex] as T
    clone[swapIndex] = current as T
  }

  return clone
}
