import { Router } from "express";
import { loginController, registerController } from "./auth.controller";
// import authenticateMiddleware from "../../middleware/validate_parse_token";

const router = Router();

// 根 URL: /auth

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: 登入
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *             example:
 *               message: 登入成功
 *               data:
 *                 id: 1
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 帳號或密碼錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 帳號或密碼錯誤
 */
router.post("/login", loginController);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: 註冊
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: 註冊成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *             example:
 *               message: 註冊成功
 *               data:
 *                 id: 1
 *                 email: user@example.com
 *       400:
 *         description: 格式錯誤或 Email 已被註冊
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 此 Email 已被註冊
 */
router.post("/register", registerController);

// ====== 受保護的路由範例 ======
// router.get("/me", authenticateMiddleware, meController);

export default router;
