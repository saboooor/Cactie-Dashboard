import { component$, Slot } from '@builder.io/qwik';
import Switcher from './elements/Switcher';

export const MenuIndex = component$(({ guild, store, onSwitcherSwitch$ }: any) => {
  return (
    <aside class="z-10 w-full sm:h-1 align-middle sm:sticky sm:top-28" aria-label="Sidebar">
      <div class="py-4 px-3 rounded-xl bg-gray-800 border-2 border-gray-700 text-base font-bold mb-6 text-white">
        <div class="flex items-center mb-4">
          {guild.icon && <img class="w-10 h-10 rounded-full" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          <p class="flex-1 ml-3 text-lg">{guild.name}</p>
        </div>
        <Switcher store={store} label='Bot:' lighter onSwitch$={onSwitcherSwitch$} />
      </div>
      <div class="overflow-y-auto py-4 px-3 rounded-xl bg-gray-800 border-2 border-gray-700 pt-5 max-h-[calc(100dvh-220px)]">
        <Slot />
      </div>
    </aside>
  );
});

export const MenuCategory = component$(({ name }: any) => {
  return (
    <div class="space-y-4 mb-4">
      <span class="m-2">{name}</span>
      <div class="grid gap-2 grid-cols-3 sm:grid-cols-1">
        <Slot />
      </div>
      <hr class="border-gray-600" />
    </div>
  );
});

export const MenuItem = component$(({ href }: any) => {
  return (
    <a href={href} class="transition hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl border-2 border-transparent hover:border-gray-600 px-4 py-2 rounded-lg text-md font-bold flex items-center gap-4">
      <Slot />
    </a>
  );
});

export const MenuTitle = component$((props: any) => {
  return (
    <h1 {...props} class={`font-bold text-gray-200 text-4xl transition ${props.extraClass}`}>
      <Slot />
    </h1>
  );
});