import { Router } from "express";
import { loginController } from "./auth.controller";
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

// ====== 受保護的路由範例 ======
// router.get("/me", authenticateMiddleware, meController);

export default router;
