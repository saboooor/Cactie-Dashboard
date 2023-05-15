import type { RequestEventBase } from '@builder.io/qwik-city';
import { server$ } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';

export default server$(async function(props?: RequestEventBase) {
  props = props ?? this;
  if (!props) return;
  const sid = props.cookie.get('sessionid')?.value;
  if (!sid) return null;
  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get('DATABASE_URL') } } });
  const session = await prisma.sessions.findUnique({
    where: {
      sessionId: sid,
    },
  });
  return session ?? null;
});
