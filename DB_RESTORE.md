# 系統資料庫回復程序

當系統發生資料庫損毀、資料異常、誤刪資料或其他需要回復資料庫之情況時，可使用既有備份檔案進行 MariaDB 資料庫回復。

資料庫回復屬於重要維護作業，執行前應確認回復時間點、備份檔案及可能受到影響之資料範圍。

## 系統資訊

| 項目 | 內容 |
|---|---|
| 資料庫系統 | MariaDB（版本以實際執行中的 image 為準，可用 `docker exec express-api-server-db mariadb --version` 查詢） |
| MariaDB Container | `express-api-server-db`（定義於 `db/docker-compose.yaml`） |
| 備份排程 Container | `express-api-server-db-backup`（定義於 `db/docker-compose.yaml`，每日凌晨 3:00 執行備份，時區 `Asia/Taipei`） |
| Database 名稱 | `express-api-server-db`（即 `.env` 的 `DB_DATABASE`） |
| Database 使用者 | `root`（`.env` 的 `DB_PASSWORD` 對應 `MARIADB_ROOT_PASSWORD`） |
| 應停止之應用程式 Container | `express-api-server`（root `docker-compose.yaml` 的 `app` 服務，唯一會寫入資料庫的程式） |
| 備份檔案位置 | `db/db_backups/{daily,weekly,monthly}/`（備份邏輯見 `db/backup/backup.sh`） |
| 備份檔案命名規則 | `{DATABASE}_{YYYYMMDD}_{HHMMSS}.sql.gz`，例：`express-api-server-db_20260826_030000.sql.gz` |
| 備份檔案格式 | **SQL 格式**（`mariadb-dump` 純文字 SQL，經 gzip 壓縮），非 Custom Format |

因備份為 SQL 格式，回復時使用 **`mariadb` 用戶端**（PostgreSQL 情境下對應 `psql`；本系統不使用 Custom Format，故不需要 `pg_restore` 對應的工具）。

## 選擇回復用的備份檔案

1. 登入 Docker 主機，進入專案目錄下的 `db/db_backups/`。
2. 依備份檔案之日期及時間，於 `daily/`、`weekly/`、`monthly/` 三個資料夾中選擇欲回復的備份檔案：
   ```bash
   ls -la db/db_backups/daily/
   ```
3. 執行回復前應確認：
   - 備份檔案確實存在。
   - 備份檔案日期及時間符合預計回復之時間點。
   - 備份檔案大小與平時備份檔案相比無明顯異常（可用 `ls -lh` 比對）。
   - 已確認回復後可能遺失或被覆蓋之資料範圍。
4. 原則上應選擇「系統發生異常前，最近一次確認正常」之備份檔案。

## 暫停應用程式服務

執行資料庫回復前，應先停止會對 MariaDB 進行資料寫入之應用程式服務，以避免回復期間產生新的資料寫入。

```bash
docker compose stop app
```

- MariaDB Container（`express-api-server-db`）於回復期間**應維持運作**，回復是透過已存在的容器執行 SQL，不需要重建它。
- 應確認：
  - 使用者無法繼續操作系統。
  - 應用程式（`express-api-server`）不再對 MariaDB 進行資料寫入。

## 建立回復前備份

若目前 MariaDB 仍可正常存取，正式執行回復前應先建立一次目前資料庫之備份（「回復前備份」），用途為保留事故發生當下之資料。**除非確認目前資料庫無法正常存取，否則不應省略此步驟。**

```bash
docker exec express-api-server-db-backup /backup.sh
```

上述指令會在 `db/db_backups/daily/` 產生一份當下的備份。**接著手動複製到不受自動清除影響的位置**（自動清除機制只掃描 `daily/`、`weekly/`、`monthly/` 三個資料夾，另存到其他位置就不會被排程刪除）：

```bash
mkdir -p db/db_backups/incident
cp db/db_backups/daily/express-api-server-db_<剛產生的時間戳記>.sql.gz \
   db/db_backups/incident/pre_restore_$(date +%Y%m%d_%H%M%S)_<回復原因>.sql.gz
```

回復前備份應另行記錄：
- 備份日期及時間。
- 備份檔案名稱。
- 備份原因。
- 操作人員。

## MariaDB 資料庫回復

確認回復用備份檔案及回復前備份均已準備完成後，執行回復：

