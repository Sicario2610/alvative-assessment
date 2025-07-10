import express, { Request, Response } from "express";
import { sendQuoteEmail } from "./Email";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors()); // Allow all origins for CORS

// Middleware to parse JSON request bodies
app.use(express.json());

// Interface for payment initialization request
interface PaymentRequest {
  email: string;
  name: string;
  price: number;
}

// Interface for Paystack response
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
  };
}

// Endpoint for payment initialization
app.post(
  "/initialize-payment",
  async (req: Request<{}, {}, PaymentRequest>, res: Response) => {
    const { email, name, price } = req.body; // Destructure image and phone

    // Validate request body
    if (!email || !name || !price || price <= 0) {
      return res.status(400).json({
        error: "Email, name, valid price, image, and phone are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    try {
      // Initialize Paystack transaction
      const response = await axios.post<PaystackInitializeResponse>(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: price * 100, // Convert Naira to kobo
          currency: "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({
        status: true,
        message: "Payment initialized successfully",
        reference: response.data.data.reference,
      });
    } catch (error: any) {
      console.error("Paystack error:", error.response?.data || error.message);
      res.status(500).json({
        status: false,
        error: "Failed to initialize payment",
        message:
          error.response?.data?.message || "Payment initialization failed",
      });
    }
  }
);

// Webhook endpoint for Paystack
app.post("/webhook/paystack", async (req: Request, res: Response) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const event = req.body;

    switch (event.event) {
      case "charge.success":
        console.log("Webhook: Payment successful", event.data);

        const email = event.data.customer?.email;
        if (email) {
          await sendQuoteEmail(email); // ✅ Send the quote email!
        }

        break;

      case "charge.dispute.create":
        console.log("Webhook: Dispute created", event.data);
        break;

      case "charge.dispute.remind":
        console.log("Webhook: Dispute reminder", event.data);
        break;

      case "charge.dispute.resolve":
        console.log("Webhook: Dispute resolved", event.data);
        break;

      default:
        console.log("Webhook: Unhandled event", event.event);
    }

    res.sendStatus(200);
  } else {
    console.log("Webhook: Invalid signature");
    res.sendStatus(400);
  }
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error("Server error:", error);
  res.status(500).json({
    status: false,
    error: "Internal server error",
    message: "Something went wrong on the server",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});
