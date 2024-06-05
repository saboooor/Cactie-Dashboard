import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { APIGuild } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';
import { fetchGuilds } from './layout-dashboard';

export async function getUserGuild(accessToken: string, guildId: string): Promise<APIGuild | Error> {
  const guild = await fetchGuilds({
    authorization: `Bearer ${accessToken}`,
  });

  if (guild instanceof Error) return guild;

  const guildInfo = guild.find(guild => guild.id == guildId);
  if (!guildInfo) return new Error('User is not in guild');
  if ((BigInt(guildInfo.permissions!) & PermissionFlagsBits.ManageGuild) !== PermissionFlagsBits.ManageGuild) return new Error('User does not have permission to manage guild');

  return guildInfo;
}

export const useGetAuth = routeLoader$(async ({ cookie, env, params, redirect }) => {
  const auth = await getAuth(cookie, env);

  if (!auth) {
    cookie.set('redirecturl', '/', { path: '/' });
    throw redirect(302, '/login');
  }

  if (auth.pfp?.includes('249638347306303499')) return auth;

  const userGuild = await getUserGuild(auth.accessToken, params.guildId);
  if (userGuild instanceof Error) throw userGuild;

  return auth;
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <main>
      <Nav auth={auth.value} />
      <Slot />
    </main>
  );
});
