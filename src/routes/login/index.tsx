import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import crypto from 'crypto';

import fs from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

import { PermissionsBitField } from 'discord.js';

export const onGet: RequestHandler = async ({ url, request, response }) => {
  if (!global.client) throw response.redirect('/')

  const code = url.searchParams.get('code');
  if (!code) {
    console.log('Redirected user to login page');
    const oAuth2URL = 'https://discord.com/api/v10/oauth2/authorize' + `?client_id=${client.user!.id}` + `&redirect_uri=${`${dashboard.domain}/login`.replace(/\//g, '%2F').replace(/:/g, '%3A')}` + '&response_type=code' + '&scope=identify guilds'
    throw response.redirect(oAuth2URL);
  }

  if (code) {
    try {
      const tokenResponseData = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: client.user!.id,
          client_secret: dashboard.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${dashboard.domain}/login`,
          scope: 'identify',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const oauthData = await tokenResponseData.json();
      const sid = crypto.randomBytes(32).toString('hex');

      let userres = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } });
      let userdata = await userres.json();
      if ('retry_after' in userdata) {
        console.log(`userdata: ${userdata.message}, retrying after ${userdata.retry_after}ms`)
        await global.sleep(Math.ceil(userdata.retry_after));
        userres = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } });
        userdata = await userres.json();
      }
      if ('code' in userdata) throw response.redirect(`/dashboard?error=${userdata.code}`);

      let guildsres = await fetch(`https://discord.com/api/v10/users/@me/guilds`, { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } });
      let guildsdata = await guildsres.json();
      if ('retry_after' in guildsdata) {
        console.log(`guildsdata: ${guildsdata.message}, retrying after ${guildsdata.retry_after}ms`)
        await sleep(Math.ceil(guildsdata.retry_after));
        guildsres = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` } });
        guildsdata = await userres.json();
      }
      if ('code' in guildsdata) throw response.redirect(`/dashboard?error=${guildsdata.code}`);
      guildsdata = guildsdata
        .filter((guild: any) => new PermissionsBitField(guild.permissions).has(PermissionsBitField.Flags.ManageGuild))
        .map((g: any) => {
          g = {
            id: g.id,
            name: g.name,
            iconURL: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}`
          }
          const botguild = client.guilds.cache.get(g.id);
          let extraJSON: any = false;
          if (botguild) {
            extraJSON = {
              channels: botguild.channels.cache.map((c: any) => {
                return {
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  pos: c.rawPosition,
                }
              }),
              roles: botguild.roles.cache.map(r => {
                return {
                  name: r.name,
                  id: r.id,
                  color: r.color.toString(16) != '0' ? `#${r.color.toString(16)}` : null,
                  pos: r.rawPosition,
                };
              }),
            }
          }
          return {
            ...g,
            mutual: extraJSON
          }
        });

      sessions[sid] = {
        ...oauthData,
        tag: `${userdata.username}#${userdata.discriminator}`,
        pfp: `https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}`,
        accent: userdata.banner_color,
        expires_in: (Date.now() + oauthData.expires_in),
        guildsdata
      };
      if (dashboard.debug) fs.writeFileSync('./sessions.json', JSON.stringify(sessions));
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
    },
    {
      property: 'og:description',
      content: 'Login to the dashboard using Discord'
    }
  ]
}
