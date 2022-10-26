import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

import fs from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

export const onGet: RequestHandler = async ({ url, params, request, response }) => {
  const cookieJSON: any = {};
  const cookiesArray = request.headers.get('cookie')?.split('; ');
  cookiesArray?.forEach((cookie: string) => {
      const values = cookie.split('=');
      cookieJSON[values[0]] = values[1];
  });

  const sid = cookieJSON['connect.sid'];

  response.headers.set('Set-Cookie', `connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC;expires=Thu, 01 Jan 1970 00:00:00 UTC;`);

  console.log(`${sessions[sid].tag} logged out`);

  delete sessions[sid];
  if (dashboard.debug) fs.writeFileSync('./sessions.json', JSON.stringify(sessions));

  throw response.redirect('/');
};

export const head: DocumentHead = {
  title: 'Login',
  meta: [
    {
      name: 'description',
      property: 'og:description',
      content: 'Login to the dashboard using Discord'
    }
  ]
}
