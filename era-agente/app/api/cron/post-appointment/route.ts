import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppInteractive } from "@/lib/ycloud";

export const maxDuration = 30;

function db() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  // Auth: acepta header "Authorization: Bearer SECRET" o query param "?secret=SECRET"
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const headerAuth = req.headers.get("authorization");
    const querySecret = req.nextUrl.searchParams.get("secret");
    if (headerAuth !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const ownerPhone = process.env.OWNER_PHONE;
  if (!ownerPhone) return NextResponse.json({ skipped: "no owner phone" });

  // Hora actual en Paraguay (UTC-4)
  const now = new Date();
  const pyDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Asuncion",
  });
  const pyTimeStr = now.toLocaleTimeString("en-GB", {
    timeZone: "America/Asuncion",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Buscar citas confirmadas de hoy, no notificadas
  const { data, error } = await db()
    .from("appointments")
    .select(
      "id, customer_name, customer_phone, service, available_slots!inner(date, start_time, end_time)"
    )
    .eq("status", "confirmed")
    .eq("post_appointment_notified", false)
    .eq("available_slots.date", pyDateStr);

  if (error) {
    console.error("[cron/post-appointment] DB error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filtrar las que ya terminaron (end_time <= hora actual)
  const toNotify = (data ?? []).filter((a: any) => {
    const endTime = a.available_slots?.end_time?.slice(0, 5) ?? "99:99";
    return endTime <= pyTimeStr.slice(0, 5);
  });

  console.log(
    `[cron/post-appointment] ${pyDateStr} ${pyTimeStr} — ${toNotify.length} cita(s) para notificar`
  );

  let notified = 0;
  for (const appt of toNotify) {
    const slot = (appt as any).available_slots;
    const timeRange = `${slot.start_time.slice(0, 5)} – ${slot.end_time.slice(0, 5)}`;

    try {
      await sendWhatsAppInteractive(
        ownerPhone,
        `💅 Cita finalizada:\n👤 ${appt.customer_name}\n🛠 ${appt.service}\n⏰ ${timeRange}\n\n¿Cómo salió?`,
        [
          { id: `complete_${appt.id}`, title: "✅ Completada" },
          { id: `skip_${appt.id}`, title: "⏭ Omitir" },
        ]
      );

      await db()
        .from("appointments")
        .update({ post_appointment_notified: true })
        .eq("id", appt.id);

      notified++;
      console.log(`[cron/post-appointment] notified: ${appt.customer_name} — ${appt.service}`);
    } catch (err: any) {
      console.error("[cron/post-appointment] error:", appt.id, err.message);
    }
  }

  return NextResponse.json({ checked: toNotify.length, notified, date: pyDateStr, time: pyTimeStr });
}
