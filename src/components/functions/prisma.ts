import { PrismaClient } from '@prisma/client/edge';
export const master = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
export const dev = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_DEV } } });