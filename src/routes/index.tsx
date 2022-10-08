import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="sm:flex mx-auto max-w-7xl px-6" style="height: calc(100% - 86px); align-items: center;">
        <div class="text-center sm:text-left justify-start">
          <h1 class="font-bold tracking-tight text-gray-900 text-6xl">
            <span class="block text-lime-600">Cactie</span>
          </h1>
          <p class="mt-3 text-base text-gray-500">
            A bot that does stuff ig<br />
            Admin, Fun, Music, Tickets, Utilities, Animals, and Actions!
          </p>
          <div class="mt-5 flex justify-center sm:justify-start">
            <div class="rounded-md shadow">
              <a href="#" class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg">
                Invite me to your server!
              </a>
            </div>
          </div>
          <div class="mt-5 flex justify-center sm:justify-start">
            <div class="rounded-md shadow">
              <a href="#" class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg">
                Dashboard
              </a>
            </div>
            <div class="mt-0 ml-3 rounded-md shadow">
              <a href="#" class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg">
                Support
              </a>
            </div>
          </div>
        </div>
        <div class="hidden justify-end align-center sm:ml-auto sm:flex">
          <img class="rounded-full" src="/assets/images/Cactie.webp" style="max-width: 40%; max-height: 40%;" />
        </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Cactie',
};
