import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import type { APIPartialGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';

export const onGet: RequestHandler = async ({ request, url, cookie, redirect }) => {
  const auth = getAuth(request);
  if (!auth) {
    cookie.set('redirect.url', url.href);
    throw redirect(302, '/login');
  }
};

export const useGuilds = routeLoader$(async ({ request, url, redirect }) => {
  const auth = getAuth(request);
  const res = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  })
  const GuildList: RESTError | RESTRateLimit | APIPartialGuild[] = await res.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after}ms`)
    await sleep(GuildList.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in GuildList) throw redirect(302, `/dashboard?error=${GuildList.code}`);
  // GuildList = GuildList.filter((guild: any) => new PermissionsBitField(guild.permissions).has(PermissionsBitField.Flags.ManageGuild));
  return GuildList;
});

export default component$(() => {
  const GuildList = useGuilds();
  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>
        <h1 class="font-bold tracking-tight text-white text-5xl">
          Select a <span class="text-luminescent-900">Server</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-500">
          to open the dashboard for
        </p>
      </div>
      <div class="flex flex-wrap justify-center mt-12 gap-4">
        {
          GuildList.value.map(guild => {
            return (
              <a key={guild.id} class="transition hover:bg-gray-800 p-8 rounded-xl text-gray-400 hover:text-white sm:hover:drop-shadow-2xl w-52" href={`/dashboard/${guild.id}`}>
                <img class="rounded-full m-auto w-32 h-32" src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name}/>
                <p class="mt-10 text-2xl overflow-hidden text-ellipsis line-clamp-1 text-center">{guild.name}</p>
              </a>
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