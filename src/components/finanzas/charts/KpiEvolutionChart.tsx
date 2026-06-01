'use client'

interface KpiPoint {
  date: string // ISO
  value: number | null
}

interface KpiEvolutionChartProps {
  title: string
  points: KpiPoint[] // orden cronológico ascendente
  formatValue: (v: number) => string
  higherIsBetter?: boolean
}

export function KpiEvolutionChart({
  title,
  points,
  formatValue,
  higherIsBetter = true,
}: KpiEvolutionChartProps) {
  const valid = points.filter((p) => p.value !== null) as Array<{
    date: string
    value: number
  }>

  if (valid.length < 2) {
    return (
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground italic">
          Necesitás al menos 2 snapshots con datos para ver la evolución.
        </p>
      </div>
    )
  }

  const width = 480
  const height = 140
  const padX = 8
  const padY = 12

  const values = valid.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const stepX = (width - padX * 2) / (valid.length - 1)

  const coords = valid.map((p, i) => {
    const x = padX + i * stepX
    const y = padY + (height - padY * 2) * (1 - (p.value - min) / range)
    return { x, y, value: p.value }
  })

  const path = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')

  const first = valid[0].value
  const last = valid[valid.length - 1].value
  const delta = last - first
  const deltaPct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span
          className={`text-xs font-medium ${
            delta === 0
              ? 'text-muted-foreground'
              : (higherIsBetter ? delta > 0 : delta < 0)
                ? 'text-emerald-600'
                : 'text-red-600'
          }`}
        >
          {delta === 0
            ? '—'
            : `${delta > 0 ? '▲' : '▼'} ${formatValue(Math.abs(delta))} (${deltaPct.toFixed(1)}%)`}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-emerald-500"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="2.5" className="fill-emerald-500" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(first)}</span>
        <span>{formatValue(last)}</span>
      </div>
    </div>
  )
}
