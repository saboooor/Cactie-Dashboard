
import { Slot, component$ } from '@builder.io/qwik';
import LoadingIcon from '../icons/LoadingIcon';

export default component$(({ extraClass, row, squish, fit, darker, contextMenu }: any) => {
  return (
    <div class={{
      'flex gap-3 border border-gray-700 rounded-xl p-6': true,
      'bg-gray-900/50': darker,
      'bg-gray-800': !darker,
      'flex-col': !row,
      'flex-1': !squish,
      'min-w-fit': fit,
      ...extraClass,
    }} onContextMenu$={(event) => contextMenu ? contextMenu.func(event, ...contextMenu.args) : ''} preventdefault:contextmenu={contextMenu}>
      <Slot />
    </div>
  );
});

export const CardHeader = component$(({ loading, id }: any) => {
  return (
    <h1 class="flex font-bold text-gray-100 text-2xl mb-2">
      <span id={id} class="block h-32 -mt-32" />
      <div class="flex flex-1 items-center gap-3 whitespace-nowrap">
        <Slot />
      </div>
      { loading !== undefined &&
        <div class={{
          'transition-all': true,
          'opacity-0': !loading,
          'opacity-100': loading,
        }}>
          <LoadingIcon />
        </div>
      }
    </h1>
  );
});