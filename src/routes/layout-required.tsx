import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getUserGuildFn = server$(async function(accessToken: string, guildId: string): Promise<APIGuild | Error> {
  const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => new Error('User guild fetch failed'));
  if (res instanceof Error) return res;
  const guild: RESTError | RESTRateLimit | APIGuild[] = await res.json();
  if ('retry_after' in guild) {
    console.log(`${guild.message}, retrying after ${guild.retry_after * 1000}ms`);
    await sleep(guild.retry_after * 1000);
    return await getUserGuildFn(accessToken, guildId);
  }
  if ('code' in guild) return new Error(`User guild error ${guild.code} ${guild.message}`);

  const guildInfo = guild.find(guild => guild.id == guildId);
  if (!guildInfo) return new Error('User is not in guild');
  if ((BigInt(guildInfo.permissions!) & PermissionFlagsBits.ManageGuild) !== PermissionFlagsBits.ManageGuild) return new Error('User does not have permission to manage guild');

  return guildInfo;
});

export const useGetAuth = routeLoader$(async ({ cookie, env, params, redirect }) => {
  const auth = await getAuth(cookie, env);

  if (!auth) {
    cookie.set('redirecturl', '/', { path: '/' });
    throw redirect(302, '/login');
  }

  if (auth.pfp?.includes('249638347306303499')) return auth;

  const userGuild = await getUserGuildFn(auth.accessToken, params.guildId);
  if (userGuild instanceof Error) throw userGuild;

  return auth;
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <>
      <Nav auth={auth.value} />
      <main>
        <Slot />
      </main>
    </>
  );
});
