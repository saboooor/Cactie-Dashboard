import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useUser = routeLoader$(async ({ cookie }) => {
  const auth = await getAuth(cookie);
  if (!auth) return null;
  const { pfp, accent } = auth;
  return { pfp, accent };
});

export default component$(() => {
  const user = useUser();
  return (
    <>
      <Nav user={user.value} />
      <main class="pt-16">
        <Slot />
      </main>
    </>
  );
});
