/**
 * mp-seed-plans.ts
 *
 * One-time script that creates the Mercado Pago preapproval_plan resources
 * for CajaNetaApp's Plus and Pro plans.
 *
 * Run ONCE per environment (sandbox and production separately).
 *
 * Usage:
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx... npx tsx scripts/mp-seed-plans.ts
 *
 * Output:
 *   MP_PLAN_ID_PLUS=<id>
 *   MP_PLAN_ID_PRO=<id>
 *
 * Copy those values to your .env.local and Vercel environment variables.
 */

const MP_API = 'https://api.mercadopago.com'

interface PreapprovalPlanPayload {
  reason: string
  auto_recurring: {
    frequency: number
    frequency_type: 'months'
    transaction_amount: number
    currency_id: 'UYU'
  }
  back_url: string
  status: 'active'
}

interface PreapprovalPlanResponse {
  id: string
  reason: string
  status: string
}

async function createPreapprovalPlan(
  payload: PreapprovalPlanPayload,
  accessToken: string
): Promise<string> {
  const res = await fetch(`${MP_API}/preapproval_plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`MP API error ${res.status}: ${error}`)
  }

  const data = (await res.json()) as PreapprovalPlanResponse
  return data.id
}

async function main() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    console.error('ERROR: MERCADOPAGO_ACCESS_TOKEN is not set.')
    console.error('Usage: MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx... npx tsx scripts/mp-seed-plans.ts')
    process.exit(1)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cajaneta.vercel.app'
  const backUrl = `${siteUrl}/dashboard`

  console.log('Creating preapproval_plan for Plus (UYU 199/mes)...')
  const plusId = await createPreapprovalPlan(
    {
      reason: 'CajaNetaApp Plus — UYU 199/mes',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 199,
        currency_id: 'UYU',
      },
      back_url: backUrl,
      status: 'active',
    },
    accessToken
  )
  console.log(`  ✓ Plus plan created: ${plusId}`)

  console.log('Creating preapproval_plan for Pro (UYU 450/mes)...')
  const proId = await createPreapprovalPlan(
    {
      reason: 'CajaNetaApp Pro — UYU 450/mes',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 450,
        currency_id: 'UYU',
      },
      back_url: backUrl,
      status: 'active',
    },
    accessToken
  )
  console.log(`  ✓ Pro plan created: ${proId}`)

  console.log('\n--- Copy these to your .env.local and Vercel env vars ---')
  console.log(`MP_PLAN_ID_PLUS=${plusId}`)
  console.log(`MP_PLAN_ID_PRO=${proId}`)
  console.log('----------------------------------------------------------')
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
