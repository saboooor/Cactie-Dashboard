import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useGetAuth = routeLoader$(async ({ cookie }) => await getAuth(cookie));

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
