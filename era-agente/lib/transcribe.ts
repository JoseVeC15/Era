import OpenAI from 'openai'

// Lazy init — avoids throwing at build time when env vars aren't present
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const YCLOUD_BASE = 'https://api.ycloud.com/v2'

export async function transcribeYCloudAudio(mediaId: string): Promise<string> {
  // 1. Obtener la URL de descarga desde YCloud
  const infoRes = await fetch(`${YCLOUD_BASE}/whatsapp/media/${mediaId}`, {
    headers: { 'X-API-Key': process.env.YCLOUD_API_KEY! },
  })
  if (!infoRes.ok) throw new Error(`YCloud media info error: ${infoRes.status}`)
  const info = await infoRes.json()

  const downloadUrl: string = info.url ?? info.downloadUrl
  if (!downloadUrl) throw new Error('YCloud no devolvió URL de descarga')

  // 2. Descargar el audio
  const audioRes = await fetch(downloadUrl, {
    headers: { 'X-API-Key': process.env.YCLOUD_API_KEY! },
  })
  if (!audioRes.ok) throw new Error(`Audio download error: ${audioRes.status}`)
  const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

  // 3. Transcribir con Whisper
  const mimeType = info.mimeType ?? 'audio/ogg'
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('mpeg') ? 'mp3' : 'ogg'
  const file = new File([audioBuffer], `audio.${ext}`, { type: mimeType })

  const result = await getOpenAI().audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'es',
  })

  return result.text
}

export interface PaymentMethod {
  type: 'bank_transfer' | 'oca_mobile' | 'alias'
  is_active: boolean
  bank_name?: string | null
  account_number?: string | null
  account_holder?: string | null
  mobile_number?: string | null
  alias?: string | null
}

function buildPaymentValidationContext(methods: PaymentMethod[]): string {
  const active = methods.filter(m => m.is_active)
  if (active.length === 0) return 'No hay datos de pago configurados.'

  return active.map(m => {
    if (m.type === 'bank_transfer') {
      const parts: string[] = ['Transferencia bancaria:']
      if (m.bank_name) parts.push(`  Banco: ${m.bank_name}`)
      if (m.account_number) parts.push(`  Cuenta: ${m.account_number}`)
      if (m.account_holder) parts.push(`  Titular: ${m.account_holder}`)
      if (m.alias) parts.push(`  Alias: ${m.alias}`)
      return parts.join('\n')
    }
    if (m.type === 'oca_mobile') {
      return `Móvil OCA:\n  Número: ${m.mobile_number}`
    }
    return ''
  }).filter(Boolean).join('\n\n')
}

export async function analyzeYCloudImage(mediaId: string, paymentMethods: PaymentMethod[] = []): Promise<{
  isTransfer: boolean
  isValid: boolean
  amount?: string
  summary: string
}> {
  // 1. Obtener URL de descarga
  const infoRes = await fetch(`${YCLOUD_BASE}/whatsapp/media/${mediaId}`, {
    headers: { 'X-API-Key': process.env.YCLOUD_API_KEY! },
  })
  if (!infoRes.ok) throw new Error(`YCloud media info error: ${infoRes.status}`)
  const info = await infoRes.json()

  const downloadUrl: string = info.url ?? info.downloadUrl
  if (!downloadUrl) throw new Error('No download URL from YCloud')

  // 2. Descargar imagen
  const imgRes = await fetch(downloadUrl, {
    headers: { 'X-API-Key': process.env.YCLOUD_API_KEY! },
  })
  if (!imgRes.ok) throw new Error(`Image download error: ${imgRes.status}`)
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
  const mimeType = (info.mimeType ?? 'image/jpeg') as string
  const base64 = imgBuffer.toString('base64')

  const paymentContext = buildPaymentValidationContext(paymentMethods)
  const hasActiveMethods = paymentMethods.some(m => m.is_active)

  const validationInstruction = hasActiveMethods
    ? `\n\nDatos de pago válidos del comercio:\n${paymentContext}\n\nSi es un comprobante, verificá si los datos del destinatario (banco, cuenta, titular, número) coinciden con alguno de los métodos configurados arriba. "isValid" debe ser true SOLO si es transferencia Y los datos coinciden.`
    : '\n\n"isValid" debe ser false si no hay datos de pago configurados para comparar.'

  // 3. Analizar con GPT-4o vision
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' },
          },
          {
            type: 'text',
            text: `Esta imagen fue enviada como posible comprobante de pago (seña) para una reserva en un spa de uñas en Paraguay.${validationInstruction}

Respondé únicamente en JSON válido:
{
  "isTransfer": true/false,
  "isValid": true/false,
  "amount": "monto si visible, sino null",
  "summary": "descripción breve en español de lo que muestra la imagen"
}`,
          },
        ],
      },
    ],
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(content)
    return {
      isTransfer: parsed.isTransfer ?? false,
      isValid:    parsed.isValid    ?? false,
      amount:     parsed.amount     ?? undefined,
      summary:    parsed.summary    ?? 'imagen recibida',
    }
  } catch {
    return { isTransfer: false, isValid: false, summary: 'imagen recibida' }
  }
}
