"use server";

import { formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

// Create an order
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // ✅ guard instead of non-null assertion
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const cart = await getMyCart();
    const user = await getUserById(userId);

    // Guard: redirect responses if checkout data is missing
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "Please add a shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Please select a payment method",
        redirectTo: "/payment-method",
      };
    }

    // Parse & validate the order object against schema
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Prisma transaction: create order + order items + clear cart atomically
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // 1. Create the order row
      const insertedOrder = await tx.order.create({ data: order });

      // 2. Create one orderItem row per cart item
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      // 3. Clear the cart after order is placed
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order successfully created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
