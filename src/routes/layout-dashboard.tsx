import { component$, Slot } from '@builder.io/qwik';
import type { RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const getUserGuildsFn = server$(async function(accessToken: string): Promise<Guild[] | Error> {
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => new Error('USer guilds fetch failed'));
  if (res instanceof Error) return res;
  const GuildList: RESTError | RESTRateLimit | Guild[] = await res.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after * 1000}ms`);
    await sleep(GuildList.retry_after * 1000);
    return await getUserGuildsFn(accessToken);
  }
  if ('code' in GuildList) return new Error(`User guild list error ${GuildList.code}`);
  return GuildList;
});

export const getBotGuildsFn = server$(async function(props?: RequestEventBase): Promise<Guild[] | Error> {
  props = props ?? this;
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => new Error('Bot guilds fetch failed'));
  if (res instanceof Error) return res;
  const BotGuildList: RESTError | RESTRateLimit | Guild[] = await res.json();
  if ('retry_after' in BotGuildList) {
    console.log(`${BotGuildList.message}, retrying after ${BotGuildList.retry_after * 1000}ms`);
    await sleep(Math.ceil(BotGuildList.retry_after * 1000));
    return await getBotGuildsFn(props);
  }
  if ('code' in BotGuildList) return new Error(`Bot guild list error ${BotGuildList.code}`);
  return BotGuildList;
});

export const getGuildsFn = server$(async function(accessToken, props?: RequestEventBase, dev?: boolean): Promise<Guild[] | Error> {
  let GuildList = await getUserGuildsFn(accessToken);
  if (GuildList instanceof Error) return GuildList;

  const BotGuildList = await getBotGuildsFn(props ?? this);
  if (BotGuildList instanceof Error) return BotGuildList;

  GuildList = GuildList.filter(guild => (BigInt(guild.permissions!) & PermissionFlagsBits.ManageGuild) === PermissionFlagsBits.ManageGuild);
  GuildList.forEach(guild => guild.mutual = BotGuildList.some(botguild => botguild.id == guild.id));
  if (dev) return BotGuildList.map(guild => ({ ...guild, mutual: true }));
  return GuildList;
});

export const useGetAuth = routeLoader$(async (props) => {
  const auth = await getAuth(props.cookie, props.env);
  if (!auth) {
    props.cookie.set('redirecturl', props.url.href, { path: '/' });
    throw props.redirect(302, '/login');
  }
  const guilds = await getGuildsFn(auth.accessToken, props, auth.pfp?.includes('249638347306303499'));
  return { auth, guilds };
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <>
      <Nav auth={auth.value.auth} />
      <main class="mt-16">
        <Slot />
      </main>
    </>
  );
});
