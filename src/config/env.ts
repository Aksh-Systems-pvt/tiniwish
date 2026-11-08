import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("TiniWish"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional().default("placeholder-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional().default("placeholder-service-role-key"),

  // Razorpay
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().optional().default("placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default("placeholder_webhook_secret"),

  // Shiprocket
  SHIPROCKET_EMAIL: z.string().email().optional().default("dev@tiniwish.com"),
  SHIPROCKET_PASSWORD: z.string().optional().default("placeholder"),
  SHIPROCKET_WEBHOOK_SECRET: z.string().optional().default("placeholder"),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional().default("placeholder"),
  R2_ACCESS_KEY_ID: z.string().optional().default("placeholder"),
  R2_SECRET_ACCESS_KEY: z.string().optional().default("placeholder"),
  R2_BUCKET_NAME: z.string().optional().default("tiniwish-assets"),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().optional().default("http://localhost:3000/images"),

  // Resend
  RESEND_API_KEY: z.string().optional().default("re_placeholder"),
  RESEND_FROM_EMAIL: z.string().optional().default("orders@tiniwish.com"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;

