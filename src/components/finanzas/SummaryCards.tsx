'use client'

import { useState } from 'react'
import { Info, BarChart2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { MetricChartModal } from './MetricChartModal'
import type { MetricKey } from './MetricChartModal'
import type { FinancialSummary } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import type { Currency } from '@/lib/types'

interface SummaryCardsProps {
  summary: FinancialSummary
  currency: Currency
}

function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-UY', {
    maximumFractionDigits: decimals,
  }).format(value)
}

function safetyMarginColor(ms: number): string {
  if (ms > 0.2) return 'text-green-600'
  if (ms >= 0.1) return 'text-yellow-600'
  return 'text-red-600'
}

interface MetricCardProps {
  title: string
  tooltip?: string
  onClick?: () => void
  children: React.ReactNode
}

function MetricCard({ title, tooltip, onClick, children }: MetricCardProps) {
  const isClickable = Boolean(onClick)
  return (
    <Card
      className={`overflow-visible ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow group' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          {title}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info
                className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
          {isClickable && (
            <BarChart2 className="h-3.5 w-3.5 ml-auto text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function NoData() {
  return (
    <span className="text-sm text-muted-foreground italic">Sin datos suficientes</span>
  )
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey | null>(null)

  const {
    total_fixed_costs_monthly,
    mc_mix,
    break_even_units,
    break_even_revenue,
    margin_of_safety,
    actual_revenue,
    has_quantity_data,
    products,
  } = summary

  const total_net_profit = products.reduce((sum, p) => sum + (p.mc ?? 0) * p.quantity_sold, 0)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* CF Mensual — no chart, just a single number */}
        <MetricCard
          title="Costos Fijos Mensuales"
          tooltip="Gastos que pagás todos los meses sin importar cuánto vendés: alquiler, sueldos, servicios. Base para calcular tu punto de equilibrio."
        >
          {total_fixed_costs_monthly > 0 ? (
            <p className="text-2xl font-bold">{formatCurrency(total_fixed_costs_monthly, currency)}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Ingresá tus costos fijos para ver el punto de equilibrio
            </p>
          )}
        </MetricCard>

        {/* MC Mix */}
        <MetricCard
          title="Margen de Contribución Mix"
          tooltip="Cuánto contribuye en promedio cada unidad vendida a cubrir tus costos fijos, ponderado por las cantidades de cada producto."
          onClick={mc_mix !== null ? () => setActiveMetric('mc_mix') : undefined}
        >
          {mc_mix !== null ? (
            <p className="text-2xl font-bold">{formatCurrency(mc_mix, currency)}</p>
          ) : (
            <div>
              <NoData />
              {!has_quantity_data && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresá cantidades vendidas para ver el análisis
                </p>
              )}
            </div>
          )}
        </MetricCard>

        {/* Punto de Equilibrio (unidades) */}
        <MetricCard
          title="Punto de Equilibrio (unidades)"
          tooltip="Unidades totales que tenés que vender para cubrir tus costos fijos. Varía con el mix de ventas: si los productos que más vendés tienen menor margen de ganancia, necesitás vender más unidades para llegar al equilibrio."
          onClick={break_even_units !== null ? () => setActiveMetric('break_even_units') : undefined}
        >
          {break_even_units !== null ? (
            <p className="text-2xl font-bold">{formatNumber(break_even_units, 1)} u.</p>
          ) : (
            <NoData />
          )}
        </MetricCard>

        {/* Punto de Equilibrio (ingresos) */}
        <MetricCard
          title="Punto de Equilibrio (ingresos)"
          tooltip="Facturación mensual necesaria para cubrir todos tus costos. Varía con el mix de ventas: cada producto pesa diferente según su precio y margen de ganancia, por lo que vender más de uno que de otro mueve este número."
          onClick={break_even_revenue !== null ? () => setActiveMetric('break_even_revenue') : undefined}
        >
          {break_even_revenue !== null ? (
            <p className="text-2xl font-bold">{formatCurrency(break_even_revenue, currency)}</p>
          ) : (
            <NoData />
          )}
        </MetricCard>

        {/* Ventas Actuales */}
        <MetricCard
          title="Ventas Actuales"
          tooltip="Total de ingresos estimados por mes según las unidades vendidas que ingresaste. Compará con el punto de equilibrio para saber si estás en zona segura."
          onClick={actual_revenue > 0 && break_even_revenue !== null ? () => setActiveMetric('actual_revenue') : undefined}
        >
          {actual_revenue > 0 ? (
            <div>
              <p className="text-2xl font-bold">{formatCurrency(actual_revenue, currency)}</p>
              {break_even_revenue !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Equilibrio: {formatCurrency(break_even_revenue, currency)}
                </p>
              )}
            </div>
          ) : (
            <NoData />
          )}
        </MetricCard>

        {/* Ganancia Neta */}
        <MetricCard
          title="Ganancia Neta"
          tooltip="Suma de la ganancia de cada producto multiplicada por sus unidades vendidas. No incluye costos fijos."
        >
          {has_quantity_data ? (
            <p className={`text-2xl font-bold ${total_net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(total_net_profit)}
            </p>
          ) : (
            <NoData />
          )}
        </MetricCard>

        {/* Margen de Seguridad */}
        <MetricCard
          title="Margen de Seguridad"
          tooltip="Cuánto pueden caer tus ventas antes de entrar en pérdida. Verde > 20%: estás bien. Amarillo 10–20%: cuidado. Rojo < 10%: zona de riesgo."
          onClick={margin_of_safety !== null ? () => setActiveMetric('margin_of_safety') : undefined}
        >
          {margin_of_safety !== null ? (
            <p className={`text-2xl font-bold ${safetyMarginColor(margin_of_safety)}`}>
              {formatNumber(margin_of_safety * 100, 1)}%
            </p>
          ) : (
            <NoData />
          )}
        </MetricCard>
      </div>

      {has_quantity_data && (
        <p className="text-xs text-muted-foreground">
          Los puntos de equilibrio asumen que seguís vendiendo cada artículo en la misma proporción que el mix actual. Si vendés más de un producto que de otro, estos valores cambian. Si actualizás las cantidades, los valores se recalculan automáticamente.
        </p>
      )}

      <MetricChartModal
        summary={summary}
        metric={activeMetric}
        onClose={() => setActiveMetric(null)}
      />
    </>
  )
}
