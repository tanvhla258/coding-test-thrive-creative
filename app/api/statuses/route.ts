import { NextResponse } from "next/server";
import type { TicketStatus } from "@/types";
import { readData } from "@/lib/db";

export async function GET() {
  const statuses = await readData<TicketStatus[]>("ticket_status.json");
  return NextResponse.json(statuses);
}
