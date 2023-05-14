import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, useLocation } from '@builder.io/qwik-city';
import { HappyOutline, SettingsOutline } from 'qwik-ionicons';
import { useGetAuth, getGuildsFn } from '../layout-dashboard';
import Switcher from '~/components/elements/Switcher';

export default component$(() => {
  const loc = useLocation();

  const { value: { auth, guilds } } = useGetAuth();
  const store = useStore({
    dev: undefined as boolean | undefined,
    GuildList: guilds,
  });

  useVisibleTask$(() => {
    store.dev = document.cookie.includes('branch=dev');
  });

  return (
    <section class="mx-auto max-w-screen-2xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          Select a <span class="text-luminescent-400" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Server</span>.
        </h1>
        <p class="my-5 text-xl sm:text-2xl md:text-3xl text-gray-500">
          to open the dashboard for
        </p>
        <Switcher store={store} label='Bot:' centered onSwitch$={async () => {
          store.GuildList = await getGuildsFn(auth.accessToken);
        }} />
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          !(store.GuildList instanceof Error) &&
          store.GuildList.filter(guild => guild.mutual).map(guild => {
            return (
              <Link key={guild.id} href={`/dashboard/${guild.id}`} class="flex flex-col items-center relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-200 w-14 sm:w-48 py-10 pic-link">
                <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class={{
                  'rounded-full pic': true,
                  'pic-prev': !loc.isNavigating && loc.prevUrl?.pathname.includes(guild.id),
                }}/>
                <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                <div class="grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm transition duration-200">
                  <div class={'flex flex-col justify-center transition hover:bg-luminescent-600/20 text-gray-100 rounded-xl font-bold items-center gap-4'}>
                    <SettingsOutline width="24" class="fill-current" />
                    Settings
                  </div>
                </div>
              </Link>
            );
          })
        }
      </div>
      <div class="text-center sm:hidden">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          More <span class="text-luminescent-400" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Servers</span>.
        </h1>
        <p class="mt-5 text-xl sm:text-2xl md:text-3xl text-gray-500">
          These servers don't have Cactie yet! Select a server to invite Cactie to.
        </p>
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          !(store.GuildList instanceof Error) &&
          store.GuildList.filter(guild => !guild.mutual).map(guild => {
            return (
              <div key={guild.id} class="relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-200 w-14 sm:w-48">
                <div class="m-auto sm:p-8">
                  <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="rounded-full m-auto w-32 grayscale group-hover:grayscale-0 group-hover:saturate-150 transition duration-500"/>
                  <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all">{guild.name}</p>
                </div>
                <div class="sm:grid absolute top-0 w-full h-full bg-gray-900/50 opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-sm transition duration-200">
                  <a href={`/invite?guild=${guild.id}`} class="flex flex-col justify-center transition hover:bg-luminescent-600/20 text-gray-100 rounded-xl font-bold items-center gap-4">
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