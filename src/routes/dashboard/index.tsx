import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { HappyOutline, SettingsOutline } from 'qwik-ionicons';
import getAuth from '~/components/functions/auth';

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const onGet: RequestHandler = async ({ request, url, cookie, redirect }) => {
  const auth = getAuth(request);
  if (!auth) {
    cookie.set('redirect.url', url.href);
    throw redirect(302, '/login');
  }
};

export const useGuilds = routeLoader$(async ({ request, url, redirect, env }) => {
  const auth = getAuth(request);
  const clientres = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  });
  const botres = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
    },
  });
  let GuildList: RESTError | RESTRateLimit | Guild[] = await clientres.json();
  const BotGuildList: RESTError | RESTRateLimit | Guild[] = await botres.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after}ms`);
    await sleep(GuildList.retry_after);
    throw redirect(302, url.href);
  }
  if ('retry_after' in BotGuildList) {
    console.log(`${BotGuildList.message}, retrying after ${BotGuildList.retry_after}ms`);
    await sleep(BotGuildList.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in GuildList) throw redirect(302, `/dashboard?error=${GuildList.code}`);
  if ('code' in BotGuildList) throw redirect(302, `/dashboard?error=${BotGuildList.code}`);
  GuildList = GuildList.filter(guild => (BigInt(guild.permissions!) & PermissionFlagsBits.ManageGuild) === PermissionFlagsBits.ManageGuild);
  GuildList.forEach(guild => guild.mutual = BotGuildList.some(botguild => botguild.id == guild.id));
  return GuildList;
});

export default component$(() => {
  const GuildList = useGuilds();
  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          Select a <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Server</span>.
        </h1>
        <p class="mt-5 text-xl sm:text-2xl md:text-3xl text-gray-500">
          to open the dashboard for
        </p>
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          GuildList.value.filter(guild => guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-300 w-14 sm:w-48">
                <div class="m-auto sm:p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto"/>
                  <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                </div>
                <div class="grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm duration-300">
                  <a href={`/dashboard/${guild.id}`} class="flex flex-col justify-center transition duration-200 hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
                    <SettingsOutline width="24" class="fill-current" />
                    Settings
                  </a>
                </div>
              </div>
            );
          })
        }
      </div>
      <div class="text-center sm:hidden">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          More <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Servers</span>.
        </h1>
        <p class="mt-5 text-xl sm:text-2xl md:text-3xl text-gray-500">
          These servers don't have Cactie yet! Select a server to invite Cactie to.
        </p>
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          GuildList.value.filter(guild => !guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-300 w-14 sm:w-48">
                <div class="m-auto sm:p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto w-32 grayscale group-hover:grayscale-0 group-hover:saturate-150 transition duration-500"/>
                  <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                </div>
                <div class="sm:grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm duration-300">
                  <a href={`/invite?guild=${guild.id}`} class="flex flex-col justify-center transition duration-200 hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
                    <HappyOutline width="24" class="fill-current" />
                    Invite
                  </a>
                </div>
              </div>
            );
          })
        }
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard',
  meta: [
    {
      name: 'description',
      content: 'The Cactie Dashboard',
    },
    {
      property: 'og:description',
      content: 'The Cactie Dashboard',
    },
  ],
};