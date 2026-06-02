import prisma, { type PrismaExecutor } from "../../lib/prisma";

// ******************************************
// *               查詢
// ******************************************

/**
 * 使用 email 查詢使用者
 */
export const getUserByEmail = async (email: string, tx?: PrismaExecutor) => {
  const client = tx ?? prisma;
  return await client.user.findUnique({ where: { email } });
};

// ******************************************
// *               新增
// ******************************************

/**
 * 建立使用者
 */
export const createUser = async (
  data: { email: string; password: string },
  tx?: PrismaExecutor,
) => {
  const client = tx ?? prisma;
  const now = new Date();
  return await client.user.create({ data: { ...data, createdAt: now, updatedAt: now } });
};
