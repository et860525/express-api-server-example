#!/bin/sh
set -eu

# cron 執行的 job 不會繼承容器的環境變數，這裡在容器啟動時把 backup.sh
# 需要的變數寫入檔案，讓 backup.sh 自行 source，避免密碼寫死在 crontab 裡
{
  echo "export DB_PASSWORD='${DB_PASSWORD}'"
  echo "export DB_DATABASE='${DB_DATABASE}'"
} > /container_env.sh
chmod 600 /container_env.sh

exec "$@"
