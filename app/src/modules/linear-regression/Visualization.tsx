import { useMemo } from 'react'
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from 'recharts'
import { generateData, fitRegression } from './logic'

interface Props {
  params: Record<string, any>
}

export function LinearRegressionVisualization({ params }: Props) {
  const data = useMemo(
    () =>
      generateData(
        params.numPoints as number,
        params.trueSlope as number,
        params.trueIntercept as number,
        params.noise as number
      ),
    [params.numPoints, params.trueSlope, params.trueIntercept, params.noise]
  )

  const result = useMemo(() => fitRegression(data), [data])

  const composedData = data.map((p) => ({
    x: p.x,
    actual: p.y,
    predicted: result.slope * p.x + result.intercept,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline">Fitted</span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">R²</p>
            <p className="font-mono text-sm text-secondary">{result.rSquared.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Equation</p>
            <p className="font-mono text-sm text-primary">
              y = {result.slope.toFixed(2)}x + {result.intercept.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {/* Scatter + Regression Line */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Data & Regression Line
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composedData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter dataKey="actual" fill="#e0d0ff" r={4} name="Data" opacity={0.85} />
                <Line dataKey="predicted" stroke="#4cd7f6" strokeWidth={2.5} dot={false} name="Fit" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residuals — colored by sign */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Residuals</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.residuals}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <ReferenceLine y={0} stroke="#777" strokeDasharray="4 2" />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Bar dataKey="residual" name="Residual" opacity={0.85}>
                  {result.residuals.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.residual >= 0 ? '#b090ff' : '#4cd7f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
