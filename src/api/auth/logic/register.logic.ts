import type { Request } from "express";
import type { ApiResponse } from "../../../types/api_response";
import { registerDto } from "../auth.dto";
import { getUserByEmail, createUser } from "../auth.service";

/**
 * 註冊
 * @param req - Express 請求物件
 * @returns 註冊的結果，包含狀態碼與訊息
 */
export async function registerLogic(req: Request): Promise<ApiResponse> {
  // 1. 驗證請求資料格式
  const requestData = registerDto.safeParse(req.body);

  if (!requestData.success) {
    const errors_arr = requestData.error.issues.map((i) =>
      i.path.length > 0 ? `${i.message}` : i.message,
    );
    return { success: false, status: 400, message: errors_arr.join(", ") };
  }

  const { email, password } = requestData.data;

  // 2. 確認 email 是否已被註冊
  const existing = await getUserByEmail(email);

  if (existing) {
    return { success: false, status: 400, message: "此 Email 已被註冊" };
  }

  // 3. 雜湊密碼
  const hashedPassword = await Bun.password.hash(password);

  // 4. 建立使用者
  const user = await createUser({ email, password: hashedPassword });

  return {
    success: true,
    status: 201,
    message: "註冊成功",
    data: {
      id: user.id,
      email: user.email,
    },
  };
}
