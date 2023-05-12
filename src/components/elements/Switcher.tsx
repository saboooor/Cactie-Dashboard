
import { component$, useStore } from '@builder.io/qwik';
import LoadingIcon from '../icons/LoadingIcon';

export default component$(({ store, lighter, label, centered, onSwitch$ }: any) => {
  const loadingStore = useStore({ loading: false });

  return (
    <button onClick$={async () => {
      loadingStore.loading = true;
      store.dev = !store.dev;
      document.cookie = `branch=${store.dev ? 'dev' : 'master'};max-age=86400;path=/`;
      await onSwitch$();
      loadingStore.loading = false;
    }} class={`flex items-center group transition ease-in-out text-black/50 border  ${lighter ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-800 hover:bg-gray-700 border-gray-700'} rounded-lg px-3 py-2 ${loadingStore.loading ? `${store.dev === undefined ? 'opacity-0' : 'opacity-50'} pointer-events-none` : ''} ${centered ? 'm-auto' : ''}`}>
      <span class="text-white font-bold pr-2">
        {label}
      </span>
      <span class={'bg-green-300 rounded-lg transition-all px-3 py-1'}>
        Cactie
      </span>
      <span class={`${store.dev ? 'ml-1 bg-luminescent-800' : '-ml-12 text-transparent'} transition-all rounded-lg px-3 py-1`}>
        Dev
      </span>
      <div class={`${loadingStore.loading ? '' : '-ml-8 opacity-0'} transition-all`}>
        <LoadingIcon />
      </div>
    </button>
  );
});