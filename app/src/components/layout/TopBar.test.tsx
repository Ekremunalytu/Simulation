import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'
import { registerAllModules } from '../../modules/register'

registerAllModules()

function LocationProbe() {
  const location = useLocation()
  return <div>{location.pathname}</div>
}

describe('TopBar', () => {
  it('shows quick search results and navigates to the selected module', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <TopBar leftOffset={84} />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByRole('textbox', { name: /modül ara/i })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'svm' } })

    expect(screen.getByText(/svm marjin kaşifi/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/svm marjin kaşifi/i))

    expect(screen.getByText('/sim/svm-margin-explorer')).toBeInTheDocument()
  })

  it('supports keyboard navigation and renders a no-results state', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <TopBar leftOffset={84} />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByRole('textbox', { name: /modül ara/i })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'svm' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('/sim/svm-margin-explorer')).toBeInTheDocument()

    const nextInput = screen.getByRole('textbox', { name: /modül ara/i })
    fireEvent.focus(nextInput)
    fireEvent.change(nextInput, { target: { value: 'zzzz' } })

    expect(screen.getByText(/sonuç bulunamadı/i)).toBeInTheDocument()
  })
})