```bash
docker exec -i express-api-server-db sh -c 'gunzip | mariadb -u root -p"$MARIADB_ROOT_PASSWORD" express-api-server-db' \
  < db/db_backups/daily/<選定的備份檔>.sql.gz
```

此指令已實際還原測試資料庫驗證可行。設計上刻意避開兩個常見的作業系統相依問題：

- **解壓縮在容器內執行**，不依賴 Docker 主機是否安裝 `gunzip`（`mariadb` 官方 image 內已內建）。主機端只需把備份檔案的內容導向 `docker exec -i`，`<` 重新導向是 bash／PowerShell／cmd.exe 都支援的基本語法。
- **密碼直接讀取容器內既有的 `MARIADB_ROOT_PASSWORD` 環境變數**（`db/docker-compose.yaml` 啟動 `mariadb` 服務時已設定），不需要 Docker 主機的 shell 額外匯出 `DB_PASSWORD`，也就沒有 bash 的 `$VAR` 與 PowerShell 的 `$env:VAR` 語法差異問題。

若 Docker 主機是 Windows 且以 PowerShell 操作，上述指令可直接使用；若主機使用 cmd.exe，建議改用 PowerShell 或 Git Bash 執行（cmd.exe 對單引號／管線內容的處理方式不同，容易出錯）。本專案其餘部署方式（Dockerfile、PM2）皆以 Linux 為前提，正式環境 Docker 主機建議統一使用 Linux。

> **注意**：`mariadb-dump` 目前備份指令未加 `--add-drop-table`，因此匯入時**不會清空既有資料表**，只會重新執行備份內的 `CREATE TABLE IF NOT EXISTS`／`INSERT` 等語句，可能與現有異常資料混合。若需要「整庫覆蓋」效果，回復前應先手動清空／重建目標 database，或評估調整 `db/backup/backup.sh` 加上 `--add-drop-table` 參數。

回復時應確認：
- 使用正確日期之備份檔案。
- 使用正確的 Database（`express-api-server-db`）。
- 回復過程中無錯誤訊息。
- 回復程序確實執行完成（指令正常結束，無中斷）。
- 回復完成後資料庫可正常連線。

## 重新啟動系統

MariaDB 資料庫回復完成並確認資料庫可正常連線後，重新啟動先前停止之應用程式 Container：

```bash
docker compose start app
```

啟動後應確認：
- 應用程式 Container（`express-api-server`）正常運作。
- MariaDB Container（`express-api-server-db`）正常運作。
- 應用程式可正常連線 MariaDB。
- 系統無持續出現錯誤訊息。

## 回復後確認

系統重新啟動後，維護人員應進行以下確認：

- [ ] 系統首頁可正常開啟（`GET /` 應回傳 `{ message: "Server is running!" }`）。
- [ ] 使用者可正常登入。
- [ ] 系統可正常連線 MariaDB。
- [ ] 主要功能可正常操作。
- [ ] 回復之資料內容符合指定備份時間點。
- [ ] 重要資料表及資料內容可正常查詢。
- [ ] Docker 各項服務均正常運作（`docker ps` 確認皆為 Running）。
- [ ] 系統及 Docker Log 無持續性錯誤（詳見 `LOGGING.md`）。
- [ ] MariaDB 無持續性錯誤訊息。
- [ ] 確認每日凌晨 3:00 自動備份排程設定正常（`docker exec express-api-server-db-backup cat /var/log/backup.log`）。
- [ ] 回復完成後之下一次自動備份可正常產生備份檔案（隔日確認 `db/db_backups/daily/` 有新檔案）。

確認上述項目均正常後，即完成資料庫回復作業。

## 注意事項

- 資料庫回復會直接修改目前資料庫內容，執行前應確認備份檔案、回復時間點及影響範圍。
- 正式執行回復前，若資料庫仍可存取，應優先建立「回復前備份」。
- 不得使用未確認來源或日期不明之備份檔案進行正式環境回復。
- 正式環境執行資料庫回復時，應留下完整維護紀錄，至少應包含：
  - 操作日期及時間。
  - 操作人員。
  - 回復原因。
  - 使用之備份檔案名稱。
  - 備份日期及時間。
  - 回復前備份檔案名稱。
  - 回復結果。
  - 回復後系統確認結果。
  - 異常狀況及處理方式。
- 資料庫回復完成後，應確認系統功能、資料庫連線及自動備份機制均恢復正常。
