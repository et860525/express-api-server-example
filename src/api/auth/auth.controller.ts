import type { Request, Response } from "express";
import { loginLogic } from "./logic/login.logic";

// ====== 登入 ======
export const loginController = async (req: Request, res: Response) => {
  const result = await loginLogic(req);

  if (result.success) {
    res.status(result.status ?? 200).json({
      message: result.message,
      data: result.data,
    });
  } else {
    res.status(result.status ?? 400).json({ message: result.message });
  }
};
