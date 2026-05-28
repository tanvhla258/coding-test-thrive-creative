import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { UpdateCustomerSchema } from "@/lib/api/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const existing = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Customer with id ${customerId} not found` },
        { status: 404 }
      );
    }

    const body = await request.json();

    const validation = validateRequest(UpdateCustomerSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: validation.data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        company: true,
        status: true,
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return handleApiError(error, `PUT /api/customers/[customerId]`);
  }
}
