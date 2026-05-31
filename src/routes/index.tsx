import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

import IconSova from '~/components/images/Sova.png?w=1024&h=1024&jsx';

import { HappyOutline, LogoDiscord } from 'qwik-ionicons';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center min-h-svh pt-20">
      <div>
        <div class="flex relative w-full">
          <h1 class="font-bold text-white text-3xl sm:text-5xl md:text-6xl">
            The only <span class="text-blue-400">Discord</span> bot you need, <span class="text-blue-200">Sova</span>.
          </h1>
          <IconSova class="sm:hidden floating"/>
        </div>
        <p class="mt-5 text-lg sm:text-2xl md:text-3xl text-slate-400">
          Moderation, Fun, QOL, Utilities, and More!
        </p>
        <p class="my-5 text-xs text-slate-400">
          It's pronounced Cact-E, btw
        </p>
        <div class="flex flex-col sm:flex-row justify-start">
          <a class="lum-btn lum-btn-p-4 lum-bg-purple-500 hover:lum-bg-purple-600" href="/invite">
            <HappyOutline width="24" class="fill-current" />
            Invite me to your server!
          </a>
        </div>
        <div class="mt-3 flex flex-col sm:flex-row gap-2">
          <div class="rounded-md shadow">
            <a class="lum-btn lum-btn-p-4" href="/discord">
              <LogoDiscord width="24" class="fill-current" />
              Join the Discord!
            </a>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex relative z-20">
        <IconSova class="z-10 floating mx-auto"/>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Home',
  meta: [
    {
      name: 'description',
      content: 'A bot that does stuff ig',
    },
    {
      property: 'og:description',
      content: 'A bot that does stuff ig',
    },
  ],
};