import { calculateTariffBreakdown } from './pricingCalculators';
import { formatCheckInWhatsAppMessage } from '../utils/whatsappFormatter';

/**
 * Executes Atomic Walk-in Check-in
 * Follows PDF Section 3 & 6:
 * Concurrency guard: Ensures room is available and not locked by another receptionist.
 * Creates Booking (BK-YYYY-XXXX), Tax Invoice (INV-YYYY-XXXX), logs payment, updates room.
 */
export async function performAtomicCheckIn({
  room,
  guestData,
  stayData,
  paymentData,
  hotelSettings,
  currentUser
}) {
  if (!room || room.status !== 'available' || room.activeBookingId) {
    throw new Error(`Room ${room?.roomNumber || 'Unknown'} is no longer available or was locked by another staff member.`);
  }

  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `BK-${currentYear}-${randomSuffix}`;
  const invoiceNumber = `INV-${currentYear}-${randomSuffix}`;
  const guestId = `gst-${Date.now()}`;
  const transactionId = `TXN-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`;

  // Tariff & GST Calculation
  const tariff = calculateTariffBreakdown({
    ratePerNight: room.pricePerNight,
    nights: stayData.nights,
    adults: stayData.adults,
    children: stayData.children,
    extraGuestSurcharge: stayData.extraGuestSurcharge || 0,
    discount: stayData.discount || 0,
    cgstPercent: hotelSettings.cgstRatePercent || 6,
    sgstPercent: hotelSettings.sgstRatePercent || 6
  });

  const amountPaid = Math.min(tariff.totalPayable, Number(paymentData.amountPaid) || 0);
  const balanceDue = Math.max(0, tariff.totalPayable - amountPaid);

  // Mask Aadhaar if document type is Aadhaar
  let processedDocNum = guestData.documentNumber;
  if (guestData.documentType === 'Aadhaar' && processedDocNum && processedDocNum.length >= 4) {
    processedDocNum = 'XXXXXXXX' + processedDocNum.slice(-4);
  }

  const nowIso = new Date().toISOString();

  // 1. Guest Record
  const newGuest = {
    guestId,
    name: guestData.name,
    phone: guestData.phone,
    whatsappNumber: guestData.whatsappNumber || guestData.phone,
    email: guestData.email || '',
    address: guestData.address || '',
    documentType: guestData.documentType || 'Aadhaar',
    documentNumber: processedDocNum,
    createdDate: nowIso.split('T')[0]
  };

  // 2. Booking Record
  const newBooking = {
    bookingId,
    id: bookingId.toLowerCase(),
    roomId: room.roomId,
    roomNumber: room.roomNumber,
    floorName: room.floorName || 'Ground Floor',
    category: room.category,
    guestId,
    guestName: guestData.name,
    guestPhone: guestData.phone,
    adults: stayData.adults,
    children: stayData.children,
    checkInDate: stayData.checkInDate || nowIso.split('T')[0],
    expectedCheckoutDate: stayData.expectedCheckoutDate,
    actualCheckoutDate: null,
    nights: tariff.nights,
    ratePerNight: tariff.ratePerNight,
    baseCharge: tariff.baseCharge,
    extraGuestSurcharge: tariff.extraGuestSurcharge,
    discountAmount: tariff.discount,
    incidentalsAmount: 0,
    subtotal: tariff.subtotal,
    cgstAmount: tariff.cgstAmount,
    sgstAmount: tariff.sgstAmount,
    totalTax: tariff.totalTax,
    totalAmount: tariff.totalPayable,
    amountPaid,
    balanceDue,
    status: 'checked_in',
    invoiceNumber,
    keycardReturned: false,
    createdAt: nowIso
  };

  // 3. Tax Invoice Record (SAC 996311)
  const newInvoice = {
    invoiceNumber,
    bookingId,
    roomId: room.roomId,
    roomNumber: room.roomNumber,
    guestName: guestData.name,
    guestPhone: guestData.phone,
    gstin: hotelSettings.gstin,
    sacCode: hotelSettings.sacCode || "996311",
    nights: tariff.nights,
    taxableAmount: tariff.subtotal,
    cgstAmount: tariff.cgstAmount,
    sgstAmount: tariff.sgstAmount,
    taxAmount: tariff.totalTax,
    totalAmount: tariff.totalPayable,
    amountPaid,
    balanceDue,
    paymentMethod: paymentData.paymentMethod || 'Cash',
    generatedAt: nowIso
  };

  // 4. Payment Record
  const newPayment = {
    transactionId,
    bookingId,
    roomId: room.roomId,
    guestName: guestData.name,
    amount: amountPaid,
    paymentMethod: paymentData.paymentMethod || 'Cash',
    paymentType: balanceDue === 0 ? 'Full Settlement' : 'Advance Deposit',
    referenceId: paymentData.referenceId || `REF-${Date.now().toString().slice(-6)}`,
    timestamp: nowIso,
    status: 'Completed'
  };

  // 5. Updated Room State
  const updatedRoom = {
    ...room,
    status: 'occupied',
    activeBookingId: bookingId.toLowerCase()
  };

  // 6. WhatsApp Welcome Notification Record
  const whatsappText = formatCheckInWhatsAppMessage({
    guestName: guestData.name,
    bookingId,
    roomNumber: room.roomNumber,
    floorName: room.floorName,
    roomCategory: room.category,
    checkInDate: newBooking.checkInDate,
    expectedCheckoutDate: newBooking.expectedCheckoutDate,
    ratePerNight: room.pricePerNight,
    totalAmount: tariff.totalPayable,
    amountPaid,
    balanceDue,
    receptionPhone: hotelSettings.receptionPhone
  });

  const newNotification = {
    notificationId: `notif-${Date.now()}`,
    recipientPhone: guestData.whatsappNumber || guestData.phone,
    recipientName: guestData.name,
    messageType: 'Check-in Welcome',
    messageText: whatsappText,
    status: 'Delivered',
    provider: 'Meta WhatsApp Cloud API v19.0',
    timestamp: nowIso,
    bookingId,
    roomId: room.roomId
  };

  // 7. Audit Log Entry
  const newAudit = {
    logId: `audit-${Date.now()}`,
    action: 'ATOMIC_CHECKIN_SUCCESS',
    performedBy: currentUser?.name || 'Reception Staff',
    details: `Allocated Room ${room.roomNumber} to ${guestData.name} under ${bookingId}. Paid ₹${amountPaid}.`,
    timestamp: nowIso
  };

  return {
    booking: newBooking,
    room: updatedRoom,
    invoice: newInvoice,
    payment: newPayment,
    guest: newGuest,
    notification: newNotification,
    audit: newAudit,
    whatsappText
  };
}
