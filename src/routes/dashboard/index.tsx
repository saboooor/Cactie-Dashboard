import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import getAuth from '../../auth';

export const onGet: RequestHandler = async ({ url, params, request, response }) => {
  const auth = getAuth(request);
  if (!auth) throw response.redirect('/login');
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  })
  const userdata = await res.json();
  console.log(userdata);
};

export default component$(() => {
  return (
    <section class="mx-auto max-w-6xl px-6 pt-12 items-center" style="height: calc(100vh - 64px);">
      <div class="text-center" style="filter: drop-shadow(0 0 2rem rgba(79, 70, 229, 1));">
        <h1 class="font-bold tracking-tight text-white text-5xl">
          Select a <span class="text-blue-400">Server</span>.
        </h1>
        <p class="mt-5 text-2xl text-gray-500">
          to open the dashboard for
        </p>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard',
};
