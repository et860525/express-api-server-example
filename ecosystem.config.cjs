module.exports = {
  apps: [
    {
      name: "express-api-server",
      script: "./src/app.ts",
      interpreter: "bun",
      watch: true,
      ignore_watch: ["node_modules", "uploads", "logs", "uploads_backups", ".git", "bun.lock", ".DS_Store"],
    }
  ],
};
