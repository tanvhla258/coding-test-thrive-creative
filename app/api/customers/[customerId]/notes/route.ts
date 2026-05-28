import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { CreateNoteSchema } from "@/lib/api/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 404 }
      );
    }

    const notes = await prisma.note.findMany({
      where: { customerId },
      select: {
        id: true,
        customerId: true,
        text: true,
        author: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return handleApiError(error, `GET /api/customers/[customerId]/notes`);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 404 }
      );
    }

    const body = await request.json();

    const validation = validateRequest(CreateNoteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { text, author } = validation.data;

    const note = await prisma.note.create({
      data: {
        id: `note_${Date.now()}`,
        customerId,
        text,
        author,
      },
      select: {
        id: true,
        customerId: true,
        text: true,
        author: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return handleApiError(error, `POST /api/customers/[customerId]/notes`);
  }
}
