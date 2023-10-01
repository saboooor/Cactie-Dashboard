import { component$, Slot, useStore } from '@builder.io/qwik';
import Switcher from './elements/Switcher';
import { Menu } from 'qwik-ionicons';
import { Button } from './elements/Button';

export default component$(({ guild, store, onSwitcherSwitch$ }: any) => {
  const menuStore = useStore({
    menu: false,
  });
  return (
    <aside class="w-full mt-28 align-middle sm:sticky sm:h-1 sm:top-28" aria-label="Sidebar">
      <div class="py-4 px-3 rounded-xl bg-gray-800 border border-gray-700 text-base font-bold mb-4 text-gray-200">
        <div class="flex items-center mb-4">
          {guild.icon && <img class="w-10 h-10 rounded-full" width={40} height={40} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          <p class="flex-1 ml-3 text-lg">{guild.name}</p>
        </div>
        <div class="flex">
          <div class="flex-1">
            <Switcher store={store} label='Bot:' lighter onSwitch$={onSwitcherSwitch$} />
          </div>
          <Button extraClass="sm:hidden" onClick$={() => menuStore.menu = !menuStore.menu}>
            <Menu width="24"/>
          </Button>
        </div>
      </div>
      <div class={`overflow-y-auto ${!menuStore.menu ? 'hidden sm:' : ''}flex flex-col py-4 px-3 rounded-xl bg-gray-800 border border-gray-700 max-h-[calc(100dvh-350px)]`}>
        <Slot />
      </div>
    </aside>
  );
});

export const MenuCategory = component$(({ name }: any) => {
  return (
    <div class="space-y-4 mb-4">
      <span class="ml-2 font-bold">{name}</span>
      <div class="flex flex-col gap-2">
        <Slot />
      </div>
      <hr class="border-gray-600" />
    </div>
  );
});

export const MenuItem = component$(({ href }: any) => {
  return (
    <a href={href} class="min-w-fit transition hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl border border-transparent hover:border-gray-600 px-2 py-1 rounded-lg text-md flex items-center gap-2">
      <Slot />
    </a>
  );
});

export const MenuTitle = component$((props: any) => {
  return (
    <h1 {...props} class={`font-bold text-white text-4xl transition ${props.extraClass}`}>
      <Slot />
    </h1>
  );
});