import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET() {
  try {
    const statuses = await prisma.ticketStatus.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
    return NextResponse.json(statuses);
  } catch (error) {
    return handleApiError(error);
  }
}
