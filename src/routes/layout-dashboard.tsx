import { component$, Slot } from '@builder.io/qwik';
import type { RequestEventLoader } from '@builder.io/qwik-city';
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

export const getGuildsFn = server$(async function(accessToken, props?: RequestEventLoader | typeof this, redirect?): Promise<Guild[]> {
  props = props ?? this;
  const clientres = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  const botres = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  });
  let GuildList: RESTError | RESTRateLimit | Guild[] = await clientres.json();
  const BotGuildList: RESTError | RESTRateLimit | Guild[] = await botres.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after * 1000}ms`);
    await sleep(GuildList.retry_after * 1000);
    return getGuildsFn(props, redirect);
  }
  if ('retry_after' in BotGuildList) {
    console.log(`${BotGuildList.message}, retrying after ${BotGuildList.retry_after * 1000}ms`);
    await sleep(Math.ceil(BotGuildList.retry_after * 1000));
    return getGuildsFn(props, redirect);
  }
  if ('code' in GuildList) throw redirect(302, `/dashboard?error=${GuildList.code}`);
  if ('code' in BotGuildList) throw redirect(302, `/dashboard?error=${BotGuildList.code}`);
  GuildList = GuildList.filter(guild => (BigInt(guild.permissions!) & PermissionFlagsBits.ManageGuild) === PermissionFlagsBits.ManageGuild);
  GuildList.forEach(guild => guild.mutual = BotGuildList.some(botguild => botguild.id == guild.id));
  return GuildList;
});

export const useGetAuth = routeLoader$(async (props) => {
  const auth = await getAuth(props.cookie, props.env);
  if (!auth) {
    props.cookie.set('redirecturl', props.url.href, { path: '/' });
    throw props.redirect(302, '/login');
  }
  const guilds = await getGuildsFn(auth.accessToken, props, props.redirect);
  return { auth, guilds };
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <>
      <Nav auth={auth.value} />
      <main class="mt-16">
        <Slot />
      </main>
    </>
  );
});
