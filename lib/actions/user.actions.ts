"use server";

import { AuthError } from "next-auth";
import { signIn as authSignIn, signOut as authSignOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validator";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ZodError } from "zod";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await authSignIn("credentials", {
      email: user.email,
      password: user.password,
      redirect: false,
    });

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password" };
        default:
          return { success: false, message: "Something went wrong" };
      }
    }

    throw error;
  }
}

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await authSignIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirect: false, // ← ADD THIS LINE
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        message: formatError(error),
      };
    }

    // Don't catch AuthError anymore since redirect: false
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Sign the user out
export async function signOutUser() {
  await authSignOut();
}
