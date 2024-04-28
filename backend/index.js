require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const razorpayRoutes = require("./src/routes/razorpay.routes");


app.use(cors());
app.use(express.json({ extended: false }));

app.use("/api/order", razorpayRoutes);

app.listen(PORT, console.log(`server listeniing on http://localhost:${PORT}`));
