import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// ====== 環境變數 ======
const port = process.env.PORT || 3000;
const appName = process.env.APP_NAME || "預設專案";
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: `${appName} API 文件`,
      version: "1.0.0",
      description: `${appName} API`,
    },
    servers: [
      {
        url: baseUrl,
        description: "本地開發環境",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "帳號 API",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // 這裡指定包含註解的檔案路徑
  apis: ["./src/api/**/*.ts"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customSiteTitle: `${appName} Api`,
    }),
  );
  console.log(`Swagger UI is available at ${baseUrl}/api-docs`);
};
