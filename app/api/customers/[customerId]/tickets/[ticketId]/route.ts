import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { UpdateTicketSchema } from "@/lib/api/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ customerId: string; ticketId: string }> }
) {
  try {
    const { customerId, ticketId } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 404 }
      );
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, customerId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: `Ticket with id ${ticketId} not found for customer ${customerId}` },
        { status: 404 }
      );
    }

    const body = await request.json();

    const validation = validateRequest(UpdateTicketSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    if (validation.data.statusId) {
      const ticketStatus = await prisma.ticketStatus.findUnique({
        where: { id: validation.data.statusId },
      });

      if (!ticketStatus) {
        return NextResponse.json(
          { success: false, error: `Ticket status with id ${validation.data.statusId} not found` },
          { status: 400 }
        );
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: validation.data,
      select: {
        id: true,
        customerId: true,
        subject: true,
        description: true,
        statusId: true,
        createdAt: true,
        updatedAt: true,
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error) {
    return handleApiError(error, `PUT /api/customers/[customerId]/tickets/[ticketId]`);
  }
}
