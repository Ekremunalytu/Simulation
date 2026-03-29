import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { SimulationPage } from './pages/SimulationPage'
import { registerAllModules } from './modules/register'

registerAllModules()

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sim/:moduleId" element={<SimulationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
