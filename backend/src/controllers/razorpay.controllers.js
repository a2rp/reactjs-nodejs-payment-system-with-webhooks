const crypto = require("crypto");
const Razorpay = require("razorpay");

const MIN_AMOUNT_RUPEES = 501;
const MAX_AMOUNT_RUPEES = 9999;

function getRazorpayClient() {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        const error = new Error("Razorpay credentials are not configured.");
        error.status = 503;
        throw error;
    }

    return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

function safeCompareHex(expectedHex, receivedHex) {
    if (typeof receivedHex !== "string" || !/^[a-f0-9]{64}$/i.test(receivedHex)) {
        return false;
    }

    const expected = Buffer.from(expectedHex, "hex");
    const received = Buffer.from(receivedHex, "hex");
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

module.exports.createOrder = async (req, res) => {
    const amountRupees = Number(req.body?.amount);
    if (!Number.isSafeInteger(amountRupees) || amountRupees < MIN_AMOUNT_RUPEES || amountRupees > MAX_AMOUNT_RUPEES) {
        return res.status(400).json({
            error: `Amount must be an integer between ₹${MIN_AMOUNT_RUPEES} and ₹${MAX_AMOUNT_RUPEES}.`
        });
    }

    try {
        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.create({
            amount: amountRupees * 100,
            currency: "INR",
            receipt: crypto.randomUUID()
        });

        return res.status(201).json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        const status = error.status || 502;
        return res.status(status).json({ error: "Unable to create a payment order. Check the server configuration and try again." });
    }
};

module.exports.verifyPayment = (req, res) => {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        return res.status(503).json({ error: "Payment verification is not configured." });
    }

    if (typeof orderId !== "string" || !orderId || typeof paymentId !== "string" || !paymentId) {
        return res.status(400).json({ error: "Order and payment IDs are required." });
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    if (!safeCompareHex(expectedSignature, signature)) {
        return res.status(400).json({ error: "Payment signature could not be verified." });
    }

    return res.json({ verified: true });
};

module.exports.safeCompareHex = safeCompareHex;
