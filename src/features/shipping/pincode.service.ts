/**
 * Indian PIN Code Serviceability & Delivery Estimation Service
 */

export interface PincodeServiceabilityResult {
  pincode: string;
  isServiceable: boolean;
  city?: string;
  state?: string;
  estimatedDays: string;
  estimatedDeliveryDate: string;
  isCodAvailable: boolean;
  courier: string;
}

// Indian PIN Code Prefix Directory (1st digit represents postal zone)
const PIN_ZONE_DIRECTORY: Record<string, { state: string; metroCities: string[]; isMetro: boolean }> = {
  "11": { state: "Delhi", metroCities: ["Delhi", "New Delhi"], isMetro: true },
  "12": { state: "Haryana", metroCities: ["Gurugram", "Faridabad"], isMetro: true },
  "20": { state: "Uttar Pradesh", metroCities: ["Noida", "Ghaziabad"], isMetro: true },
  "40": { state: "Maharashtra", metroCities: ["Mumbai", "Thane", "Navi Mumbai"], isMetro: true },
  "41": { state: "Maharashtra", metroCities: ["Pune"], isMetro: true },
  "56": { state: "Karnataka", metroCities: ["Bengaluru"], isMetro: true },
  "60": { state: "Tamil Nadu", metroCities: ["Chennai"], isMetro: true },
  "50": { state: "Telangana", metroCities: ["Hyderabad"], isMetro: true },
  "70": { state: "West Bengal", metroCities: ["Kolkata"], isMetro: true },
  "38": { state: "Gujarat", metroCities: ["Ahmedabad"], isMetro: true },
  "30": { state: "Rajasthan", metroCities: ["Jaipur"], isMetro: false },
  "14": { state: "Punjab", metroCities: ["Chandigarh", "Ludhiana"], isMetro: false },
  "68": { state: "Kerala", metroCities: ["Kochi"], isMetro: false },
};

export class PincodeService {
  /**
   * Validates if a string is a valid 6-digit Indian PIN code.
   */
  isValidPincode(pincode: string): boolean {
    const clean = pincode.trim();
    return /^[1-9][0-9]{5}$/.test(clean);
  }

  /**
   * Estimates delivery days and arrival date based on Indian PIN code.
   */
  checkServiceability(pincode: string): PincodeServiceabilityResult {
    const clean = pincode.trim();

    if (!this.isValidPincode(clean)) {
      return {
        pincode: clean,
        isServiceable: false,
        estimatedDays: "N/A",
        estimatedDeliveryDate: "Invalid PIN Code",
        isCodAvailable: false,
        courier: "N/A",
      };
    }

    const prefix = clean.substring(0, 2);
    const zoneInfo = PIN_ZONE_DIRECTORY[prefix];

    const isMetro = zoneInfo?.isMetro ?? false;
    const state = zoneInfo?.state || "India";
    const city = zoneInfo?.metroCities?.[0] || "Regional Hub";

    // Delivery duration calculation
    const transitDays = isMetro ? 2 : 4;
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + transitDays * 24 * 60 * 60 * 1000);

    const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    return {
      pincode: clean,
      isServiceable: true,
      city,
      state,
      estimatedDays: isMetro ? "2-3 business days" : "4-5 business days",
      estimatedDeliveryDate: formattedDate,
      isCodAvailable: true,
      courier: isMetro ? "BlueDart Express" : "Delhivery Surface",
    };
  }
}

export const pincodeService = new PincodeService();

