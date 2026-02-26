"use client";

import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { Plus, Minus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Check if item is already in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      // Show success toast with action to go to cart
      toast.success(`${item.name} added to cart`, {
        action: {
          label: "Go to Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
    });
  };

  // Render Logic
  return existItem ? (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isPending}
        onClick={handleRemoveFromCart}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="px-2 font-bold">{existItem.qty}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add to cart
    </Button>
  );
};

export default AddToCart;
