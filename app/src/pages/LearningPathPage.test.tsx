import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LearningPathPage } from './LearningPathPage'
import { registerAllModules } from '../modules/register'

registerAllModules()

describe('LearningPathPage', () => {
  it('renders the weekly study route alongside the dependency graph', () => {
    render(
      <MemoryRouter>
        <LearningPathPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /öğrenme haritası/i })).toBeInTheDocument()
    expect(screen.getByText(/haftalık çalışma rotası/i)).toBeInTheDocument()
    expect(screen.getByText(/matematik 2 haftalık akış/i)).toBeInTheDocument()
  })
})
