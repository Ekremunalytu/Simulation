import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { registerAllModules } from '../modules/register'
import { SimulationPage } from './SimulationPage'

describe('SimulationPage', () => {
  beforeAll(() => {
    registerAllModules()
  })

  it('shows playback controls for timeline modules together with learning panels', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/gradient-descent']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/step 1 \/ 101/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play playback/i })).toBeInTheDocument()
    expect(screen.getByText(/key metrics/i)).toBeInTheDocument()
    expect(screen.getByText(/study notes/i)).toBeInTheDocument()
    expect(screen.getByText(/guided experiments/i)).toBeInTheDocument()
  })

  it('shows playback controls for linear regression timeline playback', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/linear-regression']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/step 1 \/ 29/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play playback/i })).toBeInTheDocument()
  })
})
