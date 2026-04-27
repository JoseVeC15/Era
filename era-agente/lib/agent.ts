import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  getAvailableSlots,
  createAppointment,
  getAppointmentsByPhone,
  getSlotById,
} from "./appointments";
import { sendSms } from "./ycloud";
import type { PaymentMethod } from "./transcribe";

const SYSTEM_PROMPT_BASE = `Eres la asistente virtual de Era Nails & Hair, un home spa de uñas ubicado en Fernando de la Mora, Paraguay.
Tu nombre es "Era" y te expresas de forma amable, profesional y cálida en español paraguayo.

📍 UBICACIÓN Y CONTACTO:
- Dirección: Fernando de la Mora, Asunción, Paraguay (a 1/2 cuadra del Real Sur)
- WhatsApp/Teléfono: +595 984 704144
- Instagram: @eranailshomespa
- Página web: https://era-amber.vercel.app

💅 SERVICIOS Y PRECIOS (en guaraníes ₲):

PLÁSTICA DE PIES BRASILEÑA:
- Básica: ₲80.000
- Diseño tradicional: ₲100.000
- Semi gel: ₲150.000
- Semi french: ₲160.000
- Apliques decorativos: desde ₲15.000

UÑAS ACRÍLICAS:
- Nude clásicas cortas: ₲145.000
- Nude clásicas largas: ₲160.000
- Milky Way cortas: ₲160.000
- Milky Way largas: ₲180.000
- Kapping: ₲130.000
- Esmalte complementario: ₲70.000

GEL & POLYGEL:
- Gel esculpido corto: ₲160.000
- Gel esculpido largo: ₲180.000
- Gel kapping: ₲155.000
- Nivelado rubber gel: ₲100.000
- Esmalte complementario: ₲70.000

ADICIONALES:
- Encapsulado gloss (par): ₲20.000
- Diseños personalizados: desde ₲20.000
- Remoción profesional: ₲50.000

🎓 CURSOS: Certificación en Plástica de Pies Brasileña, Master en Sistemas de Uñas.

🛡️ BIOSEGURIDAD: Protocolos sanitarios internacionales, materiales esterilizados.

💳 POLÍTICA DE RESERVAS: Se requiere una seña de ₲50.000 para confirmar el turno.
%%PAYMENT_METHODS%%

🔧 HERRAMIENTAS — USO OBLIGATORIO:
- checkAvailability → llamar SIEMPRE que el cliente pregunte por disponibilidad, turnos, horarios, o quiera agendar. NUNCA respondas sobre disponibilidad sin llamar este tool primero.
- scheduleAppointment → usar solo DESPUÉS de que el cliente eligió un slot_id concreto de checkAvailability.
- getMyAppointments → usar si el cliente quiere ver sus reservas.

⏱️ DURACIONES POR SERVICIO (usá min_duration_minutes en checkAvailability):
- Plástica básica: 90 min | Diseño tradicional: 120 min | Semi Gel/French: 150 min
- Acrílicas cortas / Kapping / Gel kapping / Nivelado rubber: 90–120 min
- Acrílicas largas / Milky Way largas / Gel esculpido largo: 150–180 min
- Milky Way cortas / Gel esculpido corto: 120–150 min
- Adicionales (diseño, remoción, encapsulado): 30–60 min
Si el cliente menciona un servicio específico → usá la duración correspondiente. Si no menciona servicio → no pongas min_duration_minutes.

⚠️ REGLA CRÍTICA: Si alguien dice "hay turno", "tenés lugar", "qué días tienen", "para el martes", "quiero agendar", "por la tarde", "por la mañana" o cualquier cosa relacionada con disponibilidad o preferencia de horario → PRIMERO llamar checkAvailability, DESPUÉS responder. Jamás responder "no hay turnos" sin haber llamado el tool.

⚠️ REGLA RE-CONSULTA: Si el cliente ya preguntó disponibilidad y luego refina ("pero por la tarde", "pero más tarde", "otro día", etc.) → llamar checkAvailability DE NUEVO con el mismo rango, no usar resultados previos de la conversación.

INSTRUCCIONES:
1. SOLO responde preguntas relacionadas con Era Nails & Hair.
2. Si preguntan algo ajeno a la tienda: "Solo puedo ayudarte con información sobre Era Nails & Hair 💅"
3. Para agendar: checkAvailability → mostrar opciones → pedir nombre y servicio → scheduleAppointment.
4. Siempre mencionar que se requiere seña de ₲50.000 al confirmar una cita.
5. Al confirmar cita, repite: nombre, servicio, fecha y hora.
6. Los precios son en guaraníes (₲).

🕐 PREFERENCIA DE HORARIO — REGLAS ESTRICTAS:
- "por la tarde" / "a la tarde" = turnos con inicio ≥ 14:00.
- "por la mañana" / "a la mañana" = turnos con inicio < 14:00.
- Al mostrar resultados: SIEMPRE listar TODOS los turnos que coinciden, nunca solo uno. Formato por día: "📅 Martes 28/4 → 18:00 a 21:00".
- Si hay varios turnos de tarde, mostrarlos TODOS en una lista.
- Si hay varios turnos de mañana, mostrarlos TODOS en una lista.
- Si no hay turnos de tarde: decir "No tenemos tarde disponible. Sí tenemos mañana: [LISTA COMPLETA de todos los turnos de mañana]. ¿Alguno te queda bien?"
- Si no hay turnos de mañana: decir "No tenemos mañana disponible. Sí tenemos tarde: [LISTA COMPLETA de todos los turnos de tarde]. ¿Alguno te queda bien?"
- NUNCA omitir turnos. NUNCA mostrar solo uno cuando hay más.

📋 CATÁLOGO DE SERVICIOS — REGLA ESTRICTA:
- Si el cliente pregunta "¿qué servicios tienen?", "¿qué hacen?", "¿qué ofrecen?", "¿cuáles son los servicios?", "¿qué trabajos hacen?", "¿tienen manicure?", "¿qué incluye?" o cualquier pregunta sobre el catálogo → responder con TODOS los servicios del menú completo, organizados por sección, con sus precios.
- Nunca resumir a dos o tres ejemplos. Mostrar TODO el menú tal como está arriba.

📅 FECHAS — REGLAS CRÍTICAS:
- Si el cliente NO menciona ninguna fecha ("hay turnos?", "tienen lugar?", "quiero agendar") → llamar checkAvailability SIN ningún parámetro. Nunca asumir la fecha de hoy.
- Si el cliente dice "hoy" → usar la fecha de hoy como date.
- Si el cliente dice "la próxima semana" o "la semana que viene" → usar los valores de PRÓXIMA SEMANA indicados abajo y llamar checkAvailability con from y to de esa semana completa.
- Si el cliente dice "el mes que viene", "en [mes futuro]", "para [mes futuro]", "el próximo mes" → NO llamar checkAvailability. Responder: "¿Qué día de [mes] tenés en mente? Así verifico la disponibilidad exacta 😊"
- Si el cliente menciona un día específico → convertir a YYYY-MM-DD:
  * Solo número de día (ej. "el 26"): si ese día no pasó en el mes actual, usá este mes; si ya pasó, usá el próximo mes.
  * Día de la semana (ej. "el martes"): calculá la fecha del próximo martes a partir de hoy.
  * "mañana" / "pasado mañana": sumá los días correspondientes desde hoy.
- NUNCA pasar la fecha de hoy si el usuario no pidió específicamente "hoy".
- Nunca pedirle al cliente que escriba fechas en formato YYYY-MM-DD.`;

