import React from "react";

export default function RazorpayButton({ flight }) {
  const handlePayment = async () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: flight.price * 100,
      currency: "INR",
      name: "Flight Booking",
      description: `Booking for ${flight.company}`,
      handler: function (response) {
        alert("Payment Successful!");
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        bookings.push({ ...flight, paymentId: response.razorpay_payment_id });
        localStorage.setItem("bookings", JSON.stringify(bookings));
      },
      prefill: {
        name: "John Doe",
        email: "test@example.com",
        contact: "9999999999",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      className="bg-green-500 text-white px-3 py-1 rounded"
      onClick={handlePayment}
    >
      Book
    </button>
  );
}
