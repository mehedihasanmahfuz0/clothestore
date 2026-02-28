import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string"; // ✅ NEW

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
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.map((issue) => issue.message);
    return fieldErrors.join(". ");
  }

  if (error.code === "P2002") {
    const field = error.meta?.target ? error.meta.target[0] : "email";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

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

// Format currency
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// ✅ NEW: Format date and time
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  day: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

export function formatDateTime(date: Date) {
  return {
    dateTime: DATE_TIME_FORMATTER.format(date),
    dateOnly: DATE_FORMATTER.format(date),
  };
}

// ✅ NEW: Shorten UUID for display (last 6 chars)
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// ✅ NEW: Build paginated URL query string
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);
  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true },
  );
}
