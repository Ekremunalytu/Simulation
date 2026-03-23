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
    console.error(`${this.props.moduleTitle} için simülasyon render hatası`, error, errorInfo)
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
            Simülasyon Hatası
          </h4>
          <p className="text-sm text-on-surface mb-2">
            {this.props.moduleTitle} açılırken bir render hatası oluştu.
          </p>
          <p className="text-xs text-on-surface-variant">
            Parametreleri değiştirip yeniden dene veya başka bir modüle geç. Sayfa tamamen kapanmayacak şekilde bir yedek görünüm gösteriliyor.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
