require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const razorpayRoutes = require("./src/routes/razorpay.routes");
const { handleRazorpayWebhook } = require("./src/controllers/razorpayWebhook.controller");

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));

// Razorpay signs the exact request bytes. Keep this route before JSON parsing.
app.post(
    "/api/webhooks/razorpay",
    express.raw({ type: "application/json", limit: "1mb" }),
    handleRazorpayWebhook
);

app.use(express.json({ limit: "100kb" }));
app.use("/api/order", razorpayRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
