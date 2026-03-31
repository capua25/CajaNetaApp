import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import type { FinancialSummary } from '@/lib/types'

interface SummaryCardsProps {
  summary: FinancialSummary
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(value)
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
  children: React.ReactNode
}

function MetricCard({ title, tooltip, children }: MetricCardProps) {
  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          {title}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
            </Tooltip>
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

export function SummaryCards({ summary }: SummaryCardsProps) {
  const {
    total_fixed_costs_monthly,
    mc_mix,
    break_even_units,
    break_even_revenue,
    margin_of_safety,
    actual_revenue,
    has_quantity_data,
  } = summary

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* CF Mensual */}
      <MetricCard title="Costos Fijos Mensuales" tooltip="Gastos que pagás todos los meses sin importar cuánto vendés: alquiler, sueldos, servicios. Base para calcular tu punto de equilibrio.">
        {total_fixed_costs_monthly > 0 ? (
          <p className="text-2xl font-bold">{formatCurrency(total_fixed_costs_monthly)}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Ingresá tus costos fijos para ver el punto de equilibrio
          </p>
        )}
      </MetricCard>

      {/* MC Mix */}
      <MetricCard title="Margen de Contribución Mix" tooltip="Cuánto contribuye en promedio cada unidad vendida a cubrir tus costos fijos, ponderado por las cantidades de cada producto.">
        {mc_mix !== null ? (
          <p className="text-2xl font-bold">{formatCurrency(mc_mix)}</p>
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
      <MetricCard title="Punto de Equilibrio (unidades)" tooltip="Cantidad de unidades que tenés que vender para no ganar ni perder. Por debajo de este número estás perdiendo plata.">
        {break_even_units !== null ? (
          <p className="text-2xl font-bold">{formatNumber(break_even_units, 1)} u.</p>
        ) : (
          <NoData />
        )}
      </MetricCard>

      {/* Punto de Equilibrio (ingresos) */}
      <MetricCard title="Punto de Equilibrio (ingresos)" tooltip="Cuánta plata en ventas necesitás para cubrir exactamente todos tus costos.">
        {break_even_revenue !== null ? (
          <p className="text-2xl font-bold">{formatCurrency(break_even_revenue)}</p>
        ) : (
          <NoData />
        )}
      </MetricCard>

      {/* Ventas actuales vs equilibrio */}
      <MetricCard title="Ventas Actuales" tooltip="Total de ingresos estimados por mes según las unidades vendidas que ingresaste. Compará con el punto de equilibrio para saber si estás en zona segura.">
        {actual_revenue > 0 ? (
          <div>
            <p className="text-2xl font-bold">{formatCurrency(actual_revenue)}</p>
            {break_even_revenue !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Equilibrio: {formatCurrency(break_even_revenue)}
              </p>
            )}
          </div>
        ) : (
          <NoData />
        )}
      </MetricCard>

      {/* Margen de Seguridad */}
      <MetricCard title="Margen de Seguridad" tooltip="Cuánto pueden caer tus ventas antes de entrar en pérdida. Verde > 20%: estás bien. Amarillo 10–20%: cuidado. Rojo < 10%: zona de riesgo.">
        {margin_of_safety !== null ? (
          <p className={`text-2xl font-bold ${safetyMarginColor(margin_of_safety)}`}>
            {formatNumber(margin_of_safety * 100, 1)}%
          </p>
        ) : (
          <NoData />
        )}
      </MetricCard>
    </div>
  )
}
