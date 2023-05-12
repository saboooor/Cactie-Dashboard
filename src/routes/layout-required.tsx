import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useGetAuth = routeLoader$(async ({ cookie, env, redirect }) => {
  const auth = await getAuth(cookie, env);
  if (!auth) {
    cookie.set('redirecturl', '/', { path: '/' });
    throw redirect(302, '/login');
  }
  return auth;
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <>
      <Nav auth={auth.value} />
      <main class="mt-16">
        <Slot />
      </main>
    </>
  );
});
