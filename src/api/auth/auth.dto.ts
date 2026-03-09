import { z } from "zod";

// ====== 登入 ======
export const loginDto = z.object({
  account: z
    .string({ message: "account 不能為空" })
    .min(1, { message: "account 不能為空" })
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "account 格式錯誤，應為 Email 格式",
    }),
  password: z
    .string({ message: "密碼不能為空" })
    .min(1, { message: "密碼不能為空" }),
});
