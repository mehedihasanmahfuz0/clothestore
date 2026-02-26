import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Format Errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { ZodError } from "zod";

export function formatError(error: any): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.map((issue) => issue.message);
    return fieldErrors.join(". ");
  }

  // Handle Prisma unique constraint errors
  if (error.code === "P2002") {
    const field = error.meta?.target ? error.meta.target[0] : "email";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle other errors
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

// Round to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}
