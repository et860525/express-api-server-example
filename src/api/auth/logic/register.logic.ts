import type { Request } from "express";
import type { ApiResponse } from "../../../types/api_response";
import { registerDto } from "../auth.dto";
import { getUserByUsername, createUser } from "../auth.service";

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

  const { username, password } = requestData.data;

  // 2. 確認帳號是否已被註冊
  const existing = await getUserByUsername(username);

  if (existing) {
    return { success: false, status: 400, message: "此帳號已被註冊" };
  }

  // 3. 雜湊密碼
  const hashedPassword = await Bun.password.hash(password);

  // 4. 建立使用者
  const user = await createUser({ username, password: hashedPassword });

  return {
    success: true,
    status: 201,
    message: "註冊成功",
    data: {
      id: user.id,
      username: user.username,
    },
  };
}
