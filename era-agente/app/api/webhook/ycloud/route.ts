import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runAgent } from "@/lib/agent";
import { runOwnerAgent } from "@/lib/owner-agent";
import { transcribeYCloudAudio, analyzeYCloudImage, type PaymentMethod } from "@/lib/transcribe";
import { sendWhatsAppMessage, sendWhatsAppInteractive } from "@/lib/ycloud";
import { saveInbound, saveOutbound, getConversationHistory } from "@/lib/crm";

// Dar hasta 60 segundos al agente para responder
export const maxDuration = 60;

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data } = await db()
      .from('payment_methods')
      .select('type, is_active, bank_name, account_number, account_holder, mobile_number, alias')
      .eq('is_active', true)
    return (data ?? []) as PaymentMethod[]
  } catch {
    return []
  }
}

async function isBotPaused(phone: string): Promise<boolean> {
  try {
    const { data } = await db().from('bot_paused_phones').select('phone').eq('phone', phone).single()
    return !!data
  } catch {
    return false
  }
}

const conversations = new Map<
  string,
  Array<{ role: "user" | "assistant"; content: string }>
>();
const MAX_HISTORY = 10;

function db() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}
function isOwner(phone: string): boolean {
  const ownerPhone = process.env.OWNER_PHONE ?? "";
  return ownerPhone.length > 0 && normalizePhone(phone) === normalizePhone(ownerPhone);
}

