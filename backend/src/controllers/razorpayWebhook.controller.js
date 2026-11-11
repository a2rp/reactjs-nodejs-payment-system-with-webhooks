const crypto = require("crypto");
const { safeCompareHex } = require("./razorpay.controllers");

module.exports.handleRazorpayWebhook = (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        return res.status(503).json({ error: "Webhook verification is not configured." });
    }

    if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({ error: "Expected a JSON webhook body." });
    }

    const receivedSignature = req.get("x-razorpay-signature");
    const expectedSignature = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
    if (!safeCompareHex(expectedSignature, receivedSignature)) {
        return res.status(400).json({ error: "Webhook signature could not be verified." });
    }

    try {
        const event = JSON.parse(req.body.toString("utf8"));
        if (!event || typeof event.event !== "string") {
            return res.status(400).json({ error: "Webhook event is invalid." });
        }

        // This demo validates and acknowledges events only. It has no durable store
        // or fulfillment handler, so it deliberately does not claim payment state.
        return res.status(200).json({ received: true });
    } catch {
        return res.status(400).json({ error: "Webhook body must contain valid JSON." });
    }
};
