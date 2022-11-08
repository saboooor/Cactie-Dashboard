import { component$, Slot } from '@builder.io/qwik';
import Header from '../components/navbar';

export default component$(() => {
  return (
    <main>
      <Header />
      <section style="padding-top: 64px">
        <Slot />
      </section>
     </main>
  );
});