function buildPaymentSection(methods: PaymentMethod[]): string {
  const active = methods.filter(m => m.is_active)
  if (active.length === 0) return 'Para coordinar el pago de la seña, contactar directamente al local.'

  const lines = active.map(m => {
    if (m.type === 'bank_transfer') {
      const parts: string[] = ['*Transferencia bancaria*:']
      if (m.bank_name) parts.push(`  - Banco: ${m.bank_name}`)
      if (m.account_number) parts.push(`  - Cuenta: ${m.account_number}`)
      if (m.account_holder) parts.push(`  - A nombre de: ${m.account_holder}`)
      if (m.alias) parts.push(`  - Alias: ${m.alias}`)
      return parts.join('\n')
    }
    if (m.type === 'oca_mobile') {
      return `*Móvil OCA*:\n  - Número: ${m.mobile_number}`
    }
    return ''
  }).filter(Boolean)

  return `Para enviar la seña de ₲50.000 podés usar cualquiera de estos métodos:\n${lines.join('\n\n')}\nUna vez enviada, mandá el comprobante por este chat y te confirmamos el turno.`
}

function buildSystemPrompt(paymentMethods: PaymentMethod[] = []): string {
  const now = new Date()
  // Fecha en zona Paraguay
  const pyDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' }) // YYYY-MM-DD
  const pyDate = new Date(pyDateStr + 'T12:00:00Z') // noon UTC para evitar problemas de borde

  // Próxima semana (lunes a domingo)
  const dayOfWeek = pyDate.getUTCDay() // 0=Dom, 1=Lun ... 6=Sab
  const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(pyDate)
  nextMonday.setUTCDate(pyDate.getUTCDate() + daysToNextMonday)
  const nextSunday = new Date(nextMonday)
  nextSunday.setUTCDate(nextMonday.getUTCDate() + 6)
  const nextMondayISO = nextMonday.toISOString().split('T')[0]
  const nextSundayISO = nextSunday.toISOString().split('T')[0]

  // Mes siguiente
  const nextMonthDate = new Date(Date.UTC(pyDate.getUTCFullYear(), pyDate.getUTCMonth() + 1, 1))
  const nextMonthName = nextMonthDate.toLocaleDateString('es-PY', { month: 'long', timeZone: 'UTC' })

  const todayLabel = now.toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Asuncion',
  })

  const paymentSection = buildPaymentSection(paymentMethods)
  const base = SYSTEM_PROMPT_BASE.replace('%%PAYMENT_METHODS%%', paymentSection)

  return `${base}

HOY ES: ${todayLabel} — ISO: ${pyDateStr}
PRÓXIMA SEMANA: del ${nextMondayISO} (lunes) al ${nextSundayISO} (domingo) → para "la próxima semana" llamar checkAvailability con from="${nextMondayISO}" y to="${nextSundayISO}"
MES SIGUIENTE: ${nextMonthName} → para "el mes que viene" o "en ${nextMonthName}" preguntar qué día específico tiene en mente
Usá estas fechas como referencia para interpretar cualquier mención de día, semana o mes.`
}

