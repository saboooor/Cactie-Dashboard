import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="mx-auto max-w-6xl px-6 pt-12 items-center" style="height: calc(100vh - 64px);">
        <div class="text-center" style="filter: drop-shadow(0 0 2rem rgba(96, 165, 250, 1));">
          <h1 class="font-bold tracking-tight text-white text-5xl">
            Select a <span class="text-blue-400">Server</span>.
          </h1>
          <p class="mt-5 text-2xl text-gray-500">
            Select a server to open the dashboard for
          </p>
        </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard',
};
