import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

import fs from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

export const onGet: RequestHandler = async ({ url, params, request, response }) => {
  if (!client.readyTimestamp) throw response.redirect('/');

  const code = url.searchParams.get('code');
  if (!code) {
    const referer = request.headers.get('referer');
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
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
    throw response.redirect('/');
  }
};

export const head: DocumentHead = {
  title: 'Login with Discord',
};
