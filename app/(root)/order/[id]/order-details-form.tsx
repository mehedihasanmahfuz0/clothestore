"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner"; // ✅ sonner instead of useToast
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Order, ShippingAddress } from "@/types";
import {
  approvePayPalOrder,
  createPayPalOrder,
} from "@/lib/actions/order.actions";

const OrderDetailsForm = ({
  order,
  paypalClientId,
}: {
  order: Order;
  paypalClientId: string;
}) => {
  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  // ── PayPal loading state indicator ──────────────────────────────────────
  // Must be a child of PayPalScriptProvider to use usePayPalScriptReducer
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    if (isPending) return <p>Loading PayPal...</p>;
    if (isRejected) return <p>Error loading PayPal.</p>;
    return null;
  }

  // ── Step 1: Create the PayPal order and return its ID to the SDK ─────────
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) {
      toast.error(res.message); // ✅ sonner
      return;
    }
    return res.data;
  };

  // ── Step 2: Capture payment after buyer approves in the PayPal popup ────
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    if (res.success) {
      toast.success(res.message); // ✅ sonner
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid md:grid-cols-3 md:gap-5">
      {/* ── Left column: address, payment, items ── */}
      <div className="overflow-x-auto md:col-span-2 space-y-4">
        {/* Shipping Address */}
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Shipping Address</h2>
            <p>{(shippingAddress as ShippingAddress).fullName}</p>
            <p>
              {(shippingAddress as ShippingAddress).streetAddress},{" "}
              {(shippingAddress as ShippingAddress).city},{" "}
              {(shippingAddress as ShippingAddress).postalCode},{" "}
              {(shippingAddress as ShippingAddress).country}
            </p>
            <p className="mt-2 font-medium">
              {isDelivered ? (
                <span className="text-green-600">
                  Delivered at {deliveredAt?.toString()}
                </span>
              ) : (
                <span className="text-yellow-600">Not delivered</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Payment Method</h2>
            <p>{paymentMethod}</p>
            <p className="mt-2 font-medium">
              {isPaid ? (
                <span className="text-green-600">
                  Paid at {paidAt?.toString()}
                </span>
              ) : (
                <span className="text-yellow-600">Not paid</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Right column: price summary + PayPal button ── */}
      <div>
        <Card>
          <CardContent className="p-4 gap-4 space-y-4">
            <div className="flex justify-between">
              <div>Items</div>
              <div>{formatCurrency(itemsPrice)}</div>
            </div>
            <div className="flex justify-between">
              <div>Tax</div>
              <div>{formatCurrency(taxPrice)}</div>
            </div>
            <div className="flex justify-between">
              <div>Shipping</div>
              <div>{formatCurrency(shippingPrice)}</div>
            </div>
            <div className="flex justify-between font-bold">
              <div>Total</div>
              <div>{formatCurrency(totalPrice)}</div>
            </div>

            {/* PayPal button — only shown if unpaid and method is PayPal */}
            {!isPaid && paymentMethod === "PayPal" && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailsForm;
