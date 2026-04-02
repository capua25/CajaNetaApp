'use client'

// Semicircular gauge: 0% MS = left, 50% MS = right
// Zones: 0-10% red, 10-20% yellow, 20-50% green
// Gauge percentage = MS / 0.5 (maps 0–50% to 0–100% of gauge arc)

const CX = 100
const CY = 90
const R = 70
const SW = 16

function pt(pct: number) {
  const a = Math.PI * (1 - pct)
  return {
    x: +(CX + R * Math.cos(a)).toFixed(3),
    y: +(CY - R * Math.sin(a)).toFixed(3),
  }
}

// All arcs within a semicircle are ≤180° so largeArc is always 0.
// sweep=1 (clockwise) draws the upper arc from left to right.
function arc(fromPct: number, toPct: number): string {
  const s = pt(fromPct)
  const e = pt(toPct)
  return `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`
}

// Gauge zone boundaries (in gauge %, i.e. MS / 0.5)
// 10% MS → gauge 0.2 (20%)
// 20% MS → gauge 0.4 (40%)
const ZONES = [
  { from: 0, to: 0.2, color: '#fca5a5' },
  { from: 0.2, to: 0.4, color: '#fde68a' },
  { from: 0.4, to: 1, color: '#86efac' },
]

function valueColor(ms: number): string {
  if (ms > 0.2) return '#16a34a'
  if (ms >= 0.1) return '#d97706'
  return '#dc2626'
}

function statusLabel(ms: number): string {
  if (ms < 0) return 'Bajo el punto de equilibrio'
  if (ms > 0.2) return 'Zona segura — margen saludable'
  if (ms >= 0.1) return 'Margen ajustado — cuidado'
  return 'Zona de riesgo — muy cerca del límite'
}

export function SafetyGauge({
  margin_of_safety,
}: {
  margin_of_safety: number | null
}) {
  if (margin_of_safety === null) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-8">
        Sin datos suficientes
      </p>
    )
  }

  const gaugePct = Math.min(Math.max(margin_of_safety / 0.5, 0), 1)

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 98" className="w-full max-w-[300px]">
        {/* Zone background arcs */}
        {ZONES.map(({ from, to, color }) => (
          <path
            key={from}
            d={arc(from, to)}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="butt"
          />
        ))}

        {/* Value arc overlay (thinner, sits on top) */}
        {gaugePct > 0.005 && (
          <path
            d={arc(0, gaugePct)}
            fill="none"
            stroke={valueColor(margin_of_safety)}
            strokeWidth={SW - 6}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Numeric value */}
      <div className="text-center space-y-1">
        <p
          className="text-4xl font-bold tabular-nums"
          style={{ color: valueColor(margin_of_safety) }}
        >
          {(margin_of_safety * 100).toFixed(1)}%
        </p>
        <p className="text-sm text-muted-foreground">
          {statusLabel(margin_of_safety)}
        </p>
      </div>

      {/* Zone legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />
          0–10% riesgo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-300" />
          10–20% cuidado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400" />
          +20% seguro
        </span>
      </div>
    </div>
  )
}
