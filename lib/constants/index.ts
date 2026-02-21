export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || " clothstore";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000/";

// lib/constants.ts

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "Steve Smith",
  email: "steve@example.com",
  password: "password",
  confirmPassword: "password",
};
