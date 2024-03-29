import type { Cookie } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export default async function getAuth(cookie: Cookie, env: any) {
  const sid = cookie.get('sessionid')?.value;
  if (!sid) return null;
  const prisma = new PrismaClient({ datasources: { db: { url: env.get('DATABASE_URL') } } }).$extends(withAccelerate());
  const session = await prisma.sessions.findUnique({
    where: {
      sessionId: sid,
    },
  });
  return session ?? null;
}