import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import crypto from 'crypto';

export const onGet: RequestHandler = async ({ url, request, redirect, headers, env }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    console.log('Redirected user to login page');
    const oAuth2URL = 'https://discord.com/api/v10/oauth2/authorize' + `?client_id=765287593762881616` + `&redirect_uri=${`${env.get('DOMAIN')}/login`.replace(/\//g, '%2F').replace(/:/g, '%3A')}` + '&response_type=code' + '&scope=identify guilds'
    throw redirect(302, oAuth2URL);
  }

  if (code) {
    try {
      const tokenResponseData = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: '765287593762881616',
          client_secret: env.get('CLIENT_SECRET')!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${env.get('DOMAIN')}/login`,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const oauthData = await tokenResponseData.json();
      const sid = crypto.randomBytes(32).toString('hex');
      const res = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } })
      const userdata = await res.json();
      sessions[sid] = {
        ...oauthData,
        pfp: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}`,
        accent: userdata.banner_color,
        expires_in: (Date.now() + oauthData.expires_in),
      };
      headers.set('Set-Cookie', `connect.sid=${sid}`);
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
    throw redirect(302, href ?? '/');
  }
};

export const head: DocumentHead = {
  title: 'Login',
  meta: [
    {
      name: 'description',
      content: 'Login to the dashboard using Discord'
    },
    {
      property: 'og:description',
      content: 'Login to the dashboard using Discord'
    }
  ]
}