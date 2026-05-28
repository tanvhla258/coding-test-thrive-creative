import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { UpdateNoteSchema } from "@/lib/api/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ customerId: string; noteId: string }> }
) {
  try {
    const { customerId, noteId } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 404 }
      );
    }

    const note = await prisma.note.findFirst({
      where: { id: noteId, customerId },
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: `Note with id ${noteId} not found for customer ${customerId}` },
        { status: 404 }
      );
    }

    const body = await request.json();

    const validation = validateRequest(UpdateNoteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: validation.data,
      select: {
        id: true,
        customerId: true,
        text: true,
        author: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    return handleApiError(error, `PUT /api/customers/[customerId]/notes/[noteId]`);
  }
}
