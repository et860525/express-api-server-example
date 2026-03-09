/**
 * 郵件發送工具
 *
 * 集中管理所有寄信邏輯，統一 SMTP 設定與信件格式，
 * 避免各模組各自建立 transporter 或散落郵件樣板。
 * 新增寄信功能時，在此新增對應的 export function 即可。
 *
 * 使用前需在 .env 設定：
 *   MAIL_USER=your@gmail.com
 *   MAIL_PASS=your_app_password
 */
import nodemailer from "nodemailer";

const appName = process.env.APP_NAME || "預設專案";
const mailUser = process.env.MAIL_USER;

// 建立 Gmail SMTP 傳輸器，憑證從 .env 讀取
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailUser,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * 寄送驗證碼信件
 * @param toEmail 收件人信箱
 * @param code 驗證碼（由呼叫方產生後傳入）
 * @returns 傳入的驗證碼，供後續邏輯比對使用
 */
export async function sendVerificationCode(toEmail: string, code: string) {
  const mailOptions = {
    from: `"${appName}" <${mailUser}>`,
    to: toEmail,
    subject: "您的驗證碼",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>驗證碼信件</h2>
        <p>您好，您的驗證碼為：</p>
        <h1 style="color: #4A90E2; font-size: 32px;">${code}</h1>
        <p>請在 10 分鐘內輸入此代碼。若非本人操作，請忽略此郵件。</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`驗證碼已寄送到: ${toEmail}`);
    return code; // 回傳驗證碼，以便後續邏輯比對
  } catch (error) {
    console.error("郵件寄送失敗:", error);
    throw new Error("無法寄送驗證碼");
  }
}

/**
 * 寄送帳號已存在提醒信
 * 當有人嘗試用已註冊的信箱重新註冊時，通知原帳號持有人
 * @param toEmail 收件人信箱
 */
export async function sendAccountExistsEmail(toEmail: string) {
  const mailOptions = {
    from: `"${appName}" <${mailUser}>`,
    to: toEmail,
    subject: `【${appName}】帳號註冊狀態提醒`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>帳號狀態提醒</h2>
        <p>您好，我們偵測到有人嘗試使用您的電子郵件地址註冊「${appName}」帳號。</p>
        <p>由於此電子郵件地址已經在本平台註冊，因此我們攔截了該次註冊請求。如果您忘記了密碼，可以隨時在登入頁面點擊「忘記密碼」來重設。</p>
        <p>若非您本人操作，請放心，您的帳號是安全的。請忽略此郵件即可。</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`帳號已存在提醒信已寄送到: ${toEmail}`);
  } catch (error) {
    console.error("郵件寄送失敗:", error);
    // 在此情境下，我們可能不希望對使用者拋出錯誤，僅記錄後台日誌
  }
}
