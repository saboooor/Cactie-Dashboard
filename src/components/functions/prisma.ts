import { PrismaClient } from '@prisma/client/edge';

export const master = new PrismaClient({ datasources: { db: { url: import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL } } });
export const dev = new PrismaClient({ datasources: { db: { url: import.meta.env.DATABASE_URL_DEV ?? process.env.DATABASE_URL_DEV } } });