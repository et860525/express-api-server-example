/**
 * 啟動時驗證環境變數
 *
 * 必須在其他任何會讀取 process.env 的模組（例如 prisma.ts）之前被 import，
 * 缺漏或格式錯誤時直接讓程式無法啟動，而不是延遲到真正用到該變數時才出錯。
 */
import { z } from "zod";

const envSchema = z.object({
  ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive(),
  APP_NAME: z.string().default("Server"),
  BASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),

  JWT_SECRET: z.string().min(1),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),

  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().int().positive().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`環境變數設定有誤，程式無法啟動：\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
