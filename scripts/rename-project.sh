#!/bin/bash
# 將 template 內的 express-api-server 全部改為新專案名稱
# 用法: ./scripts/rename-project.sh my-new-project
set -e

OLD_NAME="express-api-server"
NEW_NAME="$1"

if [ -z "$NEW_NAME" ]; then
  echo "用法: $0 <new-project-name>"
  exit 1
fi

cd "$(dirname "$0")/.."

grep -rl "$OLD_NAME" --exclude-dir=node_modules --exclude-dir=.git . \
  | xargs sed -i '' "s/$OLD_NAME/$NEW_NAME/g"

echo "已將 $OLD_NAME 全部替換為 $NEW_NAME"
