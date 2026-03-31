import { createHmac, timingSafeEqual } from 'crypto'

const MP_API = 'https://api.mercadopago.com'

export interface MPPreapproval {
  id: string
  status: 'authorized' | 'cancelled' | 'paused' | 'pending'
  next_payment_date: string | null
  preapproval_plan_id: string
  payer_email: string
  external_reference?: string
}

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MP_NOT_CONFIGURED')
  return token
}

export async function getPreapprovalPlan(planId: string): Promise<{ init_point: string }> {
  const token = getAccessToken()

  const res = await fetch(`${MP_API}/preapproval_plan/${planId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('[MP] getPreapprovalPlan error:', res.status, detail)
    throw new Error(`MP_API_ERROR: ${detail}`)
  }

  const data = await res.json()
  return { init_point: data.init_point }
}

export interface CreatePreapprovalParams {
  planId: string
  payerEmail: string
  externalReference: string
  backUrl: string
}

export interface CreatePreapprovalResult {
  id: string
  init_point: string
}

export async function createPreapproval(params: CreatePreapprovalParams): Promise<CreatePreapprovalResult> {
  const token = getAccessToken()
  const res = await fetch(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preapproval_plan_id: params.planId,
      payer_email: params.payerEmail,
      external_reference: params.externalReference,
      back_url: params.backUrl,
      status: 'pending',
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('[MP] createPreapproval error:', res.status, detail)
    throw new Error(`MP_API_ERROR: ${detail}`)
  }

  return await res.json()
}

export async function getPreapproval(id: string): Promise<MPPreapproval> {
  const token = getAccessToken()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const res = await fetch(`${MP_API}/preapproval/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`MP_API_ERROR: ${detail}`)
    }

    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function cancelPreapproval(id: string): Promise<void> {
  const token = getAccessToken()

  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`MP_API_ERROR: ${detail}`)
  }
}

export function validateWebhookSignature(headers: Headers, rawBody: string): boolean {
  try {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (!secret) return false

    const xSignature = headers.get('x-signature')
    const xRequestId = headers.get('x-request-id') ?? ''
    if (!xSignature) return false

    // Parse ts and v1 from "ts=1234,v1=abcdef..."
    let ts = ''
    let v1 = ''
    for (const part of xSignature.split(',')) {
      const [key, value] = part.split('=')
      if (key?.trim() === 'ts') ts = value?.trim() ?? ''
      if (key?.trim() === 'v1') v1 = value?.trim() ?? ''
    }
    if (!ts || !v1) return false

    // Parse data.id from raw body
    const payload = JSON.parse(rawBody)
    const dataId: string = payload?.data?.id ?? ''

    // Build manifest
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

    // HMAC-SHA256
    const digest = createHmac('sha256', secret).update(manifest).digest('hex')

    // Constant-time comparison
    const a = Buffer.from(digest)
    const b = Buffer.from(v1)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
