import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "./order-details-form";
import { ShippingAddress } from "@/types";

export const metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <OrderDetailsForm
      order={{
        ...order,
        // Convert top-level Decimal fields → string to match Order type
        itemsPrice: order.itemsPrice.toString(),
        shippingPrice: order.shippingPrice.toString(),
        taxPrice: order.taxPrice.toString(),
        totalPrice: order.totalPrice.toString(),
        shippingAddress: order.shippingAddress as ShippingAddress,
        // Convert each orderItem's price Decimal → string
        orderItems: order.orderItems.map((item) => ({
          ...item,
          price: item.price.toString(),
        })),
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
    />
  );
};

export default OrderDetailsPage;
