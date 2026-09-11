import type { NextFunction, Request, Response } from "express";
import { env } from "../env";
import logger from "../logger";

// 沒有匹配到任何路由，統一回 JSON 而非 Express 預設的 HTML 404 頁
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "找不到此路徑" });
};

// 集中處理所有未被個別 route/controller 攔截的錯誤（含 async route 內的 throw，
// Express 5 會自動轉呼叫這裡），避免洩漏 stack trace，並統一寫入 log
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 若已經開始回應（例如 stream 中途出錯），交給 Express 內建處理，不能再送一次 response
  if (res.headersSent) {
    next(err);
    return;
  }

  const status =
    typeof (err as { status?: unknown })?.status === "number"
      ? (err as { status: number }).status
      : 500;

  logger.error("Unhandled error", {
    error:
      err instanceof Error ? { message: err.message, stack: err.stack } : err,
    method: req.method,
    path: req.originalUrl,
  });

  const message =
    env.ENV === "production"
      ? "伺服器發生錯誤，請稍後再試"
      : err instanceof Error
        ? err.message
        : "伺服器發生錯誤";

  res.status(status).json({ message });
};
