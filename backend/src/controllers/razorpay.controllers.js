const Razorpay = require("razorpay");
const shortid = require("shortid");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.createOrder = async (req, res) => {
    console.log(req.body, "req body");
    const payment_capture = 1
    const amount = req.body.amount
    const currency = "INR"

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
    }
};


module.exports.verifyPayment = (req, res) => {
    const secret = "a2rp";
    console.log(req.body)

    const crypto = require("crypto");
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    console.log(digest, req.headers["x-razorpay-signature"]);
    if (digest === req.headers["x-razorpay-signature"]) {
        console.log("payment was successful");
        require("fs").writeFileSync("payment1.json", JSON.stringify(req.body, null, 4));
    } else {
    }
    res.json({ status: "ok" });
};
