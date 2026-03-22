import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { SimulationPage } from './pages/SimulationPage'

// Register all modules
import { registerModule } from './engine/registry'
import { gradientDescentModule } from './modules/gradient-descent'
import { linearRegressionModule } from './modules/linear-regression'
import { decisionTreeModule } from './modules/decision-tree'

registerModule(gradientDescentModule)
registerModule(linearRegressionModule)
registerModule(decisionTreeModule)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
