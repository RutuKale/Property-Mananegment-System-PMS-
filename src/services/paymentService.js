/**
 * UR Stay PMS - Multi-Channel Payment Service
 * Supports Cash, Dynamic UPI QR (upi:// URI), Razorpay, Card POS
 */

export function generateUpiUri({
  upiId = "urstay@icici",
  payeeName = "UR Stay Luxury Hotels",
  amount = 0,
  transactionNote = "UR Stay Hotel Room Booking"
}) {
  const safeAmount = Math.max(0, Number(amount) || 0).toFixed(2);
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${safeAmount}&cu=INR&tn=${encodedNote}`;
}

export async function processRazorpayPayment({
  amount = 0,
  bookingId = "",
  guestName = "",
  guestEmail = "",
  guestPhone = "",
  onSuccess,
  onFailure
}) {
  const safeAmountInPaise = Math.round((Number(amount) || 0) * 100);

  // If Razorpay SDK is available on window
  if (typeof window !== 'undefined' && window.Razorpay) {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_URStayDemoKey",
      amount: safeAmountInPaise,
      currency: "INR",
      name: "UR Stay Luxury Hotels & Resorts",
      description: `Settlement for ${bookingId}`,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80",
      prefill: {
        name: guestName,
        email: guestEmail,
        contact: guestPhone
      },
      theme: {
        color: "#1e3a8a"
      },
      handler: function (response) {
        onSuccess?.({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id || `order_${Date.now()}`,
          signature: response.razorpay_signature || "simulated_valid_signature",
          method: "Razorpay Gateway"
        });
      },
      modal: {
        ondismiss: function () {
          onFailure?.(new Error("Payment cancelled by guest."));
        }
      }
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.open();
    return;
  }

  // Simulation mode (PDF Page 13: "paymentService.js provides test simulations when window.Razorpay is absent")
  const simulatedId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  onSuccess?.({
    paymentId: simulatedId,
    orderId: `order_sim_${Date.now()}`,
    signature: "simulated_valid_sha256",
    method: "Razorpay Gateway (Simulated)"
  });
}
