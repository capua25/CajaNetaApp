import type { Plan } from './types'

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 1,
  plus: 200,
  pro: Infinity,
}

export interface PlanConfig {
  key: Plan
  label: string
  priceDisplay: string
  priceSuffix: string | null
  features: string[]
  summaryFeatures: string[]
  borderClass: string
  activeBorderClass: string
  activeLabelClass: string
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    key: 'free',
    label: 'Gratis',
    priceDisplay: '$0',
    priceSuffix: null,
    summaryFeatures: [
      '1 producto',
      'Ganancia real por producto',
      'Margen de ganancia en %',
      'Precio sugerido',
    ],
    features: [
      '1 producto',
      'Ganancia real por producto',
      'Margen de ganancia en %',
      'Precio sugerido',
    ],
    borderClass: '',
    activeBorderClass: 'border-2 border-gray-300',
    activeLabelClass: 'text-gray-500',
  },
  {
    key: 'plus',
    label: 'Plus',
    priceDisplay: 'UYU 199',
    priceSuffix: '/mes',
    summaryFeatures: [
      'Hasta 200 productos',
      'Ganancia real por producto',
      'Margen de ganancia en %',
      'Precio sugerido',
    ],
    features: [
      'Hasta 200 productos',
      'Ganancia real por producto',
      'Margen de ganancia en %',
      'Precio sugerido',
    ],
    borderClass: 'border-2 border-blue-200',
    activeBorderClass: 'border-2 border-blue-500',
    activeLabelClass: 'text-blue-600',
  },
  {
    key: 'pro',
    label: 'Pro',
    priceDisplay: 'UYU 450',
    priceSuffix: '/mes',
    summaryFeatures: [
      'Productos ilimitados',
      'Todo lo de Plus',
      'Finanzas avanzadas: punto de equilibrio, mix de productos y más',
    ],
    features: [
      'Productos ilimitados',
      'Ganancia real por producto',
      'Margen de ganancia en %',
      'Precio sugerido',
      'Punto de equilibrio (unidades e ingresos)',
      'Margen de seguridad',
      'Mix de productos y contribución marginal',
      'Gestión de costos fijos mensuales',
    ],
    borderClass: 'border-2 border-gray-900',
    activeBorderClass: 'border-2 border-green-500',
    activeLabelClass: 'text-green-600',
  },
]
