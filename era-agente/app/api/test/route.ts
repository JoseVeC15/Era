import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

// Solo para desarrollo local — probar el agente sin WhatsApp
export async function POST(req: NextRequest) {
  const { message, phone = "test-user" } = await req.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const reply = await runAgent(message, phone);
  return NextResponse.json({ reply });
}
