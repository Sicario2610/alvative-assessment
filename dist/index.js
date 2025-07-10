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
const express_1 = __importDefault(require("express"));
const Email_1 = require("./Email");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "*", // ✅ set to frontend origin in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Enable CORS for all routes
app.use((0, cors_1.default)()); // Allow all origins for CORS
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Endpoint for payment initialization
app.post("/initialize-payment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        const response = yield axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email,
            amount: price * 100, // Convert Naira to kobo
            currency: "NGN",
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        res.status(200).json({
            status: true,
            message: "Payment initialized successfully",
            reference: response.data.data.reference,
        });
    }
    catch (error) {
        console.error("Paystack error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({
            status: false,
            error: "Failed to initialize payment",
            message: ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Payment initialization failed",
        });
    }
}));
// Webhook endpoint for Paystack
app.post("/webhook/paystack", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const hash = crypto_1.default
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (hash === req.headers["x-paystack-signature"]) {
        const event = req.body;
        switch (event.event) {
            case "charge.success":
                console.log("Webhook: Payment successful", event.data);
                const email = (_a = event.data.customer) === null || _a === void 0 ? void 0 : _a.email;
                if (email) {
                    yield (0, Email_1.sendQuoteEmail)(email); // ✅ Send the quote email!
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
    }
    else {
        console.log("Webhook: Invalid signature");
        res.sendStatus(400);
    }
}));
// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Server error:", error);
    res.status(500).json({
        status: false,
        error: "Internal server error",
        message: "Something went wrong on the server",
    });
});
// Your routes and middleware here
app.get("/", (req, res) => {
    res.send("App is running!");
});
// Self-ping to keep alive
setInterval(() => {
    axios_1.default
        .get("/")
        .then(() => console.log("Self-ping success"))
        .catch((err) => console.error("Self-ping failed:", err.message));
}, 2 * 60 * 1000);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});
