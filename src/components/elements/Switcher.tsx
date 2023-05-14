
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
    }} class={{
      'flex items-center group transition ease-in-out text-black/50 border rounded-md px-3 py-2': true,
      'bg-gray-700 hover:bg-gray-600 border-gray-600': lighter,
      'bg-gray-800 hover:bg-gray-700 border-gray-700': !lighter,
      'pointer-events-none': loadingStore.loading,
      'opacity-0': store.dev === undefined,
      'opacity-50': store.dev !== undefined && loadingStore.loading,
      'm-auto': centered,
    }}>
      <span class="text-gray-300 font-bold pr-2">
        {label}
      </span>
      <span class="bg-green-300 border border-green-200 rounded-md transition-all px-3 py-1">
        Cactie
      </span>
      <span class={{
        'transition-all rounded-md px-3 py-1 bg-luminescent-300 border border-luminescent-200': true,
        'ml-1': store.dev,
        '-ml-12 opacity-0': !store.dev,
      }}>
        Dev
      </span>
      <div class={{
        'transition-all': true,
        '-ml-8 opacity-0': !loadingStore.loading,
      }}>
        <LoadingIcon />
      </div>
    </button>
  );
});