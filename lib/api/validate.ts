import { z } from "zod";
import { NextResponse } from "next/server";
import { ApiErrorResponse } from "./types";

export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse<ApiErrorResponse> } => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.errors.map((err) => err.message).join(", ");

    console.error("[Validation Error]", {
      errors: result.error.errors,
      data,
    });

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${errorMessages}`,
          details: result.error.errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
};
