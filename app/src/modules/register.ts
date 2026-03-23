import { registerModule } from '../engine/registry'
import { blindSearchModule } from './blind-search'
import { decisionTreeModule } from './decision-tree'
import { derivativeLabModule } from './derivative-lab'
import { doubleIntegralModule } from './double-integral'
import { geneticAlgorithmModule } from './genetic-algorithm'
import { gradientDescentModule } from './gradient-descent'
import { heuristicSearchModule } from './heuristic-search'
import { limitExplorerModule } from './limit-explorer'
import { linearRegressionModule } from './linear-regression'
import { localSearchModule } from './local-search'
import { minimaxAlphaBetaModule } from './minimax-alpha-beta'
import { partialDerivativesModule } from './partial-derivatives'
import { qLearningGridworldModule } from './q-learning-gridworld'
import { riemannIntegralModule } from './riemann-integral'
import { sequenceSeriesModule } from './sequence-series'
import { taylorSeriesModule } from './taylor-series'

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
  registerModule(limitExplorerModule)
  registerModule(derivativeLabModule)
  registerModule(riemannIntegralModule)
  registerModule(sequenceSeriesModule)
  registerModule(taylorSeriesModule)
  registerModule(partialDerivativesModule)
  registerModule(doubleIntegralModule)

  registered = true
}
