
import { Slot, component$ } from '@builder.io/qwik';

export default component$(({ row, squish, darker, contextMenu }: any) => {
  return (
    <div class={{
      'flex min-w-fit gap-3 border border-gray-700 rounded-xl p-6': true,
      'bg-gray-900/50': darker,
      'bg-gray-800': !darker,
      'flex-col': !row,
      'flex-1': !squish,
      'sm:flex-1': squish == 'sm'
    }} onContextMenu$={(event) => contextMenu ? contextMenu.func(event, ...contextMenu.args) : ''} preventdefault:contextmenu={contextMenu}>
      <Slot />
    </div>
  );
});