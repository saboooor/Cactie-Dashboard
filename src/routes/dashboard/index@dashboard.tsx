import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, useLocation } from '@builder.io/qwik-city';
import { HappyOutline } from 'qwik-ionicons';
import { useGetAuth, getGuildsFn } from '../layout-dashboard';
import Switcher from '~/components/elements/Switcher';

import { Card } from '@luminescent/ui';

export default component$(() => {
  const loc = useLocation();

  const { value: { auth, guilds } } = useGetAuth();
  const store = useStore({
    dev: undefined as boolean | undefined,
    GuildList: guilds,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    store.dev = document.cookie.includes('branch=dev');
  });

  return (
    <section class="mx-auto max-w-6xl px-6 items-center min-h-[100svh] pt-32">
      <div class="text-center">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          Select a <span class="text-luminescent-400" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Server</span>.
        </h1>
        <p class="my-5 text-xl sm:text-2xl md:text-3xl text-slate-400">
          to open the dashboard for
        </p>
        <Switcher store={store} label='Bot:' centered onSwitch$={async () => {
          store.GuildList = await getGuildsFn(auth.accessToken);
        }} />
      </div>
      <Card row class={{
        'max-h-[70svh] mt-6 overflow-scroll flex-wrap': true,
      }}>
        {
          !(store.GuildList instanceof Error) &&
          store.GuildList.filter(guild => guild.mutual).map(guild => {
            return (
              <Link key={guild.id} href={`/dashboard/${guild.id}`} class="p-8 flex flex-col items-center relative rounded-xl group sm:hover:-translate-y-4 transition-all duration-200 w-32 sm:w-48 pic-link">
                <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class={{
                  'absolute -z-10 opacity-0 transition-all group-hover:opacity-40 rounded-3xl blur-2xl': true,
                }} width={128} height={128}/>
                <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class={{
                  'rounded-3xl pic': true,
                  'pic-prev': !loc.isNavigating && loc.prevUrl?.pathname.includes(guild.id),
                }} width={128} height={128}/>
                <p class="hidden mt-6 text-xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all text-slate-50">{guild.name}</p>
              </Link>
            );
          })
        }
      </Card>
      <div class="text-center sm:hidden">
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          More <span class="text-luminescent-400" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Servers</span>.
        </h1>
        <p class="mt-5 text-xl sm:text-2xl md:text-3xl text-slate-500">
          These servers don't have Cactie yet! Select a server to invite Cactie to.
        </p>
      </div>
      <div class="flex flex-wrap justify-center sm:justify-evenly gap-5 my-12">
        {
          !(store.GuildList instanceof Error) &&
          store.GuildList.filter(guild => !guild.mutual).map(guild => {
            return (
              <a href={`/invite?guild=${guild.id}`} key={guild.id} class="z-10 flex flex-col items-center relative rounded-xl group sm:hover:-translate-y-4 hover:scale-105 transition-all duration-200 w-14 sm:w-48 py-10">
                <img src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={guild.name} class="grayscale rounded-full" width={128} height={128}/>
                <div class="fixed w-32 h-32 flex flex-col justify-center transition opacity-0 group-hover:opacity-100 bg-gray-900/80 text-slate-100 rounded-full font-bold items-center gap-4">
                  <HappyOutline width="24" class="fill-current" />
                  Invite
                </div>
                <p class="hidden mt-10 text-2xl overflow-hidden text-ellipsis sm:line-clamp-1 text-center break-all text-slate-50">{guild.name}</p>
              </a>
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