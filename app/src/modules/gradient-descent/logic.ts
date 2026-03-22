export interface GDPoint {
  x: number
  y: number
  loss: number
  iteration: number
}

// Simple quadratic loss: J(x,y) = x² + y²
export function lossFunction(x: number, y: number): number {
  return x * x + 3 * y * y + 0.5 * x * y
}

// Gradient of J(x,y)
export function gradient(x: number, y: number): [number, number] {
  const dx = 2 * x + 0.5 * y
  const dy = 6 * y + 0.5 * x
  return [dx, dy]
}

export function runGradientDescent(
  learningRate: number,
  iterations: number,
  startX: number,
  startY: number,
  momentum: boolean,
  stochastic: boolean
): GDPoint[] {
  const path: GDPoint[] = []
  let x = startX
  let y = startY
  let vx = 0
  let vy = 0
  const beta = 0.9

  for (let i = 0; i <= iterations; i++) {
    const loss = lossFunction(x, y)
    path.push({ x, y, loss, iteration: i })

    if (i === iterations) break

    let [dx, dy] = gradient(x, y)

    // Add noise for stochastic
    if (stochastic) {
      dx += (Math.random() - 0.5) * 0.5
      dy += (Math.random() - 0.5) * 0.5
    }

    if (momentum) {
      vx = beta * vx + (1 - beta) * dx
      vy = beta * vy + (1 - beta) * dy
      x -= learningRate * vx
      y -= learningRate * vy
    } else {
      x -= learningRate * dx
      y -= learningRate * dy
    }
  }

  return path
}

export function generateContourData(gridSize: number = 50, range: number = 4): { x: number; y: number; z: number }[] {
  const data: { x: number; y: number; z: number }[] = []
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = -range + (2 * range * i) / (gridSize - 1)
      const y = -range + (2 * range * j) / (gridSize - 1)
      data.push({ x, y, z: lossFunction(x, y) })
    }
  }
  return data
}
