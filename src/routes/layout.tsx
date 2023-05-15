import { component$, Slot, useStore, useVisibleTask$ } from '@builder.io/qwik';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export default component$(() => {
  const store = useStore({ auth: null as any });
  useVisibleTask$(async () => { store.auth = await getAuth(); });

  return (
    <>
      <Nav auth={store.auth} />
      <main class="mt-16">
        <Slot />
      </main>
    </>
  );
});
