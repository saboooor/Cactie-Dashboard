import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center" style="height: calc(100vh - 64px);">
      <div class="text-center sm:text-left justify-start" style="filter: drop-shadow(0 5rem 10rem rgba(79, 70, 229, 1));">
        <div class="flex sm:hidden relative justify-center align-center sm:ml-auto mb-10" style="width: 100%;">
          <div class="absolute top-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl" style="left: 45%"></div>
          <div class="absolute top-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-2000" style="right: 50%"></div>
          <div class="absolute bottom-5 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-4000" style="left: 40%"></div>
          <img class="rounded-full z-10 animate-float ease-in-out" src="/assets/images/Cactie.webp" style="max-width: 40%" alt="Cactie" />
        </div>
        <h1 class="font-bold tracking-tight text-white text-5xl">
          The last <span class="text-blue-400">Discord</span> bot you need, <span class="text-green-200">Cactie</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-400">
          Moderation, Fun, Music, Utilities, and More!
        </p>
        <p class="mb-5 mt-2 text-xs text-gray-400">
          It's pronounced Cact-E, btw
        </p>
        <div class="flex justify-center sm:justify-start">
          <div class="rounded-md shadow">
            <a href="#" class="flex w-full items-center justify-center rounded-xl sm:rounded-3xl border border-transparent bg-indigo-600 px-8 py-3 text-base font-bold text-gray-200 hover:bg-indigo-500 md:py-4 md:px-10 md:text-lg">
              Invite me to your server!
            </a>
          </div>
        </div>
        <div class="mt-3 flex justify-center sm:justify-start">
          <div class="rounded-md shadow">
            <a href="/dashboard" class="flex w-full items-center justify-center rounded-xl sm:rounded-3xl border border-transparent bg-gray-800 px-8 py-3 text-base font-medium text-gray-200 hover:bg-gray-700 md:py-4 md:px-10 md:text-lg">
              Dashboard
            </a>
          </div>
          <div class="mt-0 ml-3 rounded-md shadow">
            <a href="#" class="flex w-full items-center justify-center rounded-xl sm:rounded-3xl border border-transparent bg-gray-800 px-8 py-3 text-base font-medium text-gray-200 hover:bg-gray-700 md:py-4 md:px-10 md:text-lg">
              Support
            </a>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex relative justify-end align-center sm:ml-auto" style="max-width: 50%;">
        <div class="absolute top-10 left-10 w-72 h-72 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl"></div>
        <div class="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-2000"></div>
        <div class="absolute bottom-5 left-32 w-72 h-72 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-4000"></div>
        <img class="rounded-full z-10 animate-float ease-in-out" src="/assets/images/Cactie.webp" alt="Cactie" />
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Home',
  meta: [
    {
      name: 'description',
      property: 'og:description',
      content: 'A bot that does stuff ig'
    }
  ]
}