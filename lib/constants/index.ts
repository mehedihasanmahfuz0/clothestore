export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || " clothstore";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000/";

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// ✅ NEW: Shipping Address defaults
export const shippingAddressDefaultValues = {
  fullName: "John Doe",
  streetAddress: "123 Main St",
  city: "Anytown",
  postalCode: "12345",
  country: "USA",
};

// ✅ NEW: Payment methods
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

// ✅ NEW: Pagination page size
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;
