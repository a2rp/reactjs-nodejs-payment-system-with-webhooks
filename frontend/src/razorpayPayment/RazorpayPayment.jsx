import React, { useState } from "react";
import styles from "./styles.module.scss";
import { Button, CircularProgress, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { toast } from "react-toastify";
import axios from "axios";

const RazorpayPayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [amountInput, setAmountInput] = useState(0);
    const [amountInputError, setAmountInputError] = useState(0);

    const handleAmountInputChange = (event) => {
        const regex = /[^0-9]/ig;
        const value = event.target.value.replace(regex, "").slice(0, 4);
        setAmountInput(value);
        if (value.trim().length === 0) {
            setAmountInputError("Please enter amount here");
        } else if (parseInt(value) < 101) {
            setAmountInputError("Minimum Rs. 501 required");
        } else {
            setAmountInputError("");
        }
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            }
            script.onerror = () => {
                resolve(false);
            }
            document.body.appendChild(script);
        })
    }

    async function displayRazorpay() {
        try {
            if (amountInputError.length > 0) {
                return toast.warn("form contains errors");
            }

            setIsLoading(true);
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) {
                return toast.warn("Razorpay SDK failed to load. Are you online?");
            }

            const config = {
                url: "/order/create",
                method: "POST",
                data: { amount: amountInput }
            };
            const response = await axios(config);
            const data = response.data;

            const options = {
                key: "rzp_test_C9GWa8qaeB9Rak",
                currency: data.currency,
                amount: data.amount.toString(),
                order_id: data.id,
                name: "Donation",
                description: "Thank you. Give me money.",
                // image: "http://localhost:1337/logo.svg",
                handler: function (response) {
                    toast.info("Payment id: " + response.razorpay_payment_id)
                    toast.info("Order id: " + response.razorpay_order_id)
                    toast.info("Signature: " + response.razorpay_signature)
                },
                prefill: {
                    name: "Ashish Ranjan",
                    email: "user1@mail.com",
                    phone_number: "1111111111"
                }
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            // test card 4111 1111 1111 1111
        } catch (error) {
            console.log(error, "error");
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log(amountInput, "amount");
        displayRazorpay();
    };

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles.title}>Razorpay Payment</div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CurrencyRupeeIcon />
                                </InputAdornment>
                            ),
                        }}
                        value={amountInput}
                        onChange={handleAmountInputChange}
                        className={styles.amountInput}
                        placeholder="Please enter amount"
                        label="Amount"
                        error={amountInputError.length > 0}
                        helperText={amountInputError.length > 0
                            ? amountInputError
                            : ""}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >{isLoading ? <CircularProgress sx={{ padding: "5px" }} /> : "Make payment"}</Button>
                </form>
            </div>
        </div>
    )
}

export default RazorpayPayment
