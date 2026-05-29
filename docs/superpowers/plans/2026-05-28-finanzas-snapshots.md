# Snapshots de Finanzas Avanzadas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al usuario Pro guardar snapshots históricos de la vista de finanzas avanzadas y consultarlos en una vista nueva con filtro por rango de fechas, tabla y gráficos de evolución.

**Architecture:** Aditivo sobre el módulo de finanzas existente. Una tabla `finanzas_snapshots` (KPIs como columnas + detalle JSONB). El snapshot lo arma el server recalculando con `buildFinancialSummaryInCurrency` (no confía en el cliente). Frontend: botón con modal en `finanzas`, página nueva `finanzas/historial` con tabla + gráficos SVG. Todo Pro-only.

**Tech Stack:** Next.js 16 (App Router, RSC), Supabase (Postgres + RLS), TypeScript, Base UI (Dialog), Tailwind. Sin librería de charts (SVG/CSS puro). Sin librería de toast (feedback inline). Sin tests automatizados — verificación por QA manual (convención del proyecto).

**Verificación por tarea:** después de cada cambio de código correr `npx tsc --noEmit` (typecheck, NO es build) y `pnpm lint`. No correr `next build`.

---

### Task 1: Migración de base de datos

**Files:**
- Create: `supabase/migrations/009_finanzas_snapshots.sql`

- [ ] **Step 1: Crear la migración**

```sql
-- Migration: 009_finanzas_snapshots
-- Stores point-in-time snapshots of the advanced finance view:
-- KPIs as queryable columns + product/fixed-cost detail as JSONB.

CREATE TABLE IF NOT EXISTS public.finanzas_snapshots (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note                        TEXT CHECK (note IS NULL OR char_length(note) <= 200),
  display_currency            TEXT NOT NULL CHECK (display_currency IN ('UYU', 'USD')),
  usd_to_uyu_rate             NUMERIC NOT NULL CHECK (usd_to_uyu_rate > 0),
  total_fixed_costs_monthly   NUMERIC NOT NULL DEFAULT 0,
  mc_mix                      NUMERIC,
  rc_mix                      NUMERIC,
  break_even_units            NUMERIC,
  break_even_revenue          NUMERIC,
  margin_of_safety            NUMERIC,
  actual_revenue              NUMERIC NOT NULL DEFAULT 0,
  net_profit                  NUMERIC NOT NULL DEFAULT 0,
  has_quantity_data           BOOLEAN NOT NULL DEFAULT FALSE,
  detail                      JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS finanzas_snapshots_user_created_idx
  ON public.finanzas_snapshots (user_id, created_at DESC);

ALTER TABLE public.finanzas_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own snapshots"
  ON public.finanzas_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own snapshots"
  ON public.finanzas_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own snapshots"
  ON public.finanzas_snapshots FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 2: Aplicar la migración en Supabase**

Correr el SQL en el editor SQL de Supabase (o el flujo de migraciones del proyecto). Verificar que la tabla `finanzas_snapshots` aparece con RLS habilitado.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/009_finanzas_snapshots.sql
git commit -m "feat(snapshots): migración 009 tabla finanzas_snapshots con RLS"
```

---

### Task 2: Tipos TypeScript

**Files:**
- Modify: `src/lib/types.ts` (agregar al final del archivo)

- [ ] **Step 1: Agregar las interfaces de snapshot**

Agregá al final de `src/lib/types.ts`:

```typescript
export interface SnapshotFixedCostDetail {
  id: string
  name: string
  amount: number
  recurrence: Recurrence
  currency: Currency
}

export interface SnapshotDetail {
  products: ProductWithMix[]
  fixed_costs: SnapshotFixedCostDetail[]
}

export interface FinanzasSnapshot {
  id: string
  user_id: string
  created_at: string
  note: string | null
  display_currency: Currency
  usd_to_uyu_rate: number
  total_fixed_costs_monthly: number
  mc_mix: number | null
  rc_mix: number | null
  break_even_units: number | null
  break_even_revenue: number | null
  margin_of_safety: number | null
  actual_revenue: number
  net_profit: number
  has_quantity_data: boolean
  detail: SnapshotDetail
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(snapshots): tipos FinanzasSnapshot y SnapshotDetail"
```

