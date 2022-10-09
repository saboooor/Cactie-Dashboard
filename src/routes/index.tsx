import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center" style="height: calc(100vh - 86px);">
        <div class="text-center sm:text-left justify-start" style="filter: drop-shadow(0 5rem 10rem rgba(79, 70, 229, 1));">
          <div class="flex sm:hidden justify-center align-center sm:ml-auto mb-10">
            <img class="rounded-full" src="/assets/images/Cactie.webp" style="max-width: 40%; max-height: 40%; filter: drop-shadow(0 -2rem 10rem rgba(187, 247, 208, 1));" />
          </div>
          <h1 class="font-bold tracking-tight text-white text-5xl">
            The last <span class="text-blue-400">Discord</span> bot you need, <span class="text-green-200">Cactie</span>.
          </h1>
          <p class="mt-5 text-2xl text-gray-500">
            Moderation, Fun, Music, Utilities, and More!
          </p>
          <p class="mb-5 mt-2 text-xs text-gray-600">
            It's pronounced Cact-E, btw
          </p>
          <div class="flex justify-center sm:justify-start">
            <div class="rounded-md shadow">
              <a href="#" class="flex  w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-bold text-gray-200 hover:bg-indigo-500 md:py-4 md:px-10 md:text-lg">
                Invite me to your server!
              </a>
            </div>
          </div>
          <div class="mt-5 flex justify-center sm:justify-start">
            <div class="rounded-md shadow">
              <a href="#" class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-800 px-8 py-3 text-base font-medium text-gray-200 hover:bg-gray-700 md:py-4 md:px-10 md:text-lg">
                Dashboard
              </a>
            </div>
            <div class="mt-0 ml-3 rounded-md shadow">
              <a href="#" class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-800 px-8 py-3 text-base font-medium text-gray-200 hover:bg-gray-700 md:py-4 md:px-10 md:text-lg">
                Support
              </a>
            </div>
          </div>
        </div>
        <div class="hidden sm:flex justify-end align-center sm:ml-auto">
          <img class="rounded-full" src="/assets/images/Cactie.webp" style="max-width: 50%; max-height: 50%; filter: drop-shadow(0 -2rem 10rem rgba(187, 247, 208, 1));" />
        </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Home',
};
