import { z } from "zod";

// ====== 註冊 ======
export const registerDto = z.object({
  username: z
    .string({ message: "帳號不能為空" })
    .min(1, { message: "帳號不能為空" }),
  password: z
    .string({ message: "密碼不能為空" })
    .min(6, { message: "密碼至少 6 個字元" }),
});

// ====== 登入 ======
export const loginDto = z.object({
  username: z
    .string({ message: "帳號不能為空" })
    .min(1, { message: "帳號不能為空" }),
  password: z
    .string({ message: "密碼不能為空" })
    .min(1, { message: "密碼不能為空" }),
});
