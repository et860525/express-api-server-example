/**
 * Prisma client Singleton
 *
 * 統一在此建立並匯出 prisma 實例，確保整個專案共用同一個資料庫連線，
 * 避免每個檔案各自建立 PrismaClient 導致連線數過多。
 */
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { type Prisma, PrismaClient } from "../generated/prisma/client";

// 使用 .env 的資料庫設定建立 MariaDB 連線 adapter
const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// 建立 Prisma client，注入 MariaDB adapter
const prisma = new PrismaClient({ adapter });

// 用於 service 層的型別：支援一般查詢與 transaction 內的 client
export type PrismaExecutor = Prisma.TransactionClient | PrismaClient;

export default prisma;
