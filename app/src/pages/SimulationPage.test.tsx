import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { registerAllModules } from '../modules/register'
import { getAllModules } from '../engine/registry'
import { SimulationPage } from './SimulationPage'

registerAllModules()
const registeredModules = getAllModules()

describe('SimulationPage', () => {
  it('shows playback controls for timeline modules together with learning panels', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/gradient-descent']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 1 \/ 101/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oynatmayı başlat/i })).toBeInTheDocument()
    expect(screen.getByText(/temel metrikler/i)).toBeInTheDocument()
    expect(screen.getByText(/çalışma notları/i)).toBeInTheDocument()
    expect(screen.getByText(/yönlendirilmiş deneyler/i)).toBeInTheDocument()
  })

  it('shows playback controls for linear regression timeline playback', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/linear-regression']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 1 \/ 29/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oynatmayı başlat/i })).toBeInTheDocument()
  })

  it('renders the structured theory panel for calculus modules', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/limit-explorer']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/teori ve formüller/i)).toBeInTheDocument()
    expect(screen.getByText(/sembol sözlüğü/i)).toBeInTheDocument()
    expect(screen.getByText(/türetim akışı/i)).toBeInTheDocument()
  })

  it('shows playback controls for the timeline-based limit explorer', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/limit-explorer']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 1 \/ 6/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oynatmayı başlat/i })).toBeInTheDocument()
  })

  it('shows playback controls for partial derivatives finite-difference steps', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/partial-derivatives']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 1 \/ 5/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oynatmayı başlat/i })).toBeInTheDocument()
  })

  it('keeps the legacy formula panel working for older modules', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/gradient-descent']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /güncelleme kuralı/i })).toBeInTheDocument()
    expect(screen.queryByText(/teori ve formüller/i)).not.toBeInTheDocument()
  })

  it.each(registeredModules.map((module) => [module.id, module.title] as const))(
    'renders module route without falling back for %s',
    async (moduleId, moduleTitle) => {
      render(
        <MemoryRouter initialEntries={[`/sim/${moduleId}`]}>
          <Routes>
            <Route path="/sim/:moduleId" element={<SimulationPage />} />
          </Routes>
        </MemoryRouter>,
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: new RegExp(moduleTitle, 'i') }),
      ).toBeInTheDocument()
      expect(screen.queryByText(/simülasyon hatası/i)).not.toBeInTheDocument()
    },
  )
})
