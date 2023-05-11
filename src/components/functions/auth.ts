import type { Cookie } from '@builder.io/qwik-city';
import * as prisma from '~/components/functions/prisma';

export default async function getAuth(cookie: Cookie) {
  const sid = cookie.get('sessionid')?.value;
  if (!sid) return null;
  const session = await prisma.master.sessions.findUnique({
    where: {
      sessionId: sid,
    },
  });
  return session ?? null;
}