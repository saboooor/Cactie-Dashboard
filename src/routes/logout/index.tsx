import type { RequestHandler } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import getAuth from '~/components/functions/auth';

export const onGet: RequestHandler = async ({ redirect, cookie, env }) => {
  const auth = await getAuth(cookie, env);

  if (auth) {
    const prisma = new PrismaClient({ datasources: { db: { url: env.get('DATABASE_URL') } } }).$extends(withAccelerate());
    await prisma.sessions.delete({ where: { sessionId: auth.sessionId } });
    cookie.delete('sessionid', { path: '/' });
  }

  throw redirect(302, '/');
};