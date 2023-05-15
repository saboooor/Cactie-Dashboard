import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useGetAuth = routeLoader$(async (props) => {
  const auth = await getAuth(props);
  if (!auth) {
    props.cookie.set('redirecturl', '/', { path: '/' });
    throw props.redirect(302, '/login');
  }
  return auth;
});

export default component$(() => {
  const auth = useGetAuth();
  return (
    <>
      <Nav auth={auth.value} />
      <main>
        <Slot />
      </main>
    </>
  );
});