---

### Task 3: Helper de armado de snapshot

**Files:**
- Create: `src/lib/snapshots.ts`

- [ ] **Step 1: Crear el helper**

`src/lib/snapshots.ts`:

```typescript
import type {
  FinancialSummary,
  Currency,
  Recurrence,
  SnapshotDetail,
} from '@/lib/types'

/**
 * Ganancia neta: suma de la ganancia de cada producto por sus unidades vendidas.
 * Réplica del cálculo del cliente en SummaryCards (no incluye costos fijos).
 */
export function calcNetProfit(summary: FinancialSummary): number {
  return summary.products.reduce(
    (sum, p) => sum + (p.mc ?? 0) * p.quantity_sold,
    0
  )
}

export interface SnapshotInsert {
  user_id: string
  note: string | null
  display_currency: Currency
  usd_to_uyu_rate: number
  total_fixed_costs_monthly: number
  mc_mix: number | null
  rc_mix: number | null
  break_even_units: number | null
  break_even_revenue: number | null
  margin_of_safety: number | null
  actual_revenue: number
  net_profit: number
  has_quantity_data: boolean
  detail: SnapshotDetail
}

export function buildSnapshotInsert(params: {
  userId: string
  summary: FinancialSummary
  fixedCosts: Array<{
    id: string
    name: string
    amount: number
    recurrence: Recurrence
    currency: Currency
  }>
  displayCurrency: Currency
  usdToUyuRate: number
  note: string | null
}): SnapshotInsert {
  const { userId, summary, fixedCosts, displayCurrency, usdToUyuRate, note } =
    params
  return {
    user_id: userId,
    note,
    display_currency: displayCurrency,
    usd_to_uyu_rate: usdToUyuRate,
    total_fixed_costs_monthly: summary.total_fixed_costs_monthly,
    mc_mix: summary.mc_mix,
    rc_mix: summary.rc_mix,
    break_even_units: summary.break_even_units,
    break_even_revenue: summary.break_even_revenue,
    margin_of_safety: summary.margin_of_safety,
    actual_revenue: summary.actual_revenue,
    net_profit: calcNetProfit(summary),
    has_quantity_data: summary.has_quantity_data,
    detail: {
      products: summary.products,
      fixed_costs: fixedCosts.map((c) => ({
        id: c.id,
        name: c.name,
        amount: c.amount,
        recurrence: c.recurrence,
        currency: c.currency,
      })),
    },
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/snapshots.ts
git commit -m "feat(snapshots): helper buildSnapshotInsert + calcNetProfit"
```

---

### Task 4: API route POST + GET

**Files:**
- Create: `src/app/api/finanzas/snapshots/route.ts`

- [ ] **Step 1: Crear el route handler**

