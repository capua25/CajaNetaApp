'use client'

import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'
import { KpiEvolutionChart } from '@/components/finanzas/charts/KpiEvolutionChart'
import type { FinanzasSnapshot, Currency } from '@/lib/types'

interface SnapshotHistoryProps {
  initialSnapshots: FinanzasSnapshot[]
  defaultFrom: string // yyyy-mm-dd
  defaultTo: string // yyyy-mm-dd
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SnapshotHistory({
  initialSnapshots,
  defaultFrom,
  defaultTo,
}: SnapshotHistoryProps) {
  const [snapshots, setSnapshots] = useState<FinanzasSnapshot[]>(initialSnapshots)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function applyFilter() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/finanzas/snapshots?${params.toString()}`)
      if (!res.ok) throw new Error('No se pudieron cargar los snapshots')
      const data = (await res.json()) as FinanzasSnapshot[]
      setSnapshots(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este snapshot? No se puede deshacer.')) return
    setError(null)
    try {
      const res = await fetch(`/api/finanzas/snapshots/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 204) throw new Error('No se pudo eliminar')
      setSnapshots((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    }
  }

  // los gráficos necesitan orden cronológico ascendente
  const chrono = [...snapshots].reverse()
  const currency: Currency = snapshots[0]?.display_currency ?? 'UYU'

  return (
    <div className="space-y-8">
      {/* Filtro de rango */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="from" className="text-sm font-medium">
            Desde
          </label>
          <input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-sm font-medium">
            Hasta
          </label>
          <input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button size="sm" onClick={applyFilter} disabled={loading}>
          {loading ? 'Cargando...' : 'Filtrar'}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {snapshots.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-8 text-center">
          No hay snapshots en este rango. Guardá uno desde Finanzas Avanzadas.
        </p>
      ) : (
        <>
          {/* Gráficos de evolución */}
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiEvolutionChart
              title="Punto de equilibrio (ingresos)"
              points={chrono.map((s) => ({
                date: s.created_at,
                value: s.break_even_revenue,
              }))}
              formatValue={(v) => formatCurrency(v, currency)}
              higherIsBetter={false}
            />
            <KpiEvolutionChart
              title="Ventas actuales"
              points={chrono.map((s) => ({
                date: s.created_at,
                value: s.actual_revenue,
              }))}
              formatValue={(v) => formatCurrency(v, currency)}
            />
            <KpiEvolutionChart
              title="Ganancia neta"
              points={chrono.map((s) => ({
                date: s.created_at,
                value: s.net_profit,
              }))}
              formatValue={(v) => formatCurrency(v, currency)}
            />
            <KpiEvolutionChart
              title="Margen de seguridad"
              points={chrono.map((s) => ({
                date: s.created_at,
                value: s.margin_of_safety,
              }))}
              formatValue={(v) => `${(v * 100).toFixed(1)}%`}
            />
          </div>

          {/* Tabla cronológica */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Nota</th>
                  <th className="px-3 py-2 font-medium text-right">PE ingresos</th>
                  <th className="px-3 py-2 font-medium text-right">Ventas</th>
                  <th className="px-3 py-2 font-medium text-right">Ganancia</th>
                  <th className="px-3 py-2 font-medium text-right">Margen seg.</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <Fragment key={s.id}>
                    <tr className="border-t">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {s.note ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {s.break_even_revenue !== null
                          ? formatCurrency(s.break_even_revenue, s.display_currency)
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(s.actual_revenue, s.display_currency)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(s.net_profit, s.display_currency)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {s.margin_of_safety !== null
                          ? `${(s.margin_of_safety * 100).toFixed(1)}%`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            setExpanded(expanded === s.id ? null : s.id)
                          }
                          className="text-xs text-primary hover:underline mr-3"
                        >
                          {expanded === s.id ? 'Ocultar' : 'Detalle'}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                    {expanded === s.id && (
                      <tr className="border-t bg-muted/30">
                        <td colSpan={7} className="px-3 py-3">
                          <SnapshotDetailView snapshot={s} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function formatSnapshotNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-UY', {
    maximumFractionDigits: decimals,
  }).format(value)
}

function SnapshotDetailView({ snapshot }: { snapshot: FinanzasSnapshot }) {
  const { detail, display_currency } = snapshot

  const kpis: { label: string; value: string }[] = [
    {
      label: 'Costos Fijos Mensuales',
      value: formatCurrency(snapshot.total_fixed_costs_monthly, display_currency),
    },
    {
      label: 'Margen de Contribución Mix',
      value:
        snapshot.mc_mix !== null
          ? formatCurrency(snapshot.mc_mix, display_currency)
          : '—',
    },
    {
      label: 'Ratio de Contribución Mix',
      value:
        snapshot.rc_mix !== null
          ? `${formatSnapshotNumber(snapshot.rc_mix * 100, 1)}%`
          : '—',
    },
    {
      label: 'Punto de Equilibrio (unidades)',
      value:
        snapshot.break_even_units !== null
          ? `${formatSnapshotNumber(Math.ceil(snapshot.break_even_units), 0)} u.`
          : '—',
    },
    {
      label: 'Punto de Equilibrio (ingresos)',
      value:
        snapshot.break_even_revenue !== null
          ? formatCurrency(snapshot.break_even_revenue, display_currency)
          : '—',
    },
    {
      label: 'Ventas Actuales',
      value: formatCurrency(snapshot.actual_revenue, display_currency),
    },
    {
      label: 'Ganancia Neta',
      value: formatCurrency(snapshot.net_profit, display_currency),
    },
    {
      label: 'Margen de Seguridad',
      value:
        snapshot.margin_of_safety !== null
          ? `${formatSnapshotNumber(snapshot.margin_of_safety * 100, 1)}%`
          : '—',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Estadísticas del snapshot */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
          Estadísticas
        </h4>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5 sm:grid-cols-4">
          {kpis.map(({ label, value }) => (
            <li key={label} className="text-xs flex justify-between gap-2">
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums font-medium">{value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
          Productos
        </h4>
        {detail.products.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Sin productos.</p>
        ) : (
          <ul className="space-y-0.5">
            {detail.products.map((p) => (
              <li key={p.id} className="text-xs flex justify-between">
                <span>
                  {p.name} · {p.quantity_sold} u.
                </span>
                <span className="tabular-nums">
                  MC{' '}
                  {p.mc !== null ? formatCurrency(p.mc, display_currency) : '—'} ·
                  Ingresos {formatCurrency(p.revenue, display_currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
          Costos fijos
        </h4>
        {detail.fixed_costs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Sin costos fijos.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {detail.fixed_costs.map((c) => (
              <li key={c.id} className="text-xs flex justify-between">
                <span>
                  {c.name} ({c.recurrence === 'monthly' ? 'mensual' : 'anual'})
                </span>
                <span className="tabular-nums">
                  {formatCurrency(c.amount, c.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
