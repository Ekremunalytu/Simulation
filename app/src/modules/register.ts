import { registerModule } from '../engine/registry'
import { blindSearchModule } from './blind-search'
import { decisionTreeModule } from './decision-tree'
import { geneticAlgorithmModule } from './genetic-algorithm'
import { gradientDescentModule } from './gradient-descent'
import { heuristicSearchModule } from './heuristic-search'
import { linearRegressionModule } from './linear-regression'
import { localSearchModule } from './local-search'
import { minimaxAlphaBetaModule } from './minimax-alpha-beta'
import { qLearningGridworldModule } from './q-learning-gridworld'

let registered = false

export function registerAllModules() {
  if (registered) {
    return
  }

  registerModule(blindSearchModule)
  registerModule(heuristicSearchModule)
  registerModule(localSearchModule)
  registerModule(geneticAlgorithmModule)
  registerModule(minimaxAlphaBetaModule)
  registerModule(qLearningGridworldModule)
  registerModule(gradientDescentModule)
  registerModule(linearRegressionModule)
  registerModule(decisionTreeModule)

  registered = true
}
