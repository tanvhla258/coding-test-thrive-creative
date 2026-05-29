import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { CustomerQuerySchema, CreateCustomerSchema } from "@/lib/api/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const validation = validateRequest(CustomerQuerySchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!validation.success) {
      return validation.response;
    }

    const { page, limit, search } = validation.data;

    const skip = (page - 1) * limit;

    const where = search
      ? { phone: { contains: search } }
      : undefined;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          company: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/customers");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateRequest(CreateCustomerSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { name, phone, email, company, status } = validation.data;

    const customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        name,
        phone,
        email,
        company,
        status,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        company: true,
        status: true,
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/customers");
  }
}
