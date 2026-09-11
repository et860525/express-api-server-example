import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env";
import prisma from "./lib/prisma";
import logger from "./logger";
import { errorHandler, notFoundHandler } from "./middleware/error_handler";
import { requestLogger } from "./middleware/request_logger";
import { setupSwagger } from "./swagger";

// ====== 環境變數 ======
const port = env.PORT;
const appName = env.APP_NAME;
const baseUrl = env.BASE_URL;

const isProduction = env.ENV === "production";

const corsOrigin = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : isProduction
    ? []
    : true;

const app = express();

prisma.$connect().then(() => {
  console.log("Connected to database");
});

// ====== 套件設定 ======
app.use(helmet());
// 開發環境用 morgan 在終端機看即時請求；正式環境改用 requestLogger 寫入 logs/，
// 兩者同時開會造成每個請求被記錄兩次，所以依環境二選一
if (isProduction) {
  app.use(requestLogger);
} else {
  app.use(morgan("dev"));
}
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ====== 預設 API ======
app.get("/", (req, res) => {
  res.json({ message: "Server is running!", env: env.ENV });
});

// ====== 健康檢查（實際確認資料庫連線，供 Docker / 負載平衡器探測用）======
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// ====== 路由註冊 ======
import authRoutes from "./api/auth/auth.routes";

app.use("/auth", authRoutes);

// ====== Swagger ======
// 正式環境預設不對外開放 API 文件，避免洩漏 API 結構
if (!isProduction) {
  setupSwagger(app);
}

// ====== 404 / 錯誤處理（須放在所有路由之後）======
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(
    `[${appName}]: Server is running at http://localhost:${port} in ${env.ENV}`,
  );
  if (baseUrl) {
    console.log(`[${appName}]: Deployed at ${baseUrl}`);
  }
});
