import {
  IPaymentProvider,
  PaymentProviderName,
  DomainPaymentMethod,
} from "./types";
import { AkshPayUPIAdapter } from "./adapters/akshpay-upi.adapter";
import { CODAdapter } from "./adapters/cod.adapter";
import { RazorpayAdapter } from "./adapters/razorpay.adapter";
import { BadRequestError } from "@/lib/errors";

export class PaymentProviderRegistry {
  private providers = new Map<PaymentProviderName, IPaymentProvider>();
  private methodToProvider = new Map<DomainPaymentMethod, PaymentProviderName>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // 1. AkshPay PhonePe UPI Adapter
    const phonepeAdapter = new AkshPayUPIAdapter({ provider: "phonepe" });
    this.providers.set("AKSHPAY_PHONEPE", phonepeAdapter);

    // 2. AkshPay Paytm UPI Adapter
    const paytmAdapter = new AkshPayUPIAdapter({ provider: "paytm" });
    this.providers.set("AKSHPAY_PAYTM", paytmAdapter);

    // 3. Cash on Delivery (COD) Adapter
    const codAdapter = new CODAdapter();
    this.providers.set("COD", codAdapter);

    // 4. Razorpay Adapter
    const razorpayAdapter = new RazorpayAdapter();
    this.providers.set("RAZORPAY", razorpayAdapter);

    // Default method to provider bindings
    this.methodToProvider.set("UPI", "AKSHPAY_PHONEPE");
    this.methodToProvider.set("COD", "COD");
    this.methodToProvider.set("RAZORPAY", "RAZORPAY");
  }

  /**
   * Register or override a provider.
   */
  public registerProvider(provider: IPaymentProvider) {
    this.providers.set(provider.name, provider);
    for (const method of provider.supportedMethods) {
      this.methodToProvider.set(method, provider.name);
    }
  }

  /**
   * Get provider by exact name.
   */
  public getProvider(name: PaymentProviderName): IPaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new BadRequestError(`Payment provider '${name}' is not registered`);
    }
    if (!provider.isEnabled) {
      throw new BadRequestError(`Payment provider '${name}' is currently disabled`);
    }
    return provider;
  }

  /**
   * Get provider by payment method.
   */
  public getProviderForMethod(method: DomainPaymentMethod | string): IPaymentProvider {
    // Check if method is explicitly supported
    if (method !== "UPI" && method !== "COD" && method !== "RAZORPAY") {
      throw new BadRequestError(
        `Payment method '${method}' is currently disabled until an integrated provider is enabled`
      );
    }

    const providerName = this.methodToProvider.get(method as DomainPaymentMethod);
    if (!providerName) {
      throw new BadRequestError(`No active provider configured for payment method '${method}'`);
    }

    return this.getProvider(providerName);
  }

  /**
   * Check if a payment method is currently active and supported.
   */
  public isMethodSupported(method: string): boolean {
    if (method !== "UPI" && method !== "COD" && method !== "RAZORPAY") {
      return false;
    }
    const providerName = this.methodToProvider.get(method as DomainPaymentMethod);
    if (!providerName) return false;
    const provider = this.providers.get(providerName);
    return provider?.isEnabled === true;
  }
}

export const paymentProviderRegistry = new PaymentProviderRegistry();

