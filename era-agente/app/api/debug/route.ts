import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAvailableSlots } from "@/lib/appointments";

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const envInfo = {
    SUPABASE_URL: url ? url.slice(0, 40) + "..." : "(vacío)",
    SUPABASE_SERVICE_ROLE_KEY: key ? key.slice(0, 20) + "..." : "(vacío)",
  };

  if (!url || !key) {
    return NextResponse.json({ error: "Env vars faltantes", envInfo });
  }

  const sb = createClient(url, key);
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await sb
    .from("available_slots")
    .select("id, date, start_time, end_time, is_booked")
    .eq("is_booked", false)
    .gte("date", today)
    .order("date")
    .order("start_time");

  // Test directo via createClient (igual que debug)
  const directResult = { error: error?.message ?? null, slots: data ?? [], count: data?.length ?? 0 };

  // Test via getAvailableSlots (singleton usado por el agente)
  let agentResult: { error: string | null; slots: unknown[]; count: number };
  try {
    const agentSlots = await getAvailableSlots();
    agentResult = { error: null, slots: agentSlots, count: agentSlots.length };
  } catch (e: any) {
    agentResult = { error: e?.message ?? "unknown", slots: [], count: 0 };
  }

  return NextResponse.json({ envInfo, today, directResult, agentResult });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("YCLOUD_PAYLOAD:", JSON.stringify(body, null, 2));
  return NextResponse.json({ received: body });
}
