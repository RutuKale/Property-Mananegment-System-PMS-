/**
 * UR Stay PMS - Indian GST SAC 996311 Pricing Engine
 * Hotel Accommodation Services
 */

export const SAC_CODE = "996311";
export const DEFAULT_CGST_PERCENT = 6;
export const DEFAULT_SGST_PERCENT = 6;
export const DEFAULT_TOTAL_GST_PERCENT = 12;

/**
 * Calculates itemized invoice breakdown adhering strictly to Indian GST SAC 996311
 */
export function calculateTariffBreakdown({
  ratePerNight = 0,
  nights = 1,
  adults = 1,
  children = 0,
  extraGuestSurcharge = 0,
  incidentals = 0,
  discount = 0,
  cgstPercent = DEFAULT_CGST_PERCENT,
  sgstPercent = DEFAULT_SGST_PERCENT
}) {
  const safeNights = Math.max(1, Number(nights) || 1);
  const safeRate = Math.max(0, Number(ratePerNight) || 0);
  const baseCharge = safeRate * safeNights;

  // Auto extra guest calculation if not manually specified:
  // e.g., if adults > 2, ₹800 per extra adult per night
  let calculatedExtraSurcharge = Number(extraGuestSurcharge) || 0;
  if (!extraGuestSurcharge && adults > 2) {
    calculatedExtraSurcharge = (adults - 2) * 800 * safeNights;
  }

  const safeIncidentals = Math.max(0, Number(incidentals) || 0);
  const safeDiscount = Math.max(0, Number(discount) || 0);

  // Subtotal before tax
  const subtotal = Math.max(0, baseCharge + calculatedExtraSurcharge + safeIncidentals - safeDiscount);

  // 12% GST Split: 6% CGST + 6% SGST
  const cgstAmount = Math.round((subtotal * (cgstPercent / 100)) * 100) / 100;
  const sgstAmount = Math.round((subtotal * (sgstPercent / 100)) * 100) / 100;
  const totalTax = Math.round((cgstAmount + sgstAmount) * 100) / 100;

  const totalPayable = Math.round((subtotal + totalTax) * 100) / 100;

  return {
    sacCode: SAC_CODE,
    ratePerNight: safeRate,
    nights: safeNights,
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    baseCharge,
    extraGuestSurcharge: calculatedExtraSurcharge,
    incidentals: safeIncidentals,
    discount: safeDiscount,
    subtotal,
    cgstPercent,
    sgstPercent,
    cgstAmount,
    sgstAmount,
    totalTax,
    totalPayable
  };
}

/**
 * Currency formatter for Indian Rupee (₹)
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Number formatter with standard Indian comma grouping
 */
export function formatIndianNumber(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN').format(num);
}
