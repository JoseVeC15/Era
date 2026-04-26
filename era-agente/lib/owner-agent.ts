import { generateText, tool, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import {
  adminCreateSlot,
  adminDeleteSlot,
  adminListSlots,
  adminListAppointments,
  adminCancelAppointment,
} from './appointments'

function buildOwnerPrompt(): string {
  const now = new Date()
  const todayISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  const todayLabel = now.toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Asuncion',
  })
  return `Sos el asistente de administración de Era Nails & Hair. Respondés en español, de forma breve y directa.

HOY ES: ${todayLabel} — ISO: ${todayISO}

📅 REGLAS DE FECHAS:
- Convertí días relativos a fechas ISO: "mañana" = ${todayISO} + 1 día, "el martes" = próximo martes, "el 5" = 5 del mes actual (o siguiente si ya pasó).
- Hora en formato HH:MM (24h). "9" = "09:00", "9 y media" = "09:30", "3 de la tarde" = "15:00".

🔧 HERRAMIENTAS DISPONIBLES:
- listSlots → ver turnos cargados (por fecha, rango, o próximos 14 días)
- createSlot → crear un turno nuevo
- deleteSlot → eliminar un turno libre
- listAppointments → ver reservas de clientes
- cancelAppointment → cancelar una reserva y liberar el turno

⚡ FLUJO:
- Si te piden ver turnos → listSlots
- Si te piden crear → createSlot (podés llamarlo varias veces para múltiples turnos)
- Si te piden borrar → listSlots primero para encontrar el ID, luego deleteSlot
- Si te piden ver reservas → listAppointments
- Si te piden cancelar una reserva → listAppointments primero, luego cancelAppointment

Confirmá siempre lo que hiciste en pocas palabras. Usá formato claro con fecha y hora.`
}

export async function runOwnerAgent(userMessage: string): Promise<string> {
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: buildOwnerPrompt(),
    messages: [{ role: 'user', content: userMessage }],
    tools: {
      listSlots: tool({
        description: 'Lista los turnos del calendario (incluye ocupados y libres)',
        inputSchema: z.object({
          date: z.string().optional().describe('Fecha específica YYYY-MM-DD'),
          from: z.string().optional().describe('Desde YYYY-MM-DD'),
          to: z.string().optional().describe('Hasta YYYY-MM-DD'),
        }),
        execute: async ({ date, from, to }) => {
          const slots = await adminListSlots(date, from, to)
          if (slots.length === 0) return { message: 'No hay turnos en ese período.' }
          const formatted = slots.map((s: any) => {
            const appt = s.appointments?.[0]
            const status = s.is_booked
              ? `🔴 Reservado — ${appt?.customer_name ?? '?'} (${appt?.service ?? '?'})`
              : '🟢 Libre'
            return `• ${s.date} ${s.start_time.slice(0,5)}–${s.end_time.slice(0,5)} ${status} [id:${s.id.slice(0,8)}]`
          })
          return { slots: formatted, total: slots.length }
        },
      }),

      createSlot: tool({
        description: 'Crea un turno disponible en el calendario',
        inputSchema: z.object({
          date: z.string().describe('Fecha YYYY-MM-DD'),
          start_time: z.string().describe('Hora inicio HH:MM'),
          end_time: z.string().describe('Hora fin HH:MM'),
        }),
        execute: async ({ date, start_time, end_time }) => {
          const slot = await adminCreateSlot(date, start_time, end_time)
          return { success: true, message: `✅ Turno creado: ${date} ${start_time}–${end_time}`, id: slot.id }
        },
      }),

      deleteSlot: tool({
        description: 'Elimina un turno libre (no se puede eliminar si ya está reservado)',
        inputSchema: z.object({
          id: z.string().describe('ID del slot (primeros 8 caracteres o completo)'),
        }),
        execute: async ({ id }) => {
          const slots = await adminListSlots()
          const match = slots.find((s: any) => s.id.startsWith(id) || s.id === id)
          if (!match) return { success: false, message: 'Turno no encontrado.' }
          if (match.is_booked) return { success: false, message: 'Ese turno ya tiene una reserva. Cancelá la reserva primero.' }
          await adminDeleteSlot(match.id)
          return { success: true, message: `✅ Turno eliminado: ${match.date} ${match.start_time.slice(0,5)}–${match.end_time.slice(0,5)}` }
        },
      }),

      listAppointments: tool({
        description: 'Lista las reservas de clientes',
        inputSchema: z.object({
          status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional()
            .describe('Filtrar por estado (opcional)'),
        }),
        execute: async ({ status }) => {
          const appts = await adminListAppointments(status)
          if (appts.length === 0) return { message: 'No hay reservas.' }
          const formatted = appts.slice(0, 10).map((a: any) => {
            const slot = a.available_slots
            const fecha = slot ? `${slot.date} ${slot.start_time.slice(0,5)}` : 'sin fecha'
            return `• ${a.customer_name} — ${a.service} — ${fecha} — ${a.status} [id:${a.id.slice(0,8)}]`
          })
          return { appointments: formatted, total: appts.length }
        },
      }),

      cancelAppointment: tool({
        description: 'Cancela una reserva y libera el turno',
        inputSchema: z.object({
          id: z.string().describe('ID de la reserva (primeros 8 caracteres o completo)'),
        }),
        execute: async ({ id }) => {
          const appts = await adminListAppointments()
          const match = appts.find((a: any) => a.id.startsWith(id) || a.id === id)
          if (!match) return { success: false, message: 'Reserva no encontrada.' }
          await adminCancelAppointment(match.id)
          return { success: true, message: `✅ Reserva de ${match.customer_name} cancelada. El turno quedó libre.` }
        },
      }),
    },
    stopWhen: stepCountIs(8),
  })

  return result.text
}
