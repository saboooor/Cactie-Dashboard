import { component$ } from '@builder.io/qwik';
import { type DocumentHead, Link } from '@builder.io/qwik-city';

import pfp from '~/components/images/Cactie.png'
import { HappyOutline, LogoDiscord, SettingsOutline } from 'qwik-ionicons';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="text-center sm:text-left justify-start">
        <div class="flex sm:hidden relative justify-center align-center sm:ml-auto mb-10" style="width: 100%;">
          <div class="absolute top-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl" style={{ left: '45%' }}></div>
          <div class="absolute top-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-2000" style={{ right: '50%' }}></div>
          <div class="absolute bottom-5 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-4000" style={{ left: '40%' }}></div>
          <img class="rounded-full z-10 animate-float ease-in-out" src={pfp} style={{ maxWidth: '40%' }} alt="Cactie" />
        </div>
        <h1 class="font-bold text-white text-5xl">
          The last <span class="text-blue-400">Discord</span> bot you need, <span class="text-green-200">Cactie</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-400">
          Moderation, Fun, Music, Utilities, and More!
        </p>
        <p class="mb-5 mt-2 text-xs text-gray-400">
          It's pronounced Cact-E, btw
        </p>
        <div class="flex justify-center sm:justify-start" style={{ filter: 'drop-shadow(0 5rem 10rem #CB6CE6)' }}>
          <div class="rounded-md shadow" style={{ filter: 'drop-shadow(0 5rem 10rem #CB6CE6)' }}>
            <a href="/invite" class="flex justify-center sm:justify-start transition rounded-2xl shadow-lg backdrop-blur-lg bg-luminescent-900/80 hover:bg-luminescent-900 border-2 border-luminescent-900 px-6 py-3 font-bold text-purple-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-4 items-center">
              <HappyOutline width="24" class="fill-current" />
              Invite me to your server!
            </a>
          </div>
        </div>
        <div class="mt-3 flex gap-2 justify-center sm:justify-start">
          <div class="rounded-md shadow">
            <a href="#" class="flex justify-center sm:justify-start transition rounded-2xl shadow-lg backdrop-blur-lg bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-6 py-3 font-bold text-gray-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-4 items-center">
              <LogoDiscord width="24" class="fill-current" />
              Join the Discord!
            </a>
          </div>
          <div class="rounded-md shadow">
            <Link href="/dashboard" class="flex justify-center sm:justify-start transition rounded-2xl shadow-lg backdrop-blur-lg bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 px-6 py-3 font-bold text-gray-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-4 items-center">
              <SettingsOutline width="24" class="fill-current" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex relative justify-end align-center sm:ml-auto" style={{ maxWidth: '50%' }}>
        <div class="absolute top-10 left-10 w-72 h-72 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl"></div>
        <div class="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-2000"></div>
        <div class="absolute bottom-5 left-32 w-72 h-72 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-4000"></div>
        <img class="rounded-full z-10 animate-float ease-in-out" src={pfp} alt="Cactie" />
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Home',
  meta: [
    {
      name: 'description',
      content: 'A bot that does stuff ig'
    },
    {
      property: 'og:description',
      content: 'A bot that does stuff ig'
    }
  ]
}