import { PrismaClient } from '@prisma/client/edge';

export default async function getAuth(request: any) {
  const cookieJSON: any = {};
  const cookiesArray = request.headers.get('cookie')?.split('; ');
  cookiesArray?.forEach((cookie: string) => {
    const values = cookie.split('=');
    cookieJSON[values[0]] = values[1];
  });
  const sid = cookieJSON['session-id'];
  if (!sid) return null;
  const prisma = new PrismaClient();
  const session = await prisma.sessions.findUnique({
    where: {
      sessionId: sid,
    },
  });
  return session ?? null;
}