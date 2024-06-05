import { component$, Slot } from '@builder.io/qwik';
import type { RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export async function fetchGuilds(headers: Record<string, string>): Promise<Guild[] | Error> {
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers,
  }).catch(() => new Error('Guilds fetch failed'));
  if (res instanceof Error) return res;
  const GuildList: RESTError | RESTRateLimit | Guild[] = await res.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after * 1000}ms`);
    await sleep(GuildList.retry_after * 1000);
    return await fetchGuilds(headers);
  }
  if ('code' in GuildList) return new Error(`Guild list error ${GuildList.code}`);
  return GuildList;
}

export async function getGuilds(accessToken: string, props: RequestEventBase, dev?: boolean): Promise<Guild[] | Error> {
  let GuildList = await fetchGuilds({
    authorization: `Bearer ${accessToken}`,
  });
  if (GuildList instanceof Error) return GuildList;

  const BotGuildList = await fetchGuilds({
    authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
  });
  if (BotGuildList instanceof Error) return BotGuildList;

  GuildList = GuildList.filter(guild => (BigInt(guild.permissions!) & PermissionFlagsBits.ManageGuild) === PermissionFlagsBits.ManageGuild);
  GuildList.forEach(guild => guild.mutual = BotGuildList.some(botguild => botguild.id == guild.id));
  if (dev) return BotGuildList.map(guild => ({ ...guild, mutual: true }));
  return GuildList;
}

export const getGuildsFn = server$(async function(accessToken: string, dev?: boolean): Promise<Guild[] | Error> {
  return await getGuilds(accessToken, this, dev);
});

export const useGetAuth = routeLoader$(async (props) => {
  const auth = await getAuth(props.cookie, props.env);
  if (!auth) {
    props.cookie.set('redirecturl', props.url.href, { path: '/' });
    throw props.redirect(302, '/login');
  }
  const guilds = await getGuilds(auth.accessToken, props, auth.pfp?.includes('249638347306303499'));
  return { auth, guilds };
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <main>
      <Nav auth={auth.value.auth} />
      <Slot />
    </main>
  );
});
