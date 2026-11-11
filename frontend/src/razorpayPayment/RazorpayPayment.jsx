import { useState } from "react";
import styles from "./styles.module.scss";
import {
  Button,
  CircularProgress,
  InputAdornment,
  TextField
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { toast } from "react-toastify";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const MIN_AMOUNT = 501;
const MAX_AMOUNT = 9999;
const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      razorpayScriptPromise = undefined;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export default function RazorpayPayment() {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleAmountChange(event) {
    const value = event.target.value.replace(/\D/g, "").slice(0, 4);
    setAmount(value);

    if (!value) {
      setAmountError("");
    } else if (Number(value) < MIN_AMOUNT) {
      setAmountError(`Minimum amount is ₹${MIN_AMOUNT}.`);
    } else if (Number(value) > MAX_AMOUNT) {
      setAmountError(`Maximum amount is ₹${MAX_AMOUNT}.`);
    } else {
      setAmountError("");
    }
  }

  async function handleCheckoutSuccess(payment) {
    try {
      const response = await fetch(`${API_BASE_URL}/order/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment)
      });
      const result = await response.json();
      if (!response.ok || !result.verified) {
        throw new Error(result.error || "Payment verification failed.");
      }
      toast.success("Payment completed and signature verified.");
    } catch (error) {
      toast.error(error.message || "Could not verify the payment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!amount || Number(amount) < MIN_AMOUNT || Number(amount) > MAX_AMOUNT || amountError) {
      setAmountError(`Enter an amount from ₹${MIN_AMOUNT} to ₹${MAX_AMOUNT}.`);
      return;
    }

    setIsLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay Checkout could not load. Check your connection and try again.");

      const orderResponse = await fetch(`${API_BASE_URL}/order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Could not create a payment order.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: String(order.amount),
        currency: order.currency,
        order_id: order.id,
        name: "Razorpay Checkout Demo",
        description: "Test mode checkout example",
        handler: handleCheckoutSuccess,
        modal: { ondismiss: () => setIsLoading(false) }
      });

      checkout.on("payment.failed", () => {
        toast.error("Payment was not completed. Please try again.");
        setIsLoading(false);
      });
      checkout.open();
    } catch (error) {
      toast.error(error.message || "Unable to start checkout.");
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <section className={styles.main} aria-labelledby="payment-title">
        <h1 id="payment-title" className={styles.title}>Razorpay Checkout</h1>
        <p className={styles.description}>Create a test order and verify the Checkout signature on the server.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amount}
            onChange={handleAmountChange}
            className={styles.amountInput}
            placeholder="Enter amount"
            label="Amount in INR"
            error={Boolean(amountError)}
            helperText={amountError || `Enter ₹${MIN_AMOUNT}–₹${MAX_AMOUNT}.`}
            disabled={isLoading}
            InputProps={{
              startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon /></InputAdornment>
            }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? <CircularProgress size={22} color="inherit" /> : "Make payment"}
          </Button>
        </form>
      </section>
    </main>
  );
}