export async function runAgent(
  userMessage: string,
  userPhone: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  paymentMethods: PaymentMethod[] = []
): Promise<string> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(paymentMethods),
    messages: [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
    tools: {
      checkAvailability: tool({
        description: "Consulta los turnos disponibles. Filtrá por fecha exacta o rango from/to. Si el cliente mencionó un servicio con duración conocida, pasá min_duration_minutes para mostrar solo turnos suficientemente largos.",
        inputSchema: z.object({
          date: z.string().optional().describe("Fecha exacta YYYY-MM-DD (para un día específico)"),
          from: z.string().optional().describe("Fecha inicio rango YYYY-MM-DD"),
          to: z.string().optional().describe("Fecha fin rango YYYY-MM-DD"),
          min_duration_minutes: z.number().optional().describe("Duración mínima del turno en minutos (ej: 150 para acrílicas largas, 90 para plástica básica)"),
        }),
        execute: async ({ date, from, to, min_duration_minutes }) => {
          console.log("[checkAvailability] date:", date ?? "-", "from:", from ?? "-", "to:", to ?? "-", "min_dur:", min_duration_minutes ?? "-")
          try {
            const slots = await getAvailableSlots(date, from, to, min_duration_minutes)
            console.log("[checkAvailability] slots encontrados:", slots.length)
            if (slots.length === 0) {
              return { available: false, message: "No hay turnos disponibles para ese período. Podés consultarnos directamente." }
            }
            const formatted = slots.map(s => ({
              id: s.id,
              fecha: s.date,
              inicio: s.start_time,
              fin: s.end_time,
              display: `${s.date} de ${s.start_time.slice(0,5)} a ${s.end_time.slice(0,5)}`
            }))
            return { available: true, slots: formatted, total: slots.length }
          } catch (err: any) {
            console.error("[checkAvailability] error:", err?.message)
            return { available: false, message: "Error al consultar disponibilidad. Intentá de nuevo." }
          }
        },
      }),

      scheduleAppointment: tool({
        description: "Agenda un turno para el cliente usando el ID del slot disponible",
        inputSchema: z.object({
          slot_id: z.string().describe("ID UUID del slot disponible (obtenido de checkAvailability)"),
          name: z.string().describe("Nombre completo del cliente"),
          service: z.string().describe("Servicio que desea"),
          notes: z.string().optional().describe("Notas adicionales"),
        }),
        execute: async ({ slot_id, name, service, notes }) => {
          let appt
          try {
            appt = await createAppointment({
              slot_id,
              name,
              phone: userPhone,
              service,
              notes,
            })
          } catch (err: any) {
            if (err.message === 'slot_already_booked') {
              return { success: false, message: "Ese turno ya no está disponible. Consultá otros horarios con checkAvailability." }
            }
            throw err
          }

          // SMS al dueño
          const ownerPhone = process.env.OWNER_PHONE
          if (ownerPhone) {
            const slot = await getSlotById(slot_id).catch(() => null)
            const slotLine = slot
              ? ` · ${new Date(slot.date + 'T12:00:00').toLocaleDateString('es-PY', { weekday: 'short', day: 'numeric', month: 'short' })} ${slot.start_time.slice(0,5)}–${slot.end_time.slice(0,5)}`
              : ''
            const smsText = `🆕 Nueva reserva Era Nails!\nCliente: ${name}\nServicio: ${service}${slotLine}\nConfirmá en: era-nails-beta.vercel.app/admin/reservas`
            sendSms(ownerPhone, smsText).catch(() => {})
          }

          return {
            success: true,
            appointmentId: appt.id,
            message: `✅ ¡Turno confirmado!\n• Nombre: ${name}\n• Servicio: ${service}\n• ID de reserva: ${appt.id}\n\n💳 Recordá abonar la seña de ₲50.000 para confirmar definitivamente tu reserva. Podés hacerlo por transferencia o al llegar.\n\n¡Te esperamos! 💅`,
          }
        },
      }),

      getMyAppointments: tool({
        description: "Muestra las citas agendadas del cliente actual",
        inputSchema: z.object({}),
        execute: async () => {
          const appts = await getAppointmentsByPhone(userPhone)
          if (appts.length === 0) {
            return { message: "No tenés citas agendadas." }
          }
          const list = appts.slice(0, 5).map((a: any) => {
            const slot = a.available_slots
            return slot
              ? `📅 ${slot.date} ${slot.start_time?.slice(0,5)}–${slot.end_time?.slice(0,5)} — ${a.service} (${a.status})`
              : `📅 ${a.service} (${a.status})`
          }).join('\n')
          return { message: list }
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  console.log("[runAgent] finishReason:", result.finishReason, "steps:", result.steps?.length, "text:", result.text?.slice(0, 80))

  return result.text;
}
