import { registerModule } from '../engine/registry'
import { arcLengthModule } from './arc-length'
import { backpropagationNetworkModule } from './backpropagation-network'
import { blindSearchModule } from './blind-search'
import { changeOfVariablesModule } from './change-of-variables'
import { decisionTreeModule } from './decision-tree'
import { derivativeLabModule } from './derivative-lab'
import { directionalDerivativeGradientModule } from './directional-derivative-gradient'
import { doubleIntegralModule } from './double-integral'
import { expertSystemInferenceModule } from './expert-system-inference'
import { extremaSecondDerivativeTestModule } from './extrema-second-derivative-test'
import { geneticAlgorithmModule } from './genetic-algorithm'
import { gradientDescentModule } from './gradient-descent'
import { heuristicSearchModule } from './heuristic-search'
import { improperIntegralsModule } from './improper-integrals'
import { integrationTechniquesModule } from './integration-techniques'
import { kMeansClusteringModule } from './k-means-clustering'
import { knnClassifierModule } from './knn-classifier'
import { limitExplorerModule } from './limit-explorer'
import { linearRegressionModule } from './linear-regression'
import { lineIntegralsModule } from './line-integrals'
import { localSearchModule } from './local-search'
import { minimaxAlphaBetaModule } from './minimax-alpha-beta'
import { multipleIntegralRegionsModule } from './multiple-integral-regions'
import { multivariableLimitPathsModule } from './multivariable-limit-paths'
import { multivariableSurfacesModule } from './multivariable-surfaces'
import { naiveBayesClassifierModule } from './naive-bayes-classifier'
import { partialDerivativesModule } from './partial-derivatives'
import { parametricCurvesModule } from './parametric-curves'
import { polarAreaModule } from './polar-area'
import { perceptronTrainerModule } from './perceptron-trainer'
import { qLearningGridworldModule } from './q-learning-gridworld'
import { quadricSurfacesModule } from './quadric-surfaces'
import { riemannIntegralModule } from './riemann-integral'
import { sequenceSeriesModule } from './sequence-series'
import { seriesTestsLabModule } from './series-tests-lab'
import { svmMarginExplorerModule } from './svm-margin-explorer'
import { taylorSeriesModule } from './taylor-series'
import { vectorFieldsModule } from './vector-fields'

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
  registerModule(expertSystemInferenceModule)
  registerModule(gradientDescentModule)
  registerModule(linearRegressionModule)
  registerModule(decisionTreeModule)
  registerModule(knnClassifierModule)
  registerModule(naiveBayesClassifierModule)
  registerModule(kMeansClusteringModule)
  registerModule(perceptronTrainerModule)
  registerModule(svmMarginExplorerModule)
  registerModule(backpropagationNetworkModule)
  registerModule(limitExplorerModule)
  registerModule(multivariableSurfacesModule)
  registerModule(quadricSurfacesModule)
  registerModule(multivariableLimitPathsModule)
  registerModule(derivativeLabModule)
  registerModule(riemannIntegralModule)
  registerModule(sequenceSeriesModule)
  registerModule(taylorSeriesModule)
  registerModule(partialDerivativesModule)
  registerModule(directionalDerivativeGradientModule)
  registerModule(extremaSecondDerivativeTestModule)
  registerModule(doubleIntegralModule)
  registerModule(integrationTechniquesModule)
  registerModule(improperIntegralsModule)
  registerModule(polarAreaModule)
  registerModule(changeOfVariablesModule)
  registerModule(parametricCurvesModule)
  registerModule(arcLengthModule)
  registerModule(lineIntegralsModule)
  registerModule(seriesTestsLabModule)
  registerModule(vectorFieldsModule)
  registerModule(multipleIntegralRegionsModule)

  registered = true
}
