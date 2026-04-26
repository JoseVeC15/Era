const BASE = "https://api.ycloud.com/v2";
const API_KEY = process.env.YCLOUD_API_KEY!;

function normalizePhone(phone: string) {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

export async function sendWhatsAppMessage(to: string, text: string) {
  const res = await fetch(`${BASE}/whatsapp/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({
      to: normalizePhone(to),
      type: "text",
      text: { body: text },
      from: normalizePhone(process.env.YCLOUD_WHATSAPP_NUMBER!),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YCloud error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function sendWhatsAppInteractive(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<void> {
  const res = await fetch(`${BASE}/whatsapp/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify({
      to: normalizePhone(to),
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
        },
      },
      from: normalizePhone(process.env.YCLOUD_WHATSAPP_NUMBER!),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YCloud interactive error ${res.status}: ${err}`);
  }
}

export async function sendSms(to: string, text: string): Promise<void> {
  const normalized = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`
  const res = await fetch(`${BASE}/sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ to: normalized, text }),
  })
  if (!res.ok) console.error('[SMS] error:', res.status, await res.text().catch(() => ''))
}

// Tipos del webhook entrante de YCloud
export interface YCloudWebhookPayload {
  id: string;
  object: string;
  to: string;
  from: string;
  channel: string;
  status: string;
  content: {
    type: string;
    text?: string;
  };
  externalId?: string;
  sendTime?: string;
  createTime?: string;
}
