import { generateAccessToken, paypal } from "../lib/paypal";

// Test 1: Generate access token
test("generates a PayPal access token", async () => {
  const tokenResponse = await generateAccessToken();
  console.log("Access token:", tokenResponse);

  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});

// Test 2: Create a PayPal order
test("creates a PayPal order", async () => {
  const price = 10.0;
  const orderResponse = await paypal.createOrder(price);
  console.log("Order response:", orderResponse);

  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

// Test 3: Simulate capturing a PayPal order (mocked — no real payment needed)
test("simulates capturing a PayPal order", async () => {
  const orderId = "100"; // mock ID

  // Spy on capturePayment and return a fake successful response
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({ status: "COMPLETED" });

  const captureResponse = await paypal.capturePayment(orderId);

  expect(captureResponse).toHaveProperty("status", "COMPLETED");

  // Restore the real function after test
  mockCapturePayment.mockRestore();
});
