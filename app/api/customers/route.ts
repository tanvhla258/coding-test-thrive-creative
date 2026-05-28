import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { PhoneFilterSchema } from "@/lib/api/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const validation = validateRequest(PhoneFilterSchema, {
      phone: searchParams.get("phone") ?? undefined,
    });

    if (!validation.success) {
      return validation.response;
    }

    const { phone } = validation.data;

    const customers = await prisma.customer.findMany({
      where: phone
        ? {
            phone: {
              contains: phone,
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        company: true,
        status: true,
      },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return handleApiError(error, "GET /api/customers");
  }
}
