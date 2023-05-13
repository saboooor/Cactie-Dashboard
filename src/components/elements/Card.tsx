
import { Slot, component$ } from '@builder.io/qwik';
import LoadingIcon from '../icons/LoadingIcon';

export default component$(({ row, squish, fit, darker, contextMenu }: any) => {
  return (
    <div class={{
      'flex gap-3 border border-gray-700 rounded-xl p-6': true,
      'bg-gray-900/50': darker,
      'bg-gray-800': !darker,
      'flex-col': !row,
      'flex-1': !squish,
      'min-w-fit': fit,
    }} onContextMenu$={(event) => contextMenu ? contextMenu.func(event, ...contextMenu.args) : ''} preventdefault:contextmenu={contextMenu}>
      <Slot />
    </div>
  );
});

export const CardHeader = component$(() => {
  return (
    <h1 class="flex font-bold text-gray-100 text-2xl">
      <div class="flex items-center gap-3 flex-1">
        <Slot />
      </div>
      <div class={'opacity-0 transition-all'}>
        <LoadingIcon />
      </div>
    </h1>
  );
});