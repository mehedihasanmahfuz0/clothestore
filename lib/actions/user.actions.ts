"use server";

import { AuthError } from "next-auth";
import { signIn as authSignIn, signOut as authSignOut, auth } from "@/auth"; // ✅ auth added
import {
  signInFormSchema,
  signUpFormSchema,
  shippingAddressSchema, // ✅ NEW
  paymentMethodSchema, // ✅ NEW
} from "../validator";
import { z } from "zod"; // ✅ NEW
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ZodError } from "zod";
import { ShippingAddress } from "@/types"; // ✅ NEW

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
      redirect: false,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: formatError(error),
      };
    }

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

// ✅ NEW: Get user by ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

// ✅ NEW: Update user's shipping address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const currentUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ✅ NEW: Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>,
) {
  try {
    const session = await auth();

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const currentUser = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ✅ NEW: Update user profile name
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const currentUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: user.name },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
