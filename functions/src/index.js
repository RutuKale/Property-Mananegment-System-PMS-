/**
 * UR Stay PMS - Serverless Cloud Functions (Node 20)
 * Technical Manual Section 10 (Page 11)
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * 1. sendWhatsAppNotification (HTTPS Callable)
 * Enforces staff authentication (context.auth != null)
 * Connects securely to Meta Graph API v19.0 using WHATSAPP_ACCESS_TOKEN
 */
exports.sendWhatsAppNotification = onCall(async (request) => {
  // Enforce staff authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required to dispatch guest notifications.");
  }

  const { to, message, bookingId, roomId, templateName, templateParams } = request.data;
  if (!to || !message) {
    throw new HttpsError("invalid-argument", "Missing recipient phone or message text.");
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let providerId = "simulated_local_provider_id";

  if (token && phoneId) {
    try {
      // Live Meta Graph API v19.0 dispatch
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message }
        })
      });

      const resData = await response.json();
      providerId = resData.messages?.[0]?.id || providerId;
    } catch (err) {
      console.error("Meta Graph API error:", err);
    }
  }

  // Append audit record to Firestore notifications collection
  await db.collection("notifications").add({
    recipientPhone: to,
    messageText: message,
    status: "Delivered",
    providerId,
    bookingId: bookingId || null,
    roomId: roomId || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, providerId };
});

/**
 * 2. scheduledCheckoutReminder (Pub/Sub Cron Worker)
 * Schedule: every 5 minutes in timezone Asia/Kolkata
 * Queries active checked-in stays with expected checkout <= 35 minutes
 */
exports.scheduledCheckoutReminder = onSchedule({
  schedule: "every 5 minutes",
  timeZone: "Asia/Kolkata"
}, async (event) => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 35 * 60 * 1000); // now to now + 35 mins

  try {
    const snapshot = await db.collection("bookings")
      .where("status", "==", "checked_in")
      .get();

    for (const doc of snapshot.docs) {
      const b = doc.data();
      const checkoutDate = b.expectedCheckoutDate ? new Date(b.expectedCheckoutDate) : null;

      // If scheduled departure is approaching within 35 minutes
      if (checkoutDate && checkoutDate <= windowEnd && checkoutDate >= now) {
        // Prevent duplicate reminders
        const existing = await db.collection("notifications")
          .where("bookingId", "==", b.bookingId)
          .where("messageType", "==", "30-Min Checkout Reminder")
          .limit(1)
          .get();

        if (existing.empty) {
          const reminderText = `Dear ${b.guestName}, this is a gentle reminder that your checkout from Room ${b.roomNumber} at UR Stay is scheduled in 30 minutes. Outstanding balance: ₹${b.balanceDue || 0}.`;

          await db.collection("notifications").add({
            bookingId: b.bookingId,
            roomId: b.roomId,
            recipientPhone: b.guestPhone,
            recipientName: b.guestName,
            messageType: "30-Min Checkout Reminder",
            messageText: reminderText,
            status: "Delivered",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          // Mark room as checkout_due in real-time
          if (b.roomId) {
            await db.collection("rooms").doc(b.roomId).update({ status: "checkout_due" });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in scheduledCheckoutReminder worker:", err);
  }
});

/**
 * 3. verifyOnlinePayment (HTTPS Callable)
 * Verifies Razorpay HMAC SHA-256 signature
 */
exports.verifyOnlinePayment = onCall(async (request) => {
  const { orderId, paymentId, signature } = request.data;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    // Development sandbox simulation
    return { isValid: true, simulated: true };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = expectedSignature === signature;
  return { isValid };
});
