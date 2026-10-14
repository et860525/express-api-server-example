#!/bin/sh
set -eu

# ====== 設定 ======
SOURCE_DIR="/source_uploads"

BACKUP_ROOT="/backups"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"

DAILY_RETENTION_DAYS=7
WEEKLY_RETENTION_DAYS=28   # 最近 4 週
MONTHLY_RETENTION_DAYS=183 # 最近 6 個月（以 30.5 天/月估算）

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="uploads_${TIMESTAMP}.tar.gz"
DAILY_FILE="${DAILY_DIR}/${FILENAME}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "開始備份 uploads 資料夾..."

# ====== 執行備份 ======
# 手動備份: docker exec express-api-server-uploads-backup /backup.sh
if tar -czf "$DAILY_FILE" -C "$SOURCE_DIR" .; then
  log "每日備份成功：${DAILY_FILE}"
else
  log "備份失敗！"
  rm -f "$DAILY_FILE"
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
find "$DAILY_DIR" -name "*.tar.gz" -mtime +"$DAILY_RETENTION_DAYS" -delete
# find "$WEEKLY_DIR" -name "*.tar.gz" -mtime +"$WEEKLY_RETENTION_DAYS" -delete
# find "$MONTHLY_DIR" -name "*.tar.gz" -mtime +"$MONTHLY_RETENTION_DAYS" -delete

log "備份清理完成"
