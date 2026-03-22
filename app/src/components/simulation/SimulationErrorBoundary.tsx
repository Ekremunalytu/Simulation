import { Component, type ErrorInfo, type ReactNode } from 'react'

interface SimulationErrorBoundaryProps {
  children: ReactNode
  moduleTitle: string
  resetKey: string
}

interface SimulationErrorBoundaryState {
  hasError: boolean
}

export class SimulationErrorBoundary extends Component<
  SimulationErrorBoundaryProps,
  SimulationErrorBoundaryState
> {
  state: SimulationErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): SimulationErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Simulation render failed for ${this.props.moduleTitle}`, error, errorInfo)
  }

  componentDidUpdate(prevProps: SimulationErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10">
          <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">
            Simulation Error
          </h4>
          <p className="text-sm text-on-surface mb-2">
            {this.props.moduleTitle} acilirken bir render hatasi olustu.
          </p>
          <p className="text-xs text-on-surface-variant">
            Parametreleri degistirip yeniden dene veya baska bir module gec. Sayfa tamamen kapanmayacak sekilde fallback gosteriliyor.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
