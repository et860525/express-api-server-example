import type { Request } from "express";
import type { ApiResponse } from "../../../types/api_response";
import jwt from "jsonwebtoken";
import { loginDto } from "../auth.dto";
import { getUserByUsername } from "../auth.service";

/**
 * 登入
 * @param req - Express 請求物件
 * @returns 登入的結果，包含狀態碼與訊息
 */
export async function loginLogic(req: Request): Promise<ApiResponse> {
  // 1. 驗證請求資料格式
  const requestData = loginDto.safeParse(req.body);

  if (!requestData.success) {
    const errors_arr = requestData.error.issues.map((i) =>
      i.path.length > 0 ? `${i.message}` : i.message,
    );
    return { success: false, status: 400, message: errors_arr.join(", ") };
  }

  const { username, password } = requestData.data;

  // 2. 查詢使用者
  const user = await getUserByUsername(username);

  if (!user) {
    return { success: false, status: 400, message: "帳號或密碼錯誤" };
  }

  // 3. 驗證密碼
  const passwordMatch = await Bun.password.verify(
    password,
    (user as any).password,
  );

  if (!passwordMatch) {
    return { success: false, status: 400, message: "帳號或密碼錯誤" };
  }

  // 4. 產生 JWT
  const token = jwt.sign(
    {
      id: (user as any).id,
      username: (user as any).username,
      role: (user as any).role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" },
  );

  return {
    success: true,
    status: 200,
    message: "登入成功",
    data: {
      id: (user as any).id,
      token,
    },
  };
}
