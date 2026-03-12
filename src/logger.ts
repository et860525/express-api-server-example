import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// ─── Log 檔案設定（可依需求調整）────────────────────────────────────────────
const LOG_MAX_SIZE = "20m"; // 單檔上限，超過會切割為 .1、.2 等後綴
const LOG_MAX_FILES = "14d"; // 保留天數，過期檔案於下次寫入時自動刪除
// ────────────────────────────────────────────────────────────────────────────

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  new DailyRotateFile({
    filename: "logs/%DATE%-combined.json",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: LOG_MAX_SIZE,
    maxFiles: LOG_MAX_FILES,
    format: fileFormat,
  }),
  new DailyRotateFile({
    filename: "logs/%DATE%-error.json",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: LOG_MAX_SIZE,
    maxFiles: LOG_MAX_FILES,
    level: "error",
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;
