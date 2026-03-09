/**
 * JWT 解析工具
 *
 * 集中處理 JWT 驗證與解析邏輯，讓 middleware 與其他模組不需要直接依賴 jsonwebtoken，
 * 統一 token 結構(AccountToken) 與錯誤處理方式。
 */
import jwt from "jsonwebtoken";

// Token 解析後的資料結構，對應 JWT payload 中的使用者資訊
export type AccountToken = {
  id: number;
  email: string;
  role: number;
};

/**
 * 驗證並解析 JWT，回傳 payload 內的使用者資訊
 * @param token - Bearer token 字串(不含 "Bearer " 前綴)
 * @returns 解析成功回傳 AccountToken，驗證失敗(過期、偽造等)回傳 undefined
 */
export function parseJwt(token: string): AccountToken | undefined {
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AccountToken;

    return decodedToken;
  } catch (error) {
    console.error("JWT 解析錯誤");
    return;
  }
}
