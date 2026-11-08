/**
 * Formats a number or numeric string to Indian Rupee (INR) currency representation.
 * Example: 1499 -> "₹1,499"
 */
export function formatINR(
  amount: number | string,
  options?: { showDecimals?: boolean }
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options?.showDecimals ? 2 : 0,
    minimumFractionDigits: options?.showDecimals ? 2 : 0,
  }).format(numericAmount);
}

/**
 * Calculates Indian GST components based on inclusive price
 */
export function calculateGSTInclusive(grossAmount: number, gstRatePercent: number = 3) {
  const taxableAmount = grossAmount / (1 + gstRatePercent / 100);
  const totalGst = grossAmount - taxableAmount;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  return {
    grossAmount,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    totalGst: Math.round(totalGst * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
  };
}

