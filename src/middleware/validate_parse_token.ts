import type { Request, Response, NextFunction } from "express";
import { parseJwt } from "../lib/parse_jwt";

/**
 * 驗證並解析 Token 的 Middleware
 */
export const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "未提供 Token" });
    return;
  }

  const parse_result = parseJwt(token);

  if (!parse_result) {
    res.status(401).json({ message: "無效的 Token" });
    return;
  }

  (req as any).account_id = parse_result.id;
  (req as any).account_username = parse_result.username;
  (req as any).account_role = parse_result.role;
  next();
};

export default authenticateMiddleware;
