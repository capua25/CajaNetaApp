'use client'

import { cn } from '@/lib/utils'
import type { Currency } from '@/lib/types'

interface CurrencySelectorProps {
  id?: string
  value: Currency
  onChange: (value: Currency) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function CurrencySelector({
  id,
  value,
  onChange,
  label,
  disabled,
  className,
}: CurrencySelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        disabled={disabled}
        className={cn(
          'h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <option value="UYU">UYU — Peso uruguayo</option>
        <option value="USD">USD — Dólar estadounidense</option>
      </select>
    </div>
  )
}
