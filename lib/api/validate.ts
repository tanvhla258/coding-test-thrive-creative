import { z } from "zod";
import { NextResponse } from "next/server";
import { ApiErrorResponse } from "./types";

export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse<ApiErrorResponse> } => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues ?? (result.error as any).errors ?? [];
    const errorMessages = issues.map((err: any) => err.message).join(", ");

    console.error("[Validation Error]", {
      errors: issues,
      data,
    });

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${errorMessages}`,
          details: issues,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
};
