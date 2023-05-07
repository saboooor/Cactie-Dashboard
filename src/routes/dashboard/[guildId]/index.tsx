import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import type { APIChannel, APIGuild, APIRole, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import { MenuIndex, MenuCategory, MenuItem, MenuTitle } from '~/components/Menu';
import { PrismaClient } from '@prisma/client';

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

export const useData = routeLoader$(async ({ url, redirect, params, env }) => {
  const guildres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/preview`, {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
    },
  });
  const guild: RESTError | RESTRateLimit | Guild = await guildres.json();
  if ('retry_after' in guild) {
    console.log(`${guild.message}, retrying after ${guild.retry_after}ms`)
    await sleep(guild.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in guild) throw redirect(302, `/dashboard?error=${guild.code}&message=${guild.message}`);

  const channelsres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
    },
  });
  const channels: RESTError | RESTRateLimit | APIChannel[] = await channelsres.json();
  if ('retry_after' in channels) {
    console.log(`${channels.message}, retrying after ${channels.retry_after}ms`)
    await sleep(channels.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in channels) throw redirect(302, `/dashboard?error=${channels.code}&message=${channels.message}`);

  const rolesres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/roles`, {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
    },
  });
  const roles: RESTError | RESTRateLimit | APIRole[] = await rolesres.json();
  if ('retry_after' in roles) {
    console.log(`${roles.message}, retrying after ${roles.retry_after}ms`)
    await sleep(roles.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in roles) throw redirect(302, `/dashboard?error=${roles.code}&message=${roles.message}`);

  const prisma = new PrismaClient();
  const srvconfig = await prisma.settings.findUnique({
    where: {
      guildId: params.guildId,
    },
  });

  return { guild, channels, roles, srvconfig };
});

export default component$(() => {
  const guildData = useData();
  const { guild, channels, roles, srvconfig } = guildData.value;
  return (
    <section class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 pt-6 sm:pt-12 min-h-[calc(100lvh-80px)]">
        <MenuIndex guild={guild}>
            <MenuCategory name="GENERAL">
                <MenuItem href="#general">
                    General Settings
                </MenuItem>
                <MenuItem href="#suggestpolls">
                    Suggestions / Polls
                </MenuItem>
                <MenuItem href="#misc">
                    Miscellaneous
                </MenuItem>
                <MenuItem href="#tickets">
                    Ticket System
                </MenuItem>
                <MenuItem href="#moderation">
                    Moderation
                </MenuItem>
            </MenuCategory>
            <MenuItem href="#audit">
                Audit Logs
            </MenuItem>
            <MenuItem href="#reactionroles">
                Reaction Roles
            </MenuItem>
        </MenuIndex>
        <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
            <MenuTitle id="general">General Settings</MenuTitle>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                    <h1 class="font-bold tracking-tight text-white text-2xl">Prefix</h1>
                    <p class="text-gray-400 text-md mt-4">Cactie's text command prefix</p>
                    <input type="text" class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600" placeholder="The bot's prefix" value={srvconfig?.prefix} name="prefix" />
                </div>
            </div>
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