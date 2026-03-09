import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./lib/prisma";
import { setupSwagger } from "./swagger";

// ====== 環境變數 ======
const env = process.env.ENV;
const port = process.env.PORT;
const appName = process.env.APP_NAME || "Server";
const baseUrl = process.env.BASE_URL;

const app = express();

prisma.$connect().then(() => {
  console.log("Connected to database");
});

// ====== 套件設定 ======
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== 預設 API ======
app.get("/", (req, res) => {
  res.json({ message: "Server is running!", env });
});

// ====== 路由註冊 ======
import authRoutes from "./api/auth/auth.routes";

app.use("/auth", authRoutes);

// ====== Swagger ======
setupSwagger(app);

app.listen(port, () => {
  console.log(
    `[${appName}]: Server is running at http://localhost:${port} in ${env}`,
  );
  if (baseUrl) {
    console.log(`[${appName}]: Deployed at ${baseUrl}`);
  }
});
