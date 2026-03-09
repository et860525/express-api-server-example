import prisma, { type PrismaExecutor } from "../../lib/prisma";

// ******************************************
// *               查詢
// ******************************************

/**
 * 使用 email 查詢使用者
 * TODO: 將 `user` 替換為你的 Prisma model 名稱
 * @param email
 */
export const getUserByEmail = async (email: string, tx?: PrismaExecutor) => {
  const client = tx ?? prisma;

  // TODO: 替換成你的 model，例如：
  return await client.user.findUnique({ where: { email } });
};
