# TiniWish — Foundational Architecture & API Standards

> **Brand**: TiniWish  
> **Tagline**: *"Little wishes. Timeless treasures."*  
> **Architecture Pattern**: Modular Monolith  
> **Version**: 1.1.0  
> **Last Updated**: 2026-11-07  

---

## 1. Architectural Layers & Separation of Concerns

TiniWish follows a clean, layered Modular Monolith design within Next.js App Router. Code is organized into explicit layers to decouple user interfaces, transport contracts, domain business rules, and database operations.

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│   Server Components (SSR/RSC) & Client Components     │
│   (Storefront, Category Pages, PDP, Admin Dashboard)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               TRANSPORT / API LAYER (/api/v1)           │
│   • Versioned Route Handlers (/api/v1/*)               │
│   • Request Validation (Zod schemas)                   │
│   • Centralized Error Catching (handleApiError)        │
│   • Uniform JSON Response Serialization               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                      │
│   • Pure Domain Business Logic (ProductService, etc.)  │
│   • Pricing, Discounts, GST Calculations               │
│   • Inventory reservation & state machines             │
│   • Authorization and domain invariants                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                     │
│   • Data Access Objects (ProductRepository, etc.)      │
│   • Queries, filtering, joins & projections            │
│   • Data mapping from DB rows to typed DTOs            │
│   • Graceful fallback handling                         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DATABASE / PERSISTENCE                │
│   • Prisma ORM Client (lib/prisma.ts)                  │
│   • PostgreSQL Database (Supabase)                     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Centralized API Response Contracts

All REST API endpoints under `/api/v1/*` strictly adhere to uniform JSON contracts.

### 2.1 Success Contract

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
```

**HTTP 200 / 201 Response Payload Example**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "prod_kundan_choker",
    "title": "Noor Meenakari & Kundan Choker Necklace Set",
    "slug": "noor-meenakari-kundan-choker-set"
  }
}
```

### 2.2 Error Contract

```typescript
export interface ApiErrorDetail {
  code: ApiErrorCode | string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetail;
}
```

**HTTP 400 / 404 / 500 Response Payload Example**:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

### 2.3 Paginated Response Contract

```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

---

## 3. Centralized Error Taxonomy & Handling

The application provides a typed hierarchy of domain errors extending `AppError`:

| Error Class | HTTP Status | Error Code | Description |
| :--- | :---: | :--- | :--- |
| `ValidationError` | `400` | `VALIDATION_ERROR` | Request payload or query parameter failed validation. |
| `BadRequestError` | `400` | `BAD_REQUEST` | Malformed syntax or invalid state transition. |
| `UnauthorizedError` | `401` | `UNAUTHORIZED` | Authentication token missing, expired, or invalid. |
| `ForbiddenError` | `403` | `FORBIDDEN` | Authenticated user lacks required role (`ADMIN`, etc.). |
| `NotFoundError` | `404` | `NOT_FOUND` | Target entity does not exist. |
| `ConflictError` | `409` | `CONFLICT` | Unique key violation (e.g. duplicate SKU or email). |
| `RateLimitError` | `429` | `RATE_LIMIT_EXCEEDED` | Request rate limit exceeded. |
| `InternalServerError` | `500` | `INTERNAL_SERVER_ERROR` | Unhandled runtime exception. |

### Global Handler: `handleApiError(error: unknown)`
The `handleApiError` utility inspects incoming errors:
1. Translates `AppError` instances directly to their designated status and error code.
2. Translates `ZodError` into `400 VALIDATION_ERROR` with structured field paths.
3. Translates Prisma known errors (e.g., `P2002` duplicate key -> `409 CONFLICT`, `P2025` record missing -> `404 NOT_FOUND`).
4. Masks internal stack traces in production to prevent information disclosure.

---

## 4. Request Validation Utilities (Zod)

`src/lib/validation.ts` provides reusable parsing functions:

1. **`validateRequestBody<T>(request: Request, schema: ZodSchema<T>): Promise<T>`**
   Safely reads JSON body. Throws `ValidationError("Invalid JSON in request body")` on malformed JSON, and passes schema validation errors to the global error handler.

2. **`validateQueryParams<T>(url: URL | string, schema: ZodSchema<T>): T`**
   Converts URL search parameters into strongly-typed objects with type coercion (e.g. `page: z.coerce.number()`).

---

## 5. Pagination Utilities

`src/lib/pagination.ts` standardizes pagination arithmetic across all data sets:
- **`parsePaginationParams(options)`**: Sanitizes input `page` (min 1) and `limit` (bounded between 1 and `maxLimit`, default 12).
- **`buildPaginationMeta(totalCount, page, limit)`**: Computes `totalPages`, `hasNextPage`, and `hasPreviousPage`.
- **`paginateArray(items, page, limit)`**: Provides slicing for cached or in-memory arrays.

---

## 6. Structured Logging

`src/lib/logger.ts` implements a zero-dependency logger:
- **Production**: Emits structured single-line JSON logs (`timestamp`, `level`, `message`, `meta`, `error.stack`) compatible with Datadog, CloudWatch, and Vercel Log Drains.
- **Development**: Emits ANSI-colored, human-readable terminal output.

---

## 7. Authentication & Authorization Helpers

`src/lib/auth.ts` provides reusable guards for Route Handlers and Server Actions:
- **`getAuthUser(request)`**: Extracts bearer token and validates session context.
- **`requireAuth(request)`**: Enforces authentication, throwing `UnauthorizedError` if no active session is found.
- **`requireRole(request, allowedRoles)`**: Enforces Role-Based Access Control (`CUSTOMER`, `SUPPORT`, `ADMIN`), throwing `ForbiddenError` on privilege mismatch.

