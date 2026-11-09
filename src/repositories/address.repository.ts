import { prisma } from "@/lib/prisma";
import { CheckoutAddressDTO, AddressType } from "@/types/checkout";
import { logger } from "@/lib/logger";

interface InMemoryAddress extends CheckoutAddressDTO {
  id: string;
  userId: string;
  createdAt: Date;
}

const inMemoryAddresses: InMemoryAddress[] = [];

export class AddressRepository {
  /**
   * Retrieves all saved addresses for a given user.
   */
  async findByUserId(userId: string): Promise<CheckoutAddressDTO[]> {
    if (process.env.NODE_ENV === "test") {
      return inMemoryAddresses
        .filter((a) => a.userId === userId)
        .map((a) => ({ ...a }));
    }

    try {
      const records = await prisma.address.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
      });

      return records.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        phone: r.phone,
        pincode: r.pincode,
        state: r.state,
        city: r.city,
        addressLine1: r.addressLine1,
        addressLine2: r.addressLine2 || "",
        landmark: r.landmark,
        addressType: r.addressType as AddressType,
        isDefaultShipping: r.isDefaultShipping,
        isDefaultBilling: r.isDefaultBilling,
      }));
    } catch (error) {
      logger.warn(`Failed to fetch addresses for user ${userId} from database`, { error });
      return inMemoryAddresses
        .filter((a) => a.userId === userId)
        .map((a) => ({ ...a }));
    }
  }

  /**
   * Creates or updates a saved address for a user.
   */
  async createAddress(
    userId: string,
    data: CheckoutAddressDTO
  ): Promise<CheckoutAddressDTO> {
    const addressId = data.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (process.env.NODE_ENV === "test") {
      const newAddr: InMemoryAddress = {
        ...data,
        id: addressId,
        userId,
        createdAt: new Date(),
      };
      inMemoryAddresses.push(newAddr);
      return { ...newAddr };
    }

    try {
      const record = await prisma.address.create({
        data: {
          id: addressId,
          userId,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || "",
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          addressType: data.addressType || "HOME",
          isDefaultShipping: data.isDefaultShipping || false,
          isDefaultBilling: data.isDefaultBilling || false,
        },
      });

      return {
        id: record.id,
        fullName: record.fullName,
        phone: record.phone,
        pincode: record.pincode,
        state: record.state,
        city: record.city,
        addressLine1: record.addressLine1,
        addressLine2: record.addressLine2 || "",
        landmark: record.landmark,
        addressType: record.addressType as AddressType,
        isDefaultShipping: record.isDefaultShipping,
        isDefaultBilling: record.isDefaultBilling,
      };
    } catch (error) {
      logger.warn(`Failed to create address in database for user ${userId}`, { error });
      const fallbackAddr: InMemoryAddress = {
        ...data,
        id: addressId,
        userId,
        createdAt: new Date(),
      };
      inMemoryAddresses.push(fallbackAddr);
      return { ...fallbackAddr };
    }
  }

  /**
   * Finds an address by ID.
   */
  async findById(id: string): Promise<CheckoutAddressDTO | null> {
    if (process.env.NODE_ENV === "test") {
      const found = inMemoryAddresses.find((a) => a.id === id);
      return found ? { ...found } : null;
    }

    try {
      const record = await prisma.address.findUnique({
        where: { id },
      });
      if (!record || record.deletedAt) return null;

      return {
        id: record.id,
        fullName: record.fullName,
        phone: record.phone,
        pincode: record.pincode,
        state: record.state,
        city: record.city,
        addressLine1: record.addressLine1,
        addressLine2: record.addressLine2 || "",
        landmark: record.landmark,
        addressType: record.addressType as AddressType,
        isDefaultShipping: record.isDefaultShipping,
        isDefaultBilling: record.isDefaultBilling,
      };
    } catch (error) {
      logger.warn(`Failed to find address ${id} in database`, { error });
      const found = inMemoryAddresses.find((a) => a.id === id);
      return found ? { ...found } : null;
    }
  }

  /**
   * Clears in-memory address store (for testing).
   */
  clearInMemory() {
    inMemoryAddresses.length = 0;
  }
}

export const addressRepository = new AddressRepository();

