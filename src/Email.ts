// src/utils/sendQuoteEmail.ts
import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Get a random quote
export async function getQuote(): Promise<{ quote: string; author: string }> {
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    const quote = response.data[0].q;
    const author = response.data[0].a;

    return { quote, author };
  } catch (error: unknown) {
    console.error("Quote fetch error:", error);
    return {
      quote: "Keep pushing forward!",
      author: "Unknown",
    };
  }
}
// Send quote email
export async function sendQuoteEmail(email: string) {
  const { quote, author } = await getQuote();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your Daily Quote",
    html: `
      <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto;">
        <h2>Here's your quote:</h2>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 16px;">
          "${quote}"
        </blockquote>
        <p style="text-align: right;">— ${author}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Quote sent to ${email}`);
  } catch (err: unknown) {
    console.error("Failed to send email:", err);
  }
}
