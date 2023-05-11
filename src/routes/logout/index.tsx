import type { RequestHandler } from '@builder.io/qwik-city';
import * as prisma from '~/components/functions/prisma';
import getAuth from '~/components/functions/auth';

export const onGet: RequestHandler = async ({ redirect, cookie }) => {
  const auth = await getAuth(cookie);

  if (auth) {
    await prisma.master.sessions.delete({ where: { sessionId: auth.sessionId } });
    cookie.delete('sessionid', { path: '/' });
  }

  throw redirect(302, '/');
};