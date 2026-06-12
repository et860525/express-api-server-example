import type { Request } from "express";

// 獲得 Middleware 解析 token 傳回來的 account_id
export interface TokenRequest extends Request {
  account_id: number;
  account_username: string;
  account_role: number;
}
