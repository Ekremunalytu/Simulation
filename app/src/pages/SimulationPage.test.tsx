import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { registerAllModules } from '../modules/register'
import { getAllModules } from '../engine/registry'
import { SimulationPage } from './SimulationPage'

registerAllModules()
const registeredModules = getAllModules()
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
    expect(screen.getByText(/öğrenme yolu/i)).toBeInTheDocument()
    expect(screen.getByText(/öğrenme hedefleri/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^öğrenme$/i }))
    expect(await screen.findByText(/çalışma notları/i)).toBeInTheDocument()
    expect(await screen.findByText(/yönlendirilmiş deneyler/i)).toBeInTheDocument()
  })

  it('renders checkpoint and challenge panels for modules that define learning metadata', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/transformer-attention-playground']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: /^öğrenme$/i }))
    expect(await screen.findByText(/checkpoint soruları/i)).toBeInTheDocument()
    expect(await screen.findByText(/challenge mode/i)).toBeInTheDocument()
  })

  it('opens threshold-based fairness modules on the selected cutoff frame', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/bias-fairness-explorer?threshold=0.58&scenario=loan-approval&fairnessAdjustment=false']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 3 \/ 5/i)).toBeInTheDocument()
    expect(screen.getAllByText(/threshold 0\.58/i).length).toBeGreaterThan(0)
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

  it('shows sync status instead of the legacy run button', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/gradient-descent']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findAllByText(/^hazır$/i)).not.toHaveLength(0)
    expect(screen.queryByRole('button', { name: /simülasyonu çalıştır/i })).not.toBeInTheDocument()
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

  it('shows playback controls for a newly added phase-1 calculus module', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/integration-techniques']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/adım 1 \/ 4/i)).toBeInTheDocument()
    expect(screen.getByText(/teori ve formüller/i)).toBeInTheDocument()
  })

  it('renders a new multivariable limit module with theory and playback', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/multivariable-limit-paths']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('İki Değişkenli Limit Yolları')
    expect(screen.getByText(/teori ve formüller/i)).toBeInTheDocument()
    expect(screen.getByText(/adım 1 \/ 6/i)).toBeInTheDocument()
  })

  it('renders the vector fields module with playback controls', async () => {
    render(
      <MemoryRouter initialEntries={['/sim/vector-fields']}>
        <Routes>
          <Route path="/sim/:moduleId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { level: 1, name: /vektör alanları/i })).toBeInTheDocument()
    expect(screen.getByText(/adım 1 \/ 25/i)).toBeInTheDocument()
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
        await screen.findByRole('heading', {
          level: 1,
          name: new RegExp(escapeRegExp(moduleTitle), 'i'),
        }),
      ).toBeInTheDocument()
      expect(screen.queryByText(/simülasyon hatası/i)).not.toBeInTheDocument()
    },
  )
})
