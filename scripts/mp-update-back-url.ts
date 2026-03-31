/**
 * mp-update-back-url.ts
 *
 * Updates the back_url of existing Mercado Pago preapproval_plan resources.
 * Run this when the production domain changes.
 *
 * Usage:
 *   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx \
 *   MP_PLAN_ID_PLUS=xxx \
 *   MP_PLAN_ID_PRO=xxx \
 *   npx tsx scripts/mp-update-back-url.ts
 */

const MP_API = 'https://api.mercadopago.com'

async function updateBackUrl(planId: string, backUrl: string, accessToken: string): Promise<void> {
  const res = await fetch(`${MP_API}/preapproval_plan/${planId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ back_url: backUrl }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`MP API error ${res.status}: ${error}`)
  }
}

async function main() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  const plusId = process.env.MP_PLAN_ID_PLUS
  const proId = process.env.MP_PLAN_ID_PRO

  if (!accessToken || !plusId || !proId) {
    console.error('ERROR: Required env vars missing.')
    console.error('  MERCADOPAGO_ACCESS_TOKEN, MP_PLAN_ID_PLUS, MP_PLAN_ID_PRO')
    process.exit(1)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cajanetaapp.com'
  const backUrl = `${siteUrl}/dashboard`

  console.log(`Updating back_url to: ${backUrl}`)

  console.log('  Updating Plus plan...')
  await updateBackUrl(plusId, backUrl, accessToken)
  console.log('  ✓ Plus updated')

  console.log('  Updating Pro plan...')
  await updateBackUrl(proId, backUrl, accessToken)
  console.log('  ✓ Pro updated')

  console.log('\nDone. MP will now redirect to:', backUrl)
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