`src/app/api/finanzas/snapshots/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildFinancialSummaryInCurrency } from '@/lib/finanzas'
import { buildSnapshotInsert } from '@/lib/snapshots'
import { getUsdToUyuRate } from '@/lib/exchange-rate'
import { isCurrency, type Currency } from '@/lib/currency'
import type { FixedCost, UserProfile } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan, display_currency')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Pick<UserProfile, 'plan' | 'display_currency'> | null
  if (userProfile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const rawNote = body?.note
  let note: string | null = null
  if (rawNote !== undefined && rawNote !== null && rawNote !== '') {
    if (typeof rawNote !== 'string' || rawNote.length > 200) {
      return NextResponse.json({ error: 'Invalid note' }, { status: 400 })
    }
    note = rawNote.trim()
  }

  const displayCurrency: Currency = isCurrency(userProfile.display_currency)
    ? userProfile.display_currency
    : 'UYU'

  const [
    { data: products, error: productsError },
    { data: fixedCosts, error: costsError },
    rateInfo,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, cost, expenses, quantity_sold, currency')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getUsdToUyuRate(user.id),
  ])

  if (productsError) {
    console.error('[snapshots] DB error (products):', productsError.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
  if (costsError) {
    console.error('[snapshots] DB error (fixed-costs):', costsError.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  const typedFixedCosts = (fixedCosts ?? []) as FixedCost[]

  const summary = buildFinancialSummaryInCurrency(
    (products ?? []) as Array<{
      id: string
      name: string
      price: number
      cost: number
      expenses: number
      quantity_sold: number
      currency: Currency
    }>,
    typedFixedCosts,
    displayCurrency,
    rateInfo.rate
  )

  const insertPayload = buildSnapshotInsert({
    userId: user.id,
    summary,
    fixedCosts: typedFixedCosts,
    displayCurrency,
    usdToUyuRate: rateInfo.rate,
    note,
  })

  const { data: snapshot, error } = await supabase
    .from('finanzas_snapshots')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('[snapshots] DB error (insert):', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(snapshot, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('finanzas_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (from) {
    const fromDate = new Date(from)
    if (Number.isNaN(fromDate.getTime())) {
      return NextResponse.json({ error: 'Invalid from date' }, { status: 400 })
    }
    query = query.gte('created_at', fromDate.toISOString())
  }
  if (to) {
    const toDate = new Date(to)
    if (Number.isNaN(toDate.getTime())) {
      return NextResponse.json({ error: 'Invalid to date' }, { status: 400 })
    }
    toDate.setHours(23, 59, 59, 999)
    query = query.lte('created_at', toDate.toISOString())
  }

  const { data: snapshots, error } = await query

  if (error) {
    console.error('[snapshots] DB error (list):', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json(snapshots, {
    headers: { 'Cache-Control': 'private, max-age=30' },
  })
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/finanzas/snapshots/route.ts
git commit -m "feat(snapshots): API POST/GET de snapshots Pro-only"
```

---

### Task 5: API route DELETE

**Files:**
- Create: `src/app/api/finanzas/snapshots/[id]/route.ts`

- [ ] **Step 1: Crear el route handler de borrado**

`src/app/api/finanzas/snapshots/[id]/route.ts` (Next 16: `params` es `Promise`):

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { error } = await supabase
    .from('finanzas_snapshots')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[snapshots] DB error (delete):', error.message)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
```

- [ ] **Step 2: Verificar firma de params contra el patrón existente**

Abrir `src/app/api/products/[id]/route.ts` y confirmar que la firma de `params` coincide (Next 16 usa `params: Promise<{ id: string }>` + `await params`). Si el patrón del proyecto difiere, ajustá esta firma para que coincida.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/finanzas/snapshots/[id]/route.ts"
git commit -m "feat(snapshots): API DELETE de snapshot con ownership check"
```

---

### Task 6: Componente SnapshotButton

**Files:**
- Create: `src/components/finanzas/SnapshotButton.tsx`

- [ ] **Step 1: Crear el botón con modal**

`src/components/finanzas/SnapshotButton.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SnapshotButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/finanzas/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'No se pudo guardar el snapshot')
      }
      setSuccess(true)
      setNote('')
      router.refresh()
      window.setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Guardar snapshot
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && !saving) setOpen(o)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar snapshot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Guardá una foto de tus finanzas actuales para verla en el histórico.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="snapshot-note" className="text-sm font-medium">
                Nota (opcional)
              </label>
              <input
                id="snapshot-note"
                type="text"
                value={note}
                maxLength={200}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Cierre de marzo"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-600">¡Snapshot guardado!</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/finanzas/SnapshotButton.tsx
git commit -m "feat(snapshots): componente SnapshotButton con modal y nota opcional"
```

