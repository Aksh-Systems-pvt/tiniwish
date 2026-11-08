import { describe, it, expect } from "vitest";
import { formatINR, calculateGSTInclusive } from "@/utils/currency";

describe("Currency & GST Utilities", () => {
  it("formats numbers to Indian Rupee currency standard", () => {
    expect(formatINR(1499)).toMatch(/₹\s?1,499/);
    expect(formatINR(125000)).toMatch(/₹\s?1,25,000/);
    expect(formatINR("499.50", { showDecimals: true })).toMatch(/₹\s?499\.50/);
  });

  it("handles edge cases and invalid inputs gracefully", () => {
    expect(formatINR(0)).toMatch(/₹\s?0/);
    expect(formatINR("invalid")).toBe("₹0");
  });

  it("computes GST-inclusive components accurately", () => {
    // ₹1,030 gross with 3% GST (Jewellery rate)
    const result = calculateGSTInclusive(1030, 3);
    expect(result.taxableAmount).toBe(1000);
    expect(result.totalGst).toBe(30);
    expect(result.cgst).toBe(15);
    expect(result.sgst).toBe(15);
  });
});

