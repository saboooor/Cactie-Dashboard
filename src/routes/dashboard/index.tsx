import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEventLoader, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$, server$, Link } from '@builder.io/qwik-city';
import type { APIGuild, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { HappyOutline, SettingsOutline } from 'qwik-ionicons';
import getAuth from '~/components/functions/auth';
import LoadingIcon from '~/components/icons/LoadingIcon';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const onGet: RequestHandler = async ({ url, cookie, redirect, env }) => {
  const auth = await getAuth(cookie, env);
  if (auth === null) {
    cookie.set('redirecturl', url.href, { path: '/' });
    throw redirect(302, '/login');
  }
};

const getGuildsFn = server$(async function(props?: RequestEventLoader | typeof this, redirect?): Promise<Guild[]> {
  props = props ?? this;
  const auth = await getAuth(props.cookie, props.env);
  const clientres = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      authorization: `Bearer ${auth?.accessToken}`,
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

export const useGetGuildsRouteLoader = routeLoader$((props) => getGuildsFn(props, props.redirect));

export default component$(() => {
  const GuildList = useGetGuildsRouteLoader();
  const store = useStore({
    dev: undefined as boolean | undefined,
    loading: false,
    GuildList: GuildList.value,
  });

  useVisibleTask$(() => {
    store.dev = document.cookie.includes('branch=dev');
  });

  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          Select a <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Server</span>.
        </h1>
        <p class="my-5 text-xl sm:text-2xl md:text-3xl text-gray-500">
          to open the dashboard for
        </p>
        <button onClick$={async () => {
          store.loading = true;
          store.dev = !store.dev;
          document.cookie = `branch=${store.dev ? 'dev' : 'master'};max-age=86400;path=/`;
          store.GuildList = await getGuildsFn();
          store.loading = false;
        }} class={`flex items-center m-auto group transition ease-in-out text-black/50 hover:bg-gray-800 rounded-lg px-3 py-2 ${store.loading ? `${store.dev === undefined ? 'opacity-0' : 'opacity-50'} pointer-events-none` : ''}`}>
          <span class="text-white font-bold pr-2">
              Bot:
          </span>
          <span class={'bg-green-300 rounded-lg transition-all px-3 py-1'}>
              Cactie
          </span>
          <span class={`${store.dev ? 'ml-1 bg-luminescent-800' : '-ml-12 text-transparent'} transition-all rounded-lg px-3 py-1`}>
              Dev
          </span>
          <div class={`${store.loading ? '' : '-ml-8 opacity-0'} transition-all`}>
            <LoadingIcon />
          </div>
        </button>
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          store.GuildList.filter(guild => guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-200 w-14 sm:w-48">
                <div class="m-auto sm:p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto"/>
                  <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                </div>
                <div class="grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm transition duration-200">
                  <Link href={`/dashboard/${store.dev ? 'dev' : 'master'}/${guild.id}`} class="flex flex-col justify-center transition hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
                    <SettingsOutline width="24" class="fill-current" />
                    Settings
                  </Link>
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
          store.GuildList.filter(guild => !guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-200 w-14 sm:w-48">
                <div class="m-auto sm:p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto w-32 grayscale group-hover:grayscale-0 group-hover:saturate-150 transition duration-500"/>
                  <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                </div>
                <div class="sm:grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm transition duration-200">
                  <a href={`/invite?guild=${guild.id}`} class="flex flex-col justify-center transition hover:bg-luminescent-900/20 text-white rounded-xl font-bold items-center gap-4">
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