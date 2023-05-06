import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import { HappyOutline, SettingsOutline } from 'qwik-ionicons';
import getAuth from '~/components/functions/auth';
import { token } from '~/config.json';

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

export const useGuilds = routeLoader$(async ({ request, url, redirect }) => {
  const auth = getAuth(request);
  const clientres = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  })
  const botres = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
    headers: {
      authorization: `Bot ${token}`,
    },
  })
  let GuildList: RESTError | RESTRateLimit | Guild[] = await clientres.json();
  const BotGuildList: RESTError | RESTRateLimit | Guild[] = await botres.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after}ms`)
    await sleep(GuildList.retry_after);
    throw redirect(302, url.href);
  }
  if ('retry_after' in BotGuildList) {
    console.log(`${BotGuildList.message}, retrying after ${BotGuildList.retry_after}ms`)
    await sleep(BotGuildList.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in GuildList) throw redirect(302, `/dashboard?error=${GuildList.code}`);
  if ('code' in BotGuildList) throw redirect(302, `/dashboard?error=${BotGuildList.code}`);
  GuildList = GuildList.filter(guild => new PermissionsBitField(BigInt(guild.permissions!)).has(PermissionsBitField.Flags.ManageGuild));
  GuildList.forEach(guild => guild.mutual = BotGuildList.some(botguild => botguild.id == guild.id));
  return GuildList;
});

export default component$(() => {
  const GuildList = useGuilds();
  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center">
        <h1 class="font-bold tracking-tight text-white text-5xl">
          Select a <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Server</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-500">
          to open the dashboard for
        </p>
      </div>
      <div class="flex flex-wrap justify-evenly mt-12">
        {
          GuildList.value.filter(guild => guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group hover:-translate-y-4 hover:scale-105 transition-all duration-300">
                <div class="grid absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-sm duration-300">
                  <a href={`/dashboard/${guild.id}`} class="flex flex-col justify-center transition duration-200 hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
                    <SettingsOutline width="24" class="fill-current" />
                    Settings
                  </a>
                </div>
                <div class="m-auto p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto"/>
                  <p class="mt-10 text-2xl overflow-hidden text-ellipsis line-clamp-1 text-center">{guild.name}</p>
                </div>
              </div>
            )
          })
        }
      </div>
      <div class="flex flex-wrap justify-evenly mt-12">
        {
          GuildList.value.filter(guild => !guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group hover:-translate-y-4 hover:scale-105 transition-all duration-300">
                <div class="m-auto p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full grayscale group-hover:grayscale-0 group-hover:saturate-150 transition duration-500"/>
                  <p class="mt-10 text-2xl overflow-hidden text-ellipsis line-clamp-1 text-center">{guild.name}</p>
                </div>
                <div class="grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-sm duration-300">
                  <a href={`/invite?guild=${guild.id}`} class="flex flex-col justify-center transition duration-200 hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
                    <HappyOutline width="24" class="fill-current" />
                    Invite
                  </a>
                </div>
              </div>
            )
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
      content: 'The Cactie Dashboard'
    },
    {
      property: 'og:description',
      content: 'The Cactie Dashboard'
    }
  ]
}