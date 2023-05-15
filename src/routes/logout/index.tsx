import type { RequestHandler } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
import getAuth from '~/components/functions/auth';

export const onGet: RequestHandler = async (props) => {
  const auth = await getAuth(props);

  if (auth) {
    const prisma = new PrismaClient({ datasources: { db: { url: props.env.get('DATABASE_URL') } } });
    await prisma.sessions.delete({ where: { sessionId: auth.sessionId } });
    props.cookie.delete('sessionid', { path: '/' });
  }

  throw props.redirect(302, '/');
};