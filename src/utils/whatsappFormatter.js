/**
 * UR Stay PMS - WhatsApp Message Formatters (PDF Page 9)
 */

export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  // Strip spaces, dashes, parentheses
  const clean = String(phone).replace(/[\s\-\(\)]/g, '');
  // If 10 digits, prefix with 91
  if (/^\d{10}$/.test(clean)) {
    return `91${clean}`;
  }
  // If starts with +, strip +
  if (clean.startsWith('+')) {
    return clean.substring(1);
  }
  return clean;
}

export function formatCheckInWhatsAppMessage({
  guestName,
  bookingId,
  roomNumber,
  floorName = "Ground Floor",
  roomCategory = "Standard Deluxe",
  checkInDate,
  expectedCheckoutDate,
  ratePerNight,
  totalAmount,
  amountPaid,
  balanceDue,
  receptionPhone = "+91 98765 43210"
}) {
  return `Welcome to UR Stay Luxury Hotels & Resorts, ${guestName || 'Valued Guest'}!

Your check-in has been confirmed.

*Booking ID:* ${bookingId}
*Room Number:* ${roomNumber}
*Floor:* ${floorName}
*Room Type:* ${roomCategory}
*Check-in:* ${checkInDate || 'Today'}, 12:00 PM
*Expected Check-out:* ${expectedCheckoutDate || 'Tomorrow'}, 11:00 AM
*Room Rate:* ₹ ${ratePerNight?.toLocaleString('en-IN')} per night
*Total Amount:* ₹ ${totalAmount?.toLocaleString('en-IN')}
*Amount Paid:* ₹ ${amountPaid?.toLocaleString('en-IN')}
*Balance Due:* ₹ ${balanceDue?.toLocaleString('en-IN') || 0}

For assistance, please contact hotel reception at ${receptionPhone}.
We wish you a pleasant stay!`;
}

export function formatCheckoutReminderWhatsAppMessage({
  guestName,
  roomNumber,
  bookingId,
  checkoutTime = "11:00 AM",
  balanceDue = 0,
  receptionPhone = "+91 98765 43210"
}) {
  return `Dear ${guestName || 'Valued Guest'},

This is a gentle reminder that your check-out from Room ${roomNumber} at UR Stay Luxury Hotels & Resorts is scheduled in 30 minutes (${checkoutTime}).

*Booking ID:* ${bookingId}
*Outstanding Balance:* ₹ ${Number(balanceDue).toLocaleString('en-IN')}

${balanceDue > 0 ? "You can settle any incidental charges or dues at the front desk upon returning your room keycard.\n" : ""}
If you wish to extend your stay, please contact reception immediately at ${receptionPhone}.

Thank you for choosing UR Stay Luxury Hotels & Resorts!`;
}

export function createWaMeLink(phone, messageText) {
  const sanitized = sanitizePhoneNumber(phone);
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${sanitized}?text=${encoded}`;
}
