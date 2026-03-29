import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Dashboard } from './Dashboard'
import { registerAllModules } from '../modules/register'

registerAllModules()

describe('Dashboard', () => {
  it('renders the featured module based on metadata instead of list order fallback', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getByText(/öne çıkan/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Gradient Descent: Loss Surface Optimization' }),
    ).toBeInTheDocument()
  })

  it('filters modules by search query across metadata-backed catalog fields', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByRole('textbox', { name: /katalog araması/i }), {
      target: { value: 'jacobian' },
    })

    expect(screen.getAllByText(/değişken dönüşümü ve jacobian/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/1 görünür modül/i)).toBeInTheDocument()
  })

  it('shows an empty state for course filters without modules', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'database' },
    })

    expect(screen.getByText(/veri tabanı modülleri yolda/i)).toBeInTheDocument()
  })

  it('can collapse and reopen only the filter controls', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /filtreleri daralt/i }))

    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: /katalog araması/i })).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { level: 2, name: 'Gradient Descent: Loss Surface Optimization' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /filtreleri aç/i }))

    expect(screen.getByRole('textbox', { name: /katalog araması/i })).toBeInTheDocument()
  })

  it('renders weekly syllabus links and planned-course placeholders', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /öğrenme haritasını aç/i })).toBeInTheDocument()
    expect(screen.getByText(/yapay zeka haftalık akış/i)).toBeInTheDocument()
    expect(screen.getByText(/b\+ tree ve hash index karşılaştırmaları/i)).toBeInTheDocument()
    expect(screen.getAllByText(/çalışma notu odaklı bir durak planlandı/i).length).toBeGreaterThan(0)
  })
})
