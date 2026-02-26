"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { formatError, convertToPlainObject, round2 } from "@/lib/utils";
import { cartItemSchema, insertCartSchema } from "@/lib/validator";
import { CartItem } from "@/types";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

// Calculate cart price based on items
const calcPrice = (items: z.infer<typeof cartItemSchema>[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function getMyCart() {
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as unknown as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function addItemToCart(data: z.infer<typeof cartItemSchema>) {
  try {
    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    const session = await auth();
    const userId = session?.user?.id;

    // Get current cart
    const cart = await getMyCart();

    // Parse and validate submitted item data
    const item = cartItemSchema.parse(data);

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    // --- LOGIC STARTS HERE ---

    if (!cart) {
      // CASE 1: Create New Cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: "Item added to cart successfully",
      };
    } else {
      // CASE 2: Update Existing Cart

      // Cast items to CartItem[] because Prisma returns it as generic Json
      const items = cart.items as CartItem[];

      // Check if this specific product is already in the cart
      const existItem = items.find((x) => x.productId === item.productId);

      if (existItem) {
        // If it exists, check if we have enough stock to add 1 more
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }
        // Increase the quantity
        existItem.qty += 1;
      } else {
        // If it doesn't exist, check if we have at least 1 in stock
        if (product.stock < 1) throw new Error("Not enough stock");
        // Add the new item to the array
        items.push(item);
      }

      // Update the cart in the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: items as Prisma.CartUpdateitemsInput[], // Force Prisma type
          ...calcPrice(items), // Recalculate totals
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart successfully`,
      };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Remove item from cart in database
export async function removeItemFromCart(productId: string) {
  try {
    // Get session cart id
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Get product to ensure it exists and to get the slug for revalidation
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Cast cart items to proper type
    const cartItems = cart.items as CartItem[];

    // Check if cart has the item
    const exist = cartItems.find((x) => x.productId === productId);
    if (!exist) throw new Error("Item not found");

    // LOGIC: Remove or Decrease Quantity
    if (exist.qty === 1) {
      // If only 1 exists, remove it from the array entirely
      // We modify the cartItems array by filtering
      const index = cartItems.findIndex((x) => x.productId === productId);
      cartItems.splice(index, 1);
    } else {
      // If more than 1, just decrease the quantity
      exist.qty = exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cartItems as any, // Using 'any' to handle Prisma JSON type
        ...calcPrice(cartItems),
      },
    });

    // Revalidate product page
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} ${
        cartItems.find((x) => x.productId === productId)
          ? "updated in"
          : "removed from"
      } cart successfully`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
