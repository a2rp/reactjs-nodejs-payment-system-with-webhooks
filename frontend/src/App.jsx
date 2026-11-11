import RazorpayPayment from "./razorpayPayment/RazorpayPayment";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <RazorpayPayment />
      <ToastContainer position="bottom-right" />
    </>
  );
}