---

### Task 7: Montar botón + link en la página de finanzas

**Files:**
- Modify: `src/app/(authenticated)/dashboard/finanzas/page.tsx`

- [ ] **Step 1: Agregar el import**

En `src/app/(authenticated)/dashboard/finanzas/page.tsx`, agregá junto a los imports de componentes de finanzas:

```typescript
import { SnapshotButton } from '@/components/finanzas/SnapshotButton'
```

- [ ] **Step 2: Reemplazar el bloque del header**

Reemplazá este bloque existente:

```tsx
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas Avanzadas</h1>
          <p className="text-gray-500 text-sm mt-1">{user!.email}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Mis productos</Button>
        </Link>
      </div>
```

por:

```tsx
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas Avanzadas</h1>
          <p className="text-gray-500 text-sm mt-1">{user!.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <SnapshotButton />
          <Link href="/dashboard/finanzas/historial">
            <Button variant="outline" size="sm">Ver histórico</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Mis productos</Button>
          </Link>
        </div>
      </div>
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(authenticated)/dashboard/finanzas/page.tsx"
git commit -m "feat(snapshots): montar SnapshotButton y link a histórico en finanzas"
```

---

### Task 8: Componente KpiEvolutionChart (gráfico SVG)

**Files:**
- Create: `src/components/finanzas/charts/KpiEvolutionChart.tsx`

- [ ] **Step 1: Crear el gráfico de línea SVG**

`src/components/finanzas/charts/KpiEvolutionChart.tsx`:

```typescript
'use client'

interface KpiPoint {
  date: string // ISO
  value: number | null
}

interface KpiEvolutionChartProps {
  title: string
  points: KpiPoint[] // orden cronológico ascendente
  formatValue: (v: number) => string
}

export function KpiEvolutionChart({
  title,
  points,
  formatValue,
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
            delta >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {delta >= 0 ? '▲' : '▼'} {formatValue(Math.abs(delta))} (
          {deltaPct.toFixed(1)}%)
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
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/finanzas/charts/KpiEvolutionChart.tsx
git commit -m "feat(snapshots): gráfico SVG KpiEvolutionChart de evolución de KPIs"
```

---

### Task 9: Componente SnapshotHistory (tabla + filtro + charts)

**Files:**
- Create: `src/components/finanzas/SnapshotHistory.tsx`

- [ ] **Step 1: Crear el componente de histórico**

`src/components/finanzas/SnapshotHistory.tsx`:

```typescript
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

function SnapshotDetailView({ snapshot }: { snapshot: FinanzasSnapshot }) {
  const { detail, display_currency } = snapshot
  return (
    <div className="space-y-4">
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
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/finanzas/SnapshotHistory.tsx
git commit -m "feat(snapshots): SnapshotHistory con filtro de fechas, tabla y gráficos"
```

---

### Task 10: Página de histórico (RSC)

**Files:**
- Create: `src/app/(authenticated)/dashboard/finanzas/historial/page.tsx`

- [ ] **Step 1: Crear la página**

`src/app/(authenticated)/dashboard/finanzas/historial/page.tsx`:

```typescript
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCachedUser } from '@/lib/supabase/get-user'
import { Button } from '@/components/ui/button'
import { SnapshotHistory } from '@/components/finanzas/SnapshotHistory'
import type { FinanzasSnapshot, UserProfile } from '@/lib/types'

export default async function HistorialPage() {
  const user = await getCachedUser()
  const userId = user!.id

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  const userProfile = profile as Pick<UserProfile, 'plan'> | null
  if (userProfile?.plan !== 'pro') redirect('/pricing')

  // Rango por defecto: últimos 30 días
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const defaultFrom = thirtyDaysAgo.toISOString().slice(0, 10)
  const defaultTo = now.toISOString().slice(0, 10)

  const { data: snapshots } = await supabase
    .from('finanzas_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Finanzas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Registro de tus snapshots guardados
          </p>
        </div>
        <Link href="/dashboard/finanzas">
          <Button variant="outline" size="sm">
            Volver a finanzas
          </Button>
        </Link>
      </div>

      <SnapshotHistory
        initialSnapshots={(snapshots ?? []) as FinanzasSnapshot[]}
        defaultFrom={defaultFrom}
        defaultTo={defaultTo}
      />
    </main>
  )
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(authenticated)/dashboard/finanzas/historial/page.tsx"
git commit -m "feat(snapshots): página RSC de histórico de finanzas Pro-only"
```

