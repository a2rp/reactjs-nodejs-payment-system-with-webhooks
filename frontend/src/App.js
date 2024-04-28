import React from 'react'
import RazorpayPayment from './razorpayPayment/RazorpayPayment'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';

const App = () => {
    axios.defaults.baseURL = "http://localhost:1198/api";

    return (
        <div>
            <hr />
            <RazorpayPayment />
            <hr />

            <ToastContainer />
        </div>
    )
}

export default App

