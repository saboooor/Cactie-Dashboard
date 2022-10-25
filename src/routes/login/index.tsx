import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import crypto from 'crypto';

import fs from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

export const onGet: RequestHandler = async ({ url, params, request, response }) => {
  if (!client.readyTimestamp) throw response.redirect('/');

  const code = url.searchParams.get('code');
  if (!code) {
    const oAuth2URL = 'https://discord.com/api/oauth2/authorize' + `?client_id=${client.user.id}` + `&redirect_uri=${client.dashboardDomain.replace(/\//g, '%2F').replace(/:/g, '%3A')}%2Flogin` + '&response_type=code' + '&scope=identify guilds'
    throw response.redirect(oAuth2URL);
  }

  if (code) {
    try {
      const tokenResponseData = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: client.user.id,
          client_secret: dashboard.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${client.dashboardDomain}/login`,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const oauthData = await tokenResponseData.json();
      const sid = crypto.randomBytes(32).toString('hex');
      const res = await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } })
      const userdata = await res.json();
      sessions[sid] = {
        ...oauthData,
        tag: `${userdata.username}#${userdata.discriminator}`,
        pfp: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}`,
        accent: userdata.banner_color,
      };
      response.headers.set('Set-Cookie', `connect.sid=${sid}`);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
    const cookieJSON: any = {};
    const cookiesArray = request.headers.get('cookie')?.split('; ');
    cookiesArray?.forEach((cookie: string) => {
        const values = cookie.split('=');
        cookieJSON[values[0]] = values[1];
    });
    const href = cookieJSON['redirect.url'];
    throw response.redirect(href ?? '/');
  }
};

export const head: DocumentHead = {
  title: 'Login',
  meta: [
    {
      name: 'description',
      content: 'Login to the dashboard using Discord'
    }
  ]
}
