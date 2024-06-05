
import { component$, useStore } from '@builder.io/qwik';
import { Button, LoadingIcon } from '@luminescent/ui';

export default component$(({ store, label, centered, onSwitch$ }: any) => {
  const loadingStore = useStore({ loading: false });

  return (
    <Button onClick$={async () => {
      loadingStore.loading = true;
      store.dev = !store.dev;
      document.cookie = `branch=${store.dev ? 'dev' : 'master'};max-age=86400;path=/`;
      await onSwitch$();
      loadingStore.loading = false;
    }} class={{
      'pointer-events-none': loadingStore.loading,
      'opacity-0': store.dev === undefined,
      'opacity-50': store.dev !== undefined && loadingStore.loading,
      'm-auto': centered,
    }}>
      <span class="text-slate-300 font-bold">
        {label}
      </span>
      <span class="bg-green-300 border border-green-200 rounded-md transition-all px-3 py-1 text-black">
        Cactie
      </span>
      <span class={{
        'transition-all rounded-md px-3 py-1 bg-luminescent-300 border border-luminescent-200 text-black': true,
        '-ml-1': store.dev,
        '-ml-16 opacity-0': !store.dev,
      }}>
        Dev
      </span>
      <div class={{
        'transition-all': true,
        '-ml-10 opacity-0': !loadingStore.loading,
      }}>
        <LoadingIcon width={24} />
      </div>
    </Button>
  );
});