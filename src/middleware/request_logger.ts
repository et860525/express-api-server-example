import type { Request, Response, NextFunction } from "express";
import logger from "../logger";

// 定義不想要紀錄 Log 的路徑前綴
const ignoredPaths = [
  "/favicon.ico",
  "/api-docs", // Swagger 文件通常不需要紀錄
  // "/health", // 未來如果有健康檢查 API 也可以加在這裡
];

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { method, originalUrl } = req;

  // 如果路徑符合忽略清單，直接跳過 Log 紀錄
  if (ignoredPaths.some((path) => originalUrl.startsWith(path))) {
    next();
    return;
  }

  const start = Date.now();

  // 備份原始的 res.json 方法
  const originalJson = res.json;

  // 覆寫 res.json 以便攔截 response body
  res.json = function (body) {
    // 將 body 存入 locals 以便後續讀取
    res.locals.responseBody = body;
    // 呼叫原始方法，確保回應正常送出
    return originalJson.call(this, body);
  };

  // 當請求結束時觸發紀錄
  res.on("finish", () => {
    // 如果 req.route 不存在，代表沒有匹配到任何 API 路徑 (即 404 Not Found)
    // 為了避免惡意掃描導致 Log 爆炸，這裡直接忽略不紀錄
    if (!req.route) {
      return;
    }

    const duration = Date.now() - start;

    const logData = {
      message: "API Request", // 這是給 console 看的簡短訊息
      method,
      path: originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      response: res.locals.responseBody, // 紀錄回傳內容
      // 若需要紀錄傳入參數，可解開下方註解
      // requestBody: req.body,
      // query: req.query,
    };

    // 這裡傳入物件，Winston 的 json format 會自動將其序列化存入檔案
    if (res.statusCode >= 400) {
      logger.error(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};