// Dedup usando Supabase — funciona entre instancias/cold-starts
async function markProcessed(msgId: string): Promise<boolean> {
  if (!msgId) return true; // sin ID → procesar siempre
  const { error } = await db()
    .from("crm_messages")
    .select("id")
    .eq("ycloud_msg_id", msgId)
    .limit(1)
    .single();
  // Si encontró un registro → ya fue procesado
  if (!error) return false;
  return true; // no existe → procesar
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.YCLOUD_WEBHOOK_SECRET
  if (webhookSecret) {
    const provided =
      req.headers.get('x-ycloud-webhook-secret') ??
      req.nextUrl.searchParams.get('secret') ??
      ''
    if (provided !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    const events = Array.isArray(body) ? body : [body];
    // Cargar métodos de pago una vez por request
    const paymentMethods = await fetchPaymentMethods();

    for (const event of events as any[]) {
      if (event.type !== "whatsapp.inbound_message.received") {
        console.log("[ycloud] skipped:", event.type);
        continue;
      }

      const wm = event.whatsappInboundMessage || event.whatsappMessage;
      if (!wm) continue;

      const msgId: string = wm.id ?? event.id ?? "";
      const userPhone: string = wm.from;
      const msgType: string = wm.type;

      console.log("[ycloud] from:", userPhone, "type:", msgType, "msgId:", msgId?.slice(0, 20));

      // Dedup — skip si ya procesamos este mensaje
      const shouldProcess = await markProcessed(msgId);
      if (!shouldProcess) {
        console.log("[ycloud] dup skipped:", msgId?.slice(0, 20));
        continue;
      }

      // ── Dueña ───────────────────────────────────────────────────────────
      if (isOwner(userPhone)) {
        // ── Respuesta a botón (cita completada / omitir) ──────────────────
        if (msgType === "interactive" && wm.interactive?.type === "button_reply") {
          const buttonId: string = wm.interactive.buttonReply?.id ?? "";
          const buttonTitle: string = wm.interactive.buttonReply?.title ?? "";
          await saveInbound(userPhone, `🔘 ${buttonTitle}`, "text", msgId || undefined);

          if (buttonId.startsWith("complete_")) {
            const apptId = buttonId.replace("complete_", "");
            const { data: appt } = await db()
              .from("appointments")
              .select("id, customer_name, customer_phone, service")
              .eq("id", apptId)
              .single();

            if (appt) {
              await db().from("appointments").update({ status: "completed" }).eq("id", apptId);

              const thanks = `¡Hola ${appt.customer_name}! 💅\n\nGracias por visitarnos en *Era Nails & Hair*. Fue un placer atenderte.\n\nSi quedaste contenta con tu servicio, nos ayudaría muchísimo que compartas tu experiencia. ¡Te esperamos pronto! 🌸`;
              await sendWhatsAppMessage(appt.customer_phone, thanks);
              await saveOutbound(appt.customer_phone, thanks, true);

              const ownerReply = `✅ Cita de *${appt.customer_name}* marcada como completada.\nSe envió el agradecimiento a la cliente. 💅`;
              await sendWhatsAppMessage(userPhone, ownerReply);
              await saveOutbound(userPhone, ownerReply, false);
            }
          } else if (buttonId.startsWith("skip_")) {
            await sendWhatsAppMessage(userPhone, "Ok, omitido. 👍");
            await saveOutbound(userPhone, "Omitido.", false);
          }
          continue;
        }

        // ── Texto o audio del dueño → Owner Agent ─────────────────────────
        let text = "";

        if (msgType === "text" && wm.text?.body) {
          text = wm.text.body;
          await saveInbound(userPhone, text, "text", msgId || undefined);
        } else if (msgType === "audio" && wm.audio?.id) {
          console.log("[ycloud] owner audio transcribing...");
          try {
            text = await transcribeYCloudAudio(wm.audio.id);
            console.log("[ycloud] transcribed:", text.slice(0, 60));
            await saveInbound(userPhone, `🎤 ${text}`, "audio", msgId || undefined);
          } catch (err: any) {
            console.error("[ycloud] transcription error:", err.message);
            await sendWhatsAppMessage(userPhone, "⚠️ No pude transcribir el audio. Escribí tu consulta.");
            continue;
          }
        } else {
          continue;
        }

        try {
          let ownerHistory = conversations.get(userPhone)
          if (!ownerHistory) {
            const dbHistory = await getConversationHistory(userPhone, MAX_HISTORY * 2)
            ownerHistory = dbHistory.length > 0 && dbHistory[dbHistory.length - 1].role === 'user'
              ? dbHistory.slice(0, -1)
              : dbHistory
          }
          const reply = await runOwnerAgent(text, ownerHistory);
          await sendWhatsAppMessage(userPhone, reply);
          await saveOutbound(userPhone, reply, true);
          const ownerUpdated = [
            ...ownerHistory,
            { role: 'user' as const, content: text },
            { role: 'assistant' as const, content: reply },
          ]
          conversations.set(userPhone, ownerUpdated.slice(-MAX_HISTORY * 2))
        } catch (err: any) {
          console.error("[ycloud] owner agent error:", err.message);
          await sendWhatsAppMessage(userPhone, "⚠️ Error procesando tu solicitud.");
        }
        continue;
      }

      // ── Clientes ─────────────────────────────────────────────────────────
      // Check si la dueña tomó control de esta conversación
      const paused = await isBotPaused(userPhone)
      if (paused) {
        console.log("[ycloud] bot paused for:", userPhone, "— skipping")
        continue
      }

      let userText = "";

      if (msgType === "text" && wm.text?.body) {
        userText = wm.text.body;
        console.log("[ycloud] client text:", userText.slice(0, 80));
      } else if (msgType === "audio" && wm.audio?.id) {
        console.log("[ycloud] client audio transcribing...");
        try {
          userText = await transcribeYCloudAudio(wm.audio.id);
          console.log("[ycloud] client transcribed:", userText.slice(0, 80));
        } catch (err: any) {
          console.error("[ycloud] client transcription error:", err.message);
          await sendWhatsAppMessage(userPhone, "Lo sentimos, no pudimos procesar tu mensaje de voz. ¿Podés escribirnos? 😊");
          continue;
        }
      } else if (msgType === "image" && wm.image?.id) {
        console.log("[ycloud] client image, analyzing...");
        try {
          const analysis = await analyzeYCloudImage(wm.image.id, paymentMethods);
          const label = `🖼️ [imagen] ${analysis.summary}`;
          await saveInbound(userPhone, label, "image", msgId || undefined);

          if (analysis.isTransfer && analysis.isValid) {
            // Buscar la reserva pendiente más reciente de este teléfono y marcarla como seña recibida
            const { data: pendingAppt } = await db()
              .from('appointments')
              .select('id, customer_name, service, available_slots(date, start_time, end_time)')
              .eq('customer_phone', userPhone)
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (pendingAppt) {
              await db().from('appointments').update({ status: 'payment_received' }).eq('id', pendingAppt.id)
            }

            const slot = (pendingAppt as any)?.available_slots
            const slotLine = slot
              ? `\n📅 ${new Date(slot.date + 'T12:00:00').toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${slot.start_time.slice(0, 5)}`
              : ''

            const amountLine = analysis.amount ? `\nMonto: ${analysis.amount}` : "";
            const clientReply =
              `¡Recibimos tu comprobante de pago! 🎉\n\nVerificamos los datos y tu seña está confirmada.${slotLine ? ` Te esperamos${slotLine}.` : ' En breve te confirmamos el turno.'}\n\n¡Gracias por confiar en Era Nails & Hair! 💅`;
            await sendWhatsAppMessage(userPhone, clientReply);
            await saveOutbound(userPhone, clientReply, true);

            const ownerPhone = process.env.OWNER_PHONE;
            if (ownerPhone) {
              const apptLine = pendingAppt
                ? `\n👤 ${pendingAppt.customer_name} — ${pendingAppt.service}${slotLine}`
                : ''
              const ownerMsg = `✅ Seña recibida de +${userPhone}:${amountLine}${apptLine}\n\nRevisá en /admin/reservas para confirmar.`
              await sendWhatsAppMessage(ownerPhone, ownerMsg);
            }
          } else if (analysis.isTransfer && !analysis.isValid) {
            // Es transferencia pero los datos no coinciden
            const correctData = buildPaymentDataText(paymentMethods);
            const clientReply =
              `Recibí tu comprobante, pero los datos del destinatario no coinciden con nuestra cuenta. 🚨\n\nPor favor verificá que estás enviando a:\n${correctData}\n\nUna vez confirmado, enviá el comprobante nuevamente. 💅`;
            await sendWhatsAppMessage(userPhone, clientReply);
            await saveOutbound(userPhone, clientReply, true);
            // Notificar a la dueña para que revise el caso
            const ownerPhone = process.env.OWNER_PHONE;
            if (ownerPhone) {
              const ownerMsg = `⚠️ Comprobante con datos incorrectos de +${userPhone}:\n${analysis.summary}${analysis.amount ? `\nMonto: ${analysis.amount}` : ''}\nRevisá el caso en el CRM.`;
              await sendWhatsAppMessage(ownerPhone, ownerMsg).catch(() => {});
            }
          } else {
            // No es comprobante
            const clientReply =
              `Recibí tu imagen, pero no parece ser un comprobante de pago. Si querés confirmar tu turno con la seña de ₲50.000, mandá el comprobante de transferencia. ¿En qué más puedo ayudarte? 💅`;
            await sendWhatsAppMessage(userPhone, clientReply);
            await saveOutbound(userPhone, clientReply, true);
          }
        } catch (err: any) {
          console.error("[ycloud] image analysis error:", err.message);
          const fallback = "Recibí tu imagen. Si es un comprobante de pago, pronto lo verificamos y te confirmamos tu turno. 💅";
          await sendWhatsAppMessage(userPhone, fallback);
          await saveOutbound(userPhone, fallback, true);
        }
        continue;
      } else {
        console.log("[ycloud] non-text from client, skipped:", msgType);
        continue;
      }

      await saveInbound(userPhone, msgType === "audio" ? `🎤 ${userText}` : userText, msgType === "audio" ? "audio" : "text", msgId || undefined);
      await processAndReply(userPhone, userText, paymentMethods);
    }
  } catch (err) {
    console.error("[webhook/ycloud] unhandled error:", err);
  }

  return NextResponse.json({ ok: true });
}

function buildPaymentDataText(methods: PaymentMethod[]): string {
  const active = methods.filter(m => m.is_active)
  if (active.length === 0) return 'Contactar al local para coordinar el pago.'
  return active.map(m => {
    if (m.type === 'bank_transfer') {
      const parts: string[] = ['🏦 Transferencia:']
      if (m.bank_name) parts.push(`Banco: ${m.bank_name}`)
      if (m.account_number) parts.push(`Cuenta: ${m.account_number}`)
      if (m.account_holder) parts.push(`A nombre de: ${m.account_holder}`)
      return parts.join(' | ')
    }
    if (m.type === 'oca_mobile') return `📱 Móvil OCA: ${m.mobile_number}`
    return ''
  }).filter(Boolean).join('\n')
}

async function processAndReply(userPhone: string, text: string, paymentMethods: PaymentMethod[]) {
  let history = conversations.get(userPhone)
  if (!history) {
    // Cold start — reload from DB, excluding the current inbound message we just saved
    const dbHistory = await getConversationHistory(userPhone, MAX_HISTORY * 2)
    history = dbHistory.length > 0 && dbHistory[dbHistory.length - 1].role === 'user'
      ? dbHistory.slice(0, -1)
      : dbHistory
  }
  console.log("[ycloud] running agent for:", userPhone);
  const reply = await runAgent(text, userPhone, history, paymentMethods);
  console.log("[ycloud] agent replied:", reply.slice(0, 60));
  const updated = [
    ...history,
    { role: "user" as const, content: text },
    { role: "assistant" as const, content: reply },
  ];
  conversations.set(userPhone, updated.slice(-MAX_HISTORY * 2));
  await sendWhatsAppMessage(userPhone, reply);
  await saveOutbound(userPhone, reply, true);
}

export async function GET() {
  return NextResponse.json({ status: "Era Nails & Hair Agent online" });
}
