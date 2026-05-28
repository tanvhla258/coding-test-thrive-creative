import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { CreateTicketSchema } from "@/lib/api/validators";

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

    const tickets = await prisma.ticket.findMany({
      where: { customerId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    return handleApiError(error, `GET /api/customers/[customerId]/tickets`);
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

    const validation = validateRequest(CreateTicketSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { subject, description, statusId } = validation.data;

    const ticketStatus = await prisma.ticketStatus.findUnique({
      where: { id: statusId },
    });

    if (!ticketStatus) {
      return NextResponse.json(
        { success: false, error: `Ticket status with id ${statusId} not found` },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        id: `ticket_${Date.now()}`,
        customerId,
        subject,
        description: description ?? null,
        statusId,
      },
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

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    return handleApiError(error, `POST /api/customers/[customerId]/tickets`);
  }
}
