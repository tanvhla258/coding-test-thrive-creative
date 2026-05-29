import { NextResponse } from "next/server";
import { ApiErrorResponse } from "./types";

export type ErrorType = "validation" | "not_found" | "database" | "unknown";

const getStatusCode = (errorType: ErrorType): number => {
  switch (errorType) {
    case "validation":
      return 400;
    case "not_found":
      return 404;
    case "database":
    case "unknown":
      return 500;
    default:
      return 500;
  }
};

const isPrismaError = (error: unknown): boolean => {
  return error instanceof Error && error.name.startsWith("PrismaClient");
};

export const handleApiError = (
  error: unknown,
  context?: string
): NextResponse<ApiErrorResponse> => {
  const errorType = classifyError(error);
  const statusCode = getStatusCode(errorType);

  const message = getErrorMessage(error, errorType);

  console.error(`[API Error] ${context ? `${context}: ` : ""}${message}`, {
    errorType,
    statusCode,
    error,
  });

  return NextResponse.json(
    {
      success: false,
      error: message,
      details: process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.stack
        : undefined,
    },
    { status: statusCode }
  );
};

const classifyError = (error: unknown): ErrorType => {
  if (error instanceof Error) {
    if (error.name === "ValidationError" || error.name === "ZodError") {
      return "validation";
    }
    if (error.message.includes("not found") || error.name === "NotFoundError") {
      return "not_found";
    }
    if (
      error.message.includes("database") ||
      error.message.includes("connection") ||
      isPrismaError(error)
    ) {
      return "database";
    }
  }
  return "unknown";
};

const getErrorMessage = (error: unknown, errorType: ErrorType): string => {
  if (error instanceof Error && isPrismaError(error)) {
    return "Database error";
  }

  if (error instanceof Error) {
    return error.message;
  }

  switch (errorType) {
    case "validation":
      return "Invalid request data";
    case "not_found":
      return "Resource not found";
    case "database":
      return "Database error";
    case "unknown":
    default:
      return "An unexpected error occurred";
  }
};
