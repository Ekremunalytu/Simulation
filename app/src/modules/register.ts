import { registerModule } from '../engine/registry'
import { decisionTreeModule } from './decision-tree'
import { gradientDescentModule } from './gradient-descent'
import { linearRegressionModule } from './linear-regression'

let registered = false

export function registerAllModules() {
  if (registered) {
    return
  }

  registerModule(gradientDescentModule)
  registerModule(linearRegressionModule)
  registerModule(decisionTreeModule)

  registered = true
}
