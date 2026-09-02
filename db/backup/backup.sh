#!/bin/sh
set -eu

# cron job 不會繼承容器啟動時的環境變數，需靠 entrypoint.sh 寫入的檔案取得 DB_PASSWORD、DB_DATABASE
. /container_env.sh

# ====== 設定 ======
DB_HOST="mariadb"
DB_USER="root"

BACKUP_ROOT="/backups"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"

DAILY_RETENTION_DAYS=7
WEEKLY_RETENTION_DAYS=28   # 最近 4 週
MONTHLY_RETENTION_DAYS=183 # 最近 6 個月（以 30.5 天/月估算）

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="${DB_DATABASE}_${TIMESTAMP}.sql.gz"
DAILY_FILE="${DAILY_DIR}/${FILENAME}"
DUMP_FILE="${DAILY_FILE%.gz}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "開始備份資料庫 ${DB_DATABASE}..."

# ====== 執行備份 ======
# 手動備份: docker exec toca-db-backup /backup.sh
# 先寫入未壓縮的暫存檔再壓縮，避免直接 pipe 進 gzip 時
# mariadb-dump 失敗也會被 gzip（吃到空輸入仍成功）蓋掉真正的錯誤結果
if mariadb-dump \
  -h "$DB_HOST" \
  -u "$DB_USER" \
  -p"$DB_PASSWORD" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "$DB_DATABASE" > "$DUMP_FILE"; then
  gzip "$DUMP_FILE"
  log "每日備份成功：${DAILY_FILE}"
else
  log "備份失敗！"
  rm -f "$DUMP_FILE"
  exit 1
fi

# ====== 每週備份（每週日額外保留一份到 weekly/）======
# if [ "$(date +%u)" = "7" ]; then
#   cp "$DAILY_FILE" "${WEEKLY_DIR}/${FILENAME}"
#   log "已建立週備份：${WEEKLY_DIR}/${FILENAME}"
# fi

# ====== 每月備份（每月 1 號額外保留一份到 monthly/）======
# if [ "$(date +%d)" = "01" ]; then
#   cp "$DAILY_FILE" "${MONTHLY_DIR}/${FILENAME}"
#   log "已建立月備份：${MONTHLY_DIR}/${FILENAME}"
# fi

# ====== 清除超過保留期限的備份 ======
find "$DAILY_DIR" -name "*.sql.gz" -mtime +"$DAILY_RETENTION_DAYS" -delete
# find "$WEEKLY_DIR" -name "*.sql.gz" -mtime +"$WEEKLY_RETENTION_DAYS" -delete
# find "$MONTHLY_DIR" -name "*.sql.gz" -mtime +"$MONTHLY_RETENTION_DAYS" -delete

log "備份清理完成"
