import { Resource, component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import type { APIPartialGuild, RESTRateLimit, RESTError } from 'discord-api-types/v10';
import { useEndpoint } from "@builder.io/qwik-city";
import getAuth from '../../auth';
import { PermissionsBitField } from 'discord.js';

export const onGet: RequestHandler<APIPartialGuild[]> = async ({ url, request, response }) => {
  const auth = getAuth(request);
  if (!auth) {
    response.headers.set('Set-Cookie', `redirect.url=${url.href}`);
    throw response.redirect('/login');
  }
  const res = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  })
  let GuildList: RESTError | RESTRateLimit | APIPartialGuild[] = await res.json();
  if ('retry_after' in GuildList) {
    console.log(`${GuildList.message}, retrying after ${GuildList.retry_after}ms`)
    await sleep(GuildList.retry_after);
    throw response.redirect(url.href);
  }
  if ('code' in GuildList) throw response.redirect(`/dashboard?error=${GuildList.code}`);
  GuildList = GuildList.filter((guild: any) => new PermissionsBitField(guild.permissions).has(PermissionsBitField.Flags.ManageGuild));
  return GuildList;
};

export default component$(() => {
  const GuildList = useEndpoint<APIPartialGuild[]>();
  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style="min-height: calc(100vh - 64px);">
      <div class="text-center" style="filter: drop-shadow(0 0 2rem rgba(79, 70, 229, 1));">
        <h1 class="font-bold tracking-tight text-white text-5xl">
          Select a <span class="text-blue-400">Server</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-500">
          to open the dashboard for
        </p>
      </div>
      <Resource
        value={GuildList}
        onPending={() => <p class="mt-5 text-2xl text-gray-500">Loading...</p>}
        onRejected={() => <p class="mt-5 text-2xl text-red-500">Error</p>}
        onResolved={(guilds) => {
          const guildElements = guilds.map(guild => {
            const guildFromClient = client.guilds.cache.get(guild.id);
            return (
              <a class={`sm:hover:bg-gray-800 p-8 rounded-2xl text-gray-400 hover:text-white sm:hover:drop-shadow-2xl${guildFromClient ? '' : ' grayscale'}`} href={guildFromClient ? `/dashboard/${guild.id}` : `/invite?guild=${guild.id}`}>
                <img class="rounded-full m-auto w-32 h-32" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name}/>
                <p class="mt-10 text-2xl overflow-hidden text-ellipsis line-clamp-1">{guild.name}</p>
              </a>
            )
          })
          return (
            <div class="my-12 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 text-center align-middle">
              {guildElements}
            </div>
          )
        }}
      />
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