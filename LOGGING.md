# Log 機制使用說明

本專案使用 `winston` 進行日誌管理，並透過 `winston-daily-rotate-file` 實作日誌檔案的每日輪替與保存。

## 1. 如何使用

在程式碼中引入 `logger` 即可開始寫入日誌。Logger 會自動將日誌輸出到 Console (終端機) 與 `logs/` 資料夾下的檔案。

```typescript
import logger from "./logger"; // 請依據檔案位置調整 import 路徑

// 範例
export const doSomething = () => {
  try {
    logger.info("開始執行任務...");

    // 模擬邏輯
    const result = 1 + 1;
    logger.debug(`計算結果: ${result}`);

  } catch (error) {
    // 錯誤物件可以直接傳入，Winston 會自動序列化
    logger.error("任務執行失敗", { error });
  }
};
```

## 2. Log 層級 (Levels)

根據訊息的重要性，請選擇適當的層級方法：

| 方法 | 層級 | 說明 | 寫入檔案 |
|---|---|---|---|
| `logger.error(...)` | 0 | **錯誤**：系統發生異常，需立即關注。 | `error.json` & `combined.json` |
| `logger.warn(...)` | 1 | **警告**：潛在問題或非預期操作，但不影響系統崩潰。 | `combined.json` |
| `logger.info(...)` | 2 | **資訊**：一般操作紀錄、流程狀態。 | `combined.json` |
| `logger.http(...)` | 3 | **HTTP**：API 請求紀錄 (通常由 Middleware 自動處理)。 | `combined.json` |
| `logger.debug(...)` | 4 | **除錯**：開發階段的詳細變數資訊。 | `combined.json` |

## 3. 檔案儲存位置

日誌檔案存放於專案根目錄的 `logs/` 資料夾中，並依日期自動切割。

### `logs/%DATE%-combined.json`

包含所有符合當前環境 Log Level 的日誌(`debug`、`http`、`info`、`warn`、`error`)。
適合用於：一般查詢、追蹤 API 請求流程、除錯。

### `logs/%DATE%-error.json`

**僅包含 `error` 層級**的日誌，內容是 `combined.json` 的子集。
適合用於：快速定位系統異常，不需翻閱大量一般 log。

> `logger.error(...)` 寫入的每一筆 log 都會**同時出現在兩個檔案**。

> **設定細節**：
> * 檔案保留期限：14 天 (`maxFiles: "14d"`)，過期檔案於下次 server 啟動並寫入 log 時自動刪除
> * 單檔最大限制：20MB (`maxSize: "20m"`)，超過會自動切割為 `.1`、`.2` 等後綴
> * 格式：JSON 格式，包含 timestamp。

## 4. 自動化 API Request Log

專案已在 `src/app.ts` 掛載 `requestLogger` middleware。
**您不需要在 Controller 中手動紀錄每一個 Request。**

當 API 請求結束時，系統會依據 Status Code 自動決定 Log 層級並紀錄以下資訊：
* HTTP Method & URL
* Status Code
* 執行時間 (Duration)
* Response Body

### Log 層級判斷規則

| Status Code | Log 層級 | 寫入檔案 |
|---|---|---|
| `< 400`(成功) | `info` | `combined.json` |
| `>= 400`(錯誤) | `error` | `error.json` & `combined.json` |

> 也就是說，400、404、500 等非成功回應，**無需手動呼叫 `logger.error()`**，requestLogger 會自動將其寫入 `error.json`。

## 5. 環境變數影響 (重要)

Log 的輸出過濾層級受 `ENV` 環境變數控制 (參見 `src/logger.ts`)：

* **Development (`ENV=development`)**:
  * Log Level: `debug` (會顯示 debug, info, warn, error)

* **Production (其他環境)**:
  * Log Level: `warn` (僅顯示 warn, error)
  * **注意**：在 Production 環境下，預設設定會過濾掉 `info` 層級 (包含 API Request Log)。若需在正式環境保留 Access Log，請修改 `src/logger.ts` 中的 `level` 判斷邏輯。