import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { CustomerIdFilterSchema, CreateNoteSchema } from "@/lib/api/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const validation = validateRequest(CustomerIdFilterSchema, {
      customerId: searchParams.get("customerId") ?? undefined,
    });

    if (!validation.success) {
      return validation.response;
    }

    const { customerId } = validation.data;

    const notes = await prisma.note.findMany({
      where: customerId ? { customerId } : undefined,
      select: {
        id: true,
        customerId: true,
        text: true,
        createdAt: true,
        author: true,
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return handleApiError(error, "GET /api/notes");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateRequest(CreateNoteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { customerId, text, author } = validation.data;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        id: `note_${Date.now()}`,
        customerId,
        text,
        author,
        createdAt: new Date(),
      },
      select: {
        id: true,
        customerId: true,
        text: true,
        createdAt: true,
        author: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/notes");
  }
}
