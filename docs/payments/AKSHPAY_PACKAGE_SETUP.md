# AkshPay Local Package Setup Guide

## 1. Executive Summary

This document describes the structure, build architecture, module resolution, and server-side integration of `akshpay` as a reusable local package inside the **TiniWish** monorepo (`packages/akshpay`).

The package allows TiniWish to accept direct zero-commission UPI payments via **PhonePe Business** and **Paytm Business** APIs and generate standard NPCI-compliant dynamic UPI QR codes and app intent links.

---

## 2. Package Architecture & Attribution

### 2.1 Location & Metadata
- **Directory**: `packages/akshpay/`
- **Package Name**: `akshpay` (version `1.0.0`)
- **License**: MIT
- **Original Author**: Robin Sharaya (`<robin.sharaya@gmail.com>`)
- **Upstream Repository Reference**: [Aksh-Systems-pvt/akshPay](https://github.com/Aksh-Systems-pvt/akshPay) (forked/derived from [iamrobinsharaya/upipay](https://github.com/iamrobinsharaya/upipay))

### 2.2 Directory Structure
```
packages/akshpay/
├── dist/                      # Generated bundle outputs (ignored from git)
│   ├── index.js / index.cjs / index.d.ts / index.d.cts
│   ├── adapters/
│   │   ├── phonepe.js / phonepe.cjs / phonepe.d.ts / phonepe.d.cts
│   │   └── paytm.js / paytm.cjs / paytm.d.ts / paytm.d.cts
│   ├── upi/
│   │   └── qr.js / qr.cjs / qr.d.ts / qr.d.cts
│   └── utils/
│       └── index.js / index.cjs / index.d.ts / index.d.cts
├── src/
│   ├── adapters/
│   │   ├── phonepe.ts         # PhonePe Business PG adapter (checksum v1)
│   │   └── paytm.ts           # Paytm Business initiateTransaction adapter
│   ├── interfaces/
│   │   └── psp-adapter.ts     # Common IPSPAdapter interface contract
│   ├── upi/
│   │   └── qr.ts              # NPCI-compliant UPI URI & QR generator
│   ├── utils/
│   │   ├── crypto.ts          # HMAC-SHA256, SHA256, constant-time compare
│   │   ├── currency.ts        # rupeesToPaise safe conversion helper
│   │   ├── ip-guard.ts        # CIDR origin verification middleware
│   │   ├── logger.ts          # Masked logger (redacts secrets & salt keys)
│   │   ├── retry.ts           # Exponential backoff retry utility
│   │   ├── sanitize.ts        # PSP error sanitization utility
│   │   └── validation.ts      # Input and order ID validator
│   ├── client.ts              # Unified UPIPay orchestrator class
│   ├── errors.ts              # Standardized UPIPayError hierarchy
│   ├── index.ts               # Public barrel export
│   └── types.ts               # TypeScript interfaces & types
├── tests/
│   ├── client.test.ts         # Client initialization & validation tests
│   ├── qr.test.ts             # NPCI URI generation & intent link tests
│   └── security.test.ts       # Checksums, replay, constant-time & amount tests
├── CHANGELOG.md
├── LICENSE                    # Preserved MIT License with original attribution
├── README.md                  # Complete SDK documentation
├── SECURITY.md                # Security policy and secret handling
├── package.json               # Package metadata and entrypoint declarations
├── tsconfig.json              # TypeScript compilation configuration
└── tsup.config.ts             # Dual ESM/CJS + DTS bundling configuration
```

---

## 3. Package Resolution & Build Strategy

To keep the repository fast, clean, and free from heavy monorepo tooling (like Nx, Turborepo, or Lerna), TiniWish uses **native npm workspaces** combined with **TypeScript path mapping**.

### 3.1 Root Configuration
1. **npm Workspaces (`package.json`)**:
   ```json
   {
     "workspaces": [
       "packages/*"
     ],
     "dependencies": {
       "akshpay": "*",
       "qrcode": "^1.5.4"
     },
     "devDependencies": {
       "@types/qrcode": "^1.5.5",
       "tsup": "^8.4.0"
     }
   }
   ```
   During `npm install`, npm establishes a symlink (`node_modules/akshpay -> packages/akshpay`), making the package discoverable as a standard module.

2. **TypeScript Path Mapping (`tsconfig.json`)**:
   ```json
   "paths": {
     "@/*": ["./src/*"],
     "akshpay": ["./packages/akshpay/src/index.ts"],
     "akshpay/*": ["./packages/akshpay/src/*"]
   }
   ```
   During local Next.js Turbopack development, Next.js resolves source TypeScript files directly from `packages/akshpay/src/index.ts`. This ensures instant hot-reloading and full IDE type inference without having to run a separate build daemon.

3. **Production Build Pipeline (`package.json`)**:
   ```json
   "scripts": {
     "build:packages": "npm --workspace=akshpay run build",
     "build": "npm --workspace=akshpay run build && next build"
   }
   ```
   Before `next build` runs, `tsup` generates production-grade CommonJS (`.cjs`), ECMAScript Modules (`.js`), and TypeScript definitions (`.d.ts` / `.d.cts`) in `packages/akshpay/dist/`. This guarantees full compatibility on Vercel and standalone Node servers.

---

## 4. Dependencies & Runtime Requirements

- **Runtime Dependency**: Strictly `qrcode` (`^1.5.4`).
- **Cryptography**: Uses Node.js native `node:crypto` (`createHash`, `createHmac`, `timingSafeEqual`).
- **HTTP Client**: Uses native global `fetch` with `AbortSignal.timeout(10000)`.
- **Zero Heavy Frameworks**: No monorepo daemon, no third-party HTTP libraries like Axios, and no external crypto libraries.

---

## 5. Security & Server-Only Enforcement

> [!IMPORTANT]
> **Server-Side Only**: `UPIPay` constructor checks for browser and React Native runtime globals (`window`, `navigator.product`). Attempting to instantiate `UPIPay` on the browser triggers:
> `InvalidConfigError: UPIPay cannot run in browser or React Native environments — merchant credentials must stay on the server.`

### Security Guidelines
1. **Never Commit Secrets**:
   Store merchant keys exclusively in `.env` / environment variables:
   - `PHONEPE_MERCHANT_ID`
   - `PHONEPE_SALT_KEY`
   - `PHONEPE_SALT_INDEX`
   - `PAYTM_MERCHANT_ID`
   - `PAYTM_MERCHANT_KEY`
2. **Server-Side API Route Only**:
   Only call `UPIPay` methods inside Next.js server actions, Route Handlers (`src/app/api/...`), or background workers.
3. **QR Generation**:
   Dynamic QR generation (`generateUPIQR`) can generate base64 PNG data URLs on the server, which are safely sent as strings in API responses to the frontend.

---

## 6. Usage Examples

### 6.1 Initializing Client (Server-Side)
```typescript
import { UPIPay } from "akshpay";

export const phonepeClient = new UPIPay({
  provider: "phonepe",
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  credentials: {
    merchantId: process.env.PHONEPE_MERCHANT_ID!,
    saltKey: process.env.PHONEPE_SALT_KEY!,
    saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
  },
});
```

### 6.2 Safe Currency Conversion
Avoid floating point precision issues (e.g., `5.99 * 100 = 599.0000000000001`):
```typescript
import { rupeesToPaise } from "akshpay";

const paise = rupeesToPaise(1499.50); // Returns integer 149950
```

### 6.3 Standalone NPCI UPI QR Code Generation
```typescript
import { generateUPIQR } from "akshpay";

const qr = await generateUPIQR({
  vpa: "tiniwish@ybl",
  name: "TiniWish Luxury Store",
  amount: 2499.00,
  orderId: "TW-2026-10492",
  note: "TiniWish Order TW-2026-10492",
  mode: "fixed", // NPCI mode 04 (non-editable exact amount)
});

console.log(qr.upiUri);  // upi://pay?pa=...
console.log(qr.qrImage); // data:image/png;base64,...
```

---

## 7. Verification & Testing

### 7.1 Running Verification Commands
- **Build Package**:
  ```bash
  npm run build:packages
  ```
- **Typecheck Package**:
  ```bash
  npm --workspace=akshpay run typecheck
  ```
- **Run Package Unit Tests & Integration Tests**:
  ```bash
  npx vitest run packages/akshpay/tests tests/integration/akshpay-package.test.ts
  ```
- **Run Full Repository Test Suite**:
  ```bash
  npm test
  ```
- **Run Full Production Build**:
  ```bash
  npm run build
  ```

### 7.2 Test Summary
| Scope | Total Test Suites | Total Tests | Status |
| :--- | :--- | :--- | :--- |
| TiniWish Application Tests | 29 | 237 | Passed |
| AkshPay Package Unit Tests | 3 | 120 | Passed |
| AkshPay Server Integration Tests | 1 | 5 | Passed |
| **Monorepo Total** | **33** | **362** | **100% Passed** |

