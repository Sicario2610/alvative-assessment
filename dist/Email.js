"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuote = getQuote;
exports.sendQuoteEmail = sendQuoteEmail;
// src/utils/sendQuoteEmail.ts
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Reusable transporter
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
// Get a random quote
function getQuote() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.get("https://api.quotable.io/random");
            return {
                quote: res.data.content,
                author: res.data.author,
            };
        }
        catch (error) {
            console.error("Quote fetch error:", error);
            return { quote: "Keep pushing forward!", author: "Unknown" };
        }
    });
}
// Send quote email
function sendQuoteEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quote, author } = yield getQuote();
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
            yield transporter.sendMail(mailOptions);
            console.log(`Quote sent to ${email}`);
        }
        catch (err) {
            console.error("Failed to send email:", err);
        }
    });
}
