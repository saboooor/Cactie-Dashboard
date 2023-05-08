import type { Cookie } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';

export default async function getAuth(cookie: Cookie) {
  const sid = cookie.get('sessionid')?.value;
  if (!sid) return null;
  const prisma = new PrismaClient();
  const session = await prisma.sessions.findUnique({
    where: {
      sessionId: sid,
    },
  });
  return session ?? null;
}