# Diseño: Snapshots históricos de Finanzas Avanzadas

- **Fecha**: 2026-05-28
- **Estado**: Aprobado (brainstorming)
- **Alcance**: Pro-only. Aditivo sobre el módulo de finanzas avanzadas existente.

## Intención

Permitir al usuario Pro guardar "fotos" (snapshots) puntuales de todos los datos mostrados en `/dashboard/finanzas`, llevar un registro histórico, y consultarlo en una vista nueva con filtro por rango de fechas, tabla cronológica y gráficos de evolución de KPIs.

## Decisiones tomadas (brainstorming)

1. **Granularidad híbrida**: KPIs como columnas consultables + detalle de productos y costos fijos como JSONB. Un solo INSERT, sin tablas hijas, evolucionable sin migrar el esquema entero.
2. **Vista histórica**: tabla cronológica + gráficos de línea de evolución de KPIs.
3. **Nota opcional** al guardar cada snapshot.
4. **Snapshots ilimitados por día** (se distinguen por timestamp).
5. **Borrado habilitado** con ownership check.
6. **Rango por defecto del histórico**: últimos 30 días.
7. Todo **Pro-only**, heredado del módulo de finanzas.

## 1. Modelo de datos — migración `009_finanzas_snapshots.sql`

Tabla única `finanzas_snapshots`:

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| user_id | uuid FK users.id | |
| created_at | timestamptz default now() | |
| note | text nullable | etiqueta opcional |
| display_currency | text ('UYU'\|'USD') | moneda usada al calcular |
| usd_to_uyu_rate | numeric | cotización congelada del momento |
| total_fixed_costs_monthly | numeric | KPI |
| mc_mix | numeric nullable | KPI |
| rc_mix | numeric nullable | KPI |
| break_even_units | numeric nullable | KPI |
| break_even_revenue | numeric nullable | KPI |
| margin_of_safety | numeric nullable | KPI |
| actual_revenue | numeric | KPI |
| net_profit | numeric | ganancia neta; hoy se calcula en el cliente |
| has_quantity_data | boolean | |
| detail | jsonb | `{ products: ProductWithMix[], fixed_costs: FixedCost[] }` |

- Índice en `(user_id, created_at)` para el filtro por rango.
- **RLS**: el usuario solo puede SELECT/INSERT/DELETE sus propias filas (mismo patrón que `fixed_costs`).

**Por qué congelar `usd_to_uyu_rate` y `display_currency`**: el histórico debe ser fiel a lo que el usuario vio ese día. Si la cotización cambia después, las fotos previas no se alteran.

## 2. Capa de cálculo

El snapshot lo arma **el server, recalculando desde la fuente de verdad** (products + fixed_costs + cotización actual vía `buildFinancialSummaryInCurrency`). **No confía en datos enviados por el cliente** (evita que la API reciba KPIs falsificados).

- La **ganancia neta** (`net_profit`), hoy calculada en `SummaryCards` en el cliente como `sum(mc × quantity_sold)`, se mueve al server: la calcula la route a partir de `summary.products`. Se persiste fiel en el snapshot.

## 3. API — `/api/finanzas/snapshots`

Mismo patrón que `src/app/api/fixed-costs/route.ts`. Todo Pro-only (403 si `plan !== 'pro'`).

- **POST** — body `{ note?: string }`. Recalcula el summary, arma KPIs + `detail`, inserta, devuelve el snapshot creado.
- **GET** — query params `from` / `to` (ISO date). Filtra `user_id` + `created_at` en rango, ordena `created_at` desc. Sin params: últimos 30 días.
- **DELETE** — `src/app/api/finanzas/snapshots/[id]/route.ts`, Pro-only + ownership check explícito.

## 4. Frontend

### a) Botón en `finanzas`
- Client component `SnapshotButton.tsx` en el header de `/dashboard/finanzas`.
- Abre modal: campo nota opcional + "Guardar". POST → toast de confirmación.
- Link adyacente "Ver histórico".

### b) Nueva página `/dashboard/finanzas/historial/page.tsx` (RSC)
- Redirige a `/pricing` si no es Pro (mismo guard que `finanzas/page.tsx`).
- Fetch inicial de snapshots del rango default (últimos 30 días).
- Client component `SnapshotHistory.tsx`:
  - Filtro de rango de fechas (from/to) → re-fetch GET al cambiar.
  - **Tabla** cronológica: fecha, nota, KPIs principales, botón borrar, fila expandible con el `detail` (productos/costos de esa foto).
  - **Gráficos de línea** de evolución por KPI en el rango, reusando el stack de charts existente en `finanzas`.

## 5. Navegación

Links cruzados: "Ver histórico" en `finanzas` ↔ "Volver a finanzas" en `historial`. (`finanzas` no está en el navbar hoy; meterlo al navbar queda fuera de alcance.)

## 6. Restricción de plan

Todo Pro-only, heredado. Páginas redirigen a `/pricing`; APIs devuelven 403 si `plan !== 'pro'`.

## Archivos afectados (resumen)

**Nuevos:**
- `supabase/migrations/009_finanzas_snapshots.sql`
- `src/app/api/finanzas/snapshots/route.ts` (POST, GET)
- `src/app/api/finanzas/snapshots/[id]/route.ts` (DELETE)
- `src/app/(authenticated)/dashboard/finanzas/historial/page.tsx`
- `src/components/finanzas/SnapshotButton.tsx`
- `src/components/finanzas/SnapshotHistory.tsx`

**Modificados:**
- `src/lib/types.ts` — interfaces `FinanzasSnapshot`, `SnapshotDetail`.
- `src/lib/finanzas.ts` o la route — cálculo de `net_profit` en server.
- `src/app/(authenticated)/dashboard/finanzas/page.tsx` — montar `SnapshotButton` + link a historial.

## Testing

- Tests unitarios del armado del snapshot (KPIs + `net_profit` calculado en server) y del filtro por rango de fechas en el GET.
- Seguir el patrón de tests existente del proyecto.

## Fuera de alcance

- Snapshots automáticos / programados (cron).
- Exportar a CSV/PDF.
- Link en el navbar.
- Comparador lado a lado de dos snapshots.
