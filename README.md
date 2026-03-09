# Express API Server

使用 **Bun + Express + TypeScript + Prisma** 建置的後端初始模板。

## 技術棧

| 工具 | 用途 |
|---|---|
| [Bun](https://bun.sh) | Runtime / 套件管理 |
| [Express 5](https://expressjs.com) | HTTP 框架 |
| [Prisma](https://www.prisma.io) | ORM(支援 MariaDB / MySQL) |
| [Zod](https://zod.dev) | Schema 驗證 |
| [JWT](https://github.com/auth0/node-jsonwebtoken) | Token 驗證 |
| [Swagger](https://swagger.io) | API 文件(`/api-docs`) |
| [Biome](https://biomejs.dev) | Linter / Formatter |
| [PM2](https://pm2.keymetrics.io) | 程序管理(正式環境) |
| Docker | 容器化部署 |

## 目錄結構

```
src/
├── api/
│   └── auth/                  # 認證模組(login 範例)
│       ├── logic/             # 業務邏輯
│       ├── auth.routes.ts     # 路由
│       ├── auth.controller.ts # Controller
│       ├── auth.service.ts    # 資料庫存取
│       └── auth.dto.ts        # 請求驗證 schema(Zod)
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── parse_jwt.ts           # JWT 解析
│   ├── send_mail.ts           # 寄信(Nodemailer)
│   ├── file.ts                # 檔案工具
│   └── date_utils.ts          # 日期工具
├── middleware/
│   ├── validate_parse_token.ts # JWT 驗證 middleware
│   └── upload.ts              # 檔案上傳(Multer)
├── types/
│   ├── api_response.ts        # ApiResponse 型別
│   └── token_request.ts       # 帶有 token 資訊的 Request 型別
└── app.ts                     # 程式入口
```

## 使用此模板建立新專案

> **注意：** 此模板建立時所有套件版本均為當下最新版。開始新專案前，建議先更新所有依賴：
> ```bash
> bun update --latest -u && bun install
> ```

Clone 後需手動修改以下項目：

1. **`docker-compose.yaml`** — 將 `name` 與 `container_name` 改為你的專案名稱：
   ```yaml
   name: your-project-name
   services:
     app:
       container_name: your-project-name_backend
   ```

2. **`ecosystem.config.cjs`** — 將 `name` 改為你的專案名稱（PM2 顯示用）：
   ```js
   name: "your-project-name"
   ```

3. **`.env`** — 將 `APP_NAME` 改為你的專案顯示名稱(用於 Swagger 標題)：
   ```
   APP_NAME=你的專案名稱
   ```

## 開始使用

### 1. 安裝依賴

```bash
bun install
```

### 2. 設定環境變數

```bash
cp .env.example .env
# 編輯 .env，填入資料庫和 JWT 設定
```

主要環境變數說明：

| 變數 | 說明 | 預設值 |
|---|---|---|
| `ENV` | 執行環境（`development` / `production`） | `development` |
| `PORT` | 伺服器監聽 port | `3000` |
| `APP_NAME` | 專案名稱(顯示於 Swagger 標題) | `預設專案` |
| `BASE_URL` | 對外的 base URL，留空則自動用 `PORT` 組成 | `http://localhost:{PORT}` |
| `JWT_SECRET` | JWT 簽名密鑰 | — |
| `DB_HOST` | 資料庫主機 | — |
| `DB_PORT` | 資料庫 port | `3306` |
| `DB_USERNAME` | 資料庫帳號 | — |
| `DB_PASSWORD` | 資料庫密碼 | — |
| `DB_DATABASE` | 資料庫名稱 | — |

> **部署提示：** 正式環境將 `BASE_URL` 填入正式網域(如 `https://example.com/api`)，`PORT` 不需修改。

### 3. 定義 Prisma Model

在 `prisma/schema.prisma` 新增你的 Model，然後執行：

```bash
bunx prisma migrate dev --name init
```

### 4. 更新 auth.service.ts

將 `getUserByEmail` 中的 TODO 替換成你的 model 查詢。

### 5. 啟動(詳見下方「部署」章節)

詳見下方「[部署](#部署)」章節。

API 文件：`http://localhost:{PORT}/api-docs`(預設 PORT=3000)

## 新增模組

依照 `src/api/auth/` 的結構建立新模組：

```
src/api/<module-name>/
├── logic/
│   └── <action>.logic.ts
├── <module>.routes.ts
├── <module>.controller.ts
├── <module>.service.ts
└── <module>.dto.ts
```

在 `src/app.ts` 註冊路由：

```ts
import myRoutes from "./api/<module-name>/<module>.routes";
app.use("/<module-name>", myRoutes);
```

## 部署

專案使用 Docker Compose 架設，分為資料庫與應用程式兩個部分。

### 1. 啟動資料庫

進入 `db/` 資料夾啟動 MariaDB：

```bash
cd db && docker compose up -d
```

### 2-a. 開發環境

回到根目錄，直接用 Bun 啟動：

```bash
cd .. && bun dev
```

### 2-b. 正式部署

部署前先確認 `.env` 已設定好：

```
BASE_URL=https://your-domain.com/api   # 對外的正式網域
```

在根目錄執行 Docker Compose，會自動執行 migrate 並以 PM2 啟動：

```bash
docker compose up -d
```