---

### Task 11: QA manual

No hay tests automatizados (convención del proyecto). Verificá manualmente con `pnpm dev`, logueado como usuario **Pro**:

- [ ] **Guardar snapshot**: en `/dashboard/finanzas`, click "Guardar snapshot" → modal abre → escribir nota → "Guardar" → mensaje de éxito → modal cierra.
- [ ] **Sin nota**: guardar un snapshot dejando la nota vacía → se guarda igual (nota `—` en la tabla).
- [ ] **Ver histórico**: click "Ver histórico" → navega a `/dashboard/finanzas/historial` → aparece el/los snapshots guardados.
- [ ] **Valores fieles**: comparar los KPIs de la tabla del histórico contra lo que muestra `finanzas` al momento de guardar (PE ingresos, ventas, ganancia neta, margen de seguridad). Deben coincidir.
- [ ] **Detalle**: click "Detalle" en una fila → expande y muestra productos (nombre, unidades, MC, ingresos) y costos fijos (nombre, recurrencia, monto).
- [ ] **Gráficos**: con 2+ snapshots, los gráficos de evolución dibujan la línea y el delta. Con <2 muestran el mensaje de "necesitás al menos 2".
- [ ] **Filtro por rango**: cambiar "Desde"/"Hasta" → "Filtrar" → la lista se ajusta al rango. Rango que excluye todo → mensaje de vacío.
- [ ] **Rango default**: al entrar, el rango es los últimos 30 días.
- [ ] **Borrar**: click "Borrar" → confirm → la fila desaparece y no reaparece al refrescar.
- [ ] **Múltiples por día**: guardar 2 snapshots el mismo día → ambos aparecen (distinto horario).
- [ ] **Pro-only página**: con usuario free/plus, entrar a `/dashboard/finanzas/historial` → redirige a `/pricing`.
- [ ] **Pro-only API**: con usuario no-pro, `POST /api/finanzas/snapshots` y `GET` devuelven 403.
- [ ] **Ownership**: un usuario no puede borrar snapshots de otro (DELETE filtra por `user_id`; RLS lo refuerza).

- [ ] **Commit final** (si quedaron ajustes de QA):

```bash
git add -A
git commit -m "fix(snapshots): ajustes de QA manual"
```

---

## Notas de implementación

- **Desviaciones del spec** (por lo que existe en el repo): el spec mencionaba "toast" → se usa feedback inline (no hay librería de toast); el spec mencionaba "reusar stack de charts" → no hay librería de charts, se crea `KpiEvolutionChart` con SVG puro siguiendo el patrón de `MCMixChart`.
- **net_profit**: se calcula en el server (`calcNetProfit`) replicando exactamente el cálculo del cliente en `SummaryCards` (`Σ (mc ?? 0) × quantity_sold`, sin restar costos fijos).
- **Fidelidad histórica**: se congelan `usd_to_uyu_rate` y `display_currency` en cada snapshot; los KPIs se recalculan en el server desde la fuente de verdad, nunca se confía en datos del cliente.
- **`detail` JSONB**: `products` se guardan ya convertidos a la moneda de display (vienen de `summary.products`); `fixed_costs` se guardan en su moneda original tal como los cargó el usuario.
