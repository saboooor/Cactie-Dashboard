import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useUser = routeLoader$(({ request }) => {
  const auth = getAuth(request);
  if (!auth) return null;
  const { tag, pfp, accent } = auth;
  return { tag, pfp, accent };
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
