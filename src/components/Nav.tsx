import { component$, Slot } from '@builder.io/qwik';
import { Link, useNavigate } from '@builder.io/qwik-city';

import { LogoDiscord, LogoGithub, Menu, SettingsOutline, ReaderOutline, HappyOutline, PersonCircleOutline } from 'qwik-ionicons';
import pfp from '~/components/images/Cactie.png'

export default component$(({ user }: any) => {
  return (
    <Nav>
      <MainNav>
        <NavButton href="/dashboard" extraClass="hidden sm:flex gap-3">
          <SettingsOutline width="24" class="fill-current" />
          Dashboard
        </NavButton>
        <NavButton href="/legal" extraClass="hidden sm:flex gap-3">
          <ReaderOutline width="24" class="fill-current" />
          Legal
        </NavButton>
        <NavButton href="/invite" extraClass="hidden sm:flex gap-3">
          <HappyOutline width="24" class="fill-current" />
          Invite
        </NavButton>
        <NavButton external icon href="https://github.com/saboooor/Cactie" title="GitHub" extraClass="hidden sm:flex">
          <LogoGithub width="24" class="fill-green-100" />
        </NavButton>
        <NavButton icon href="/discord" title="Discord" extraClass="hidden sm:flex">
          <LogoDiscord width="24" class="fill-indigo-200" />
        </NavButton>
        {user && 
          <NavButton external icon href="/logout" title="Discord" style={{ backgroundColor: user.accent }}>
            <img src={user.pfp} class="rounded-full h-6 w-6" />
          </NavButton>
        }
        {!user && 
          <NavButton external icon href="/login" title="Discord">
            <PersonCircleOutline width="24" class="fill-luminescent-700" />
          </NavButton>
        }
        <button id="mobile-menu-button" type="button" title="Menu" onClick$={() => {
          const classList = document.getElementById('mobile-menu')?.classList;
          if (classList?.contains('hidden')) classList.replace('hidden', 'flex');
          else classList?.replace('flex', 'hidden');
        }} class="transition ease-in-out hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg text-3xl sm:hidden">
          <Menu width="24" class="fill-current"/>
        </button>
      </MainNav>
      <MobileNav>
        <NavButton href="/dashboard" extraClass="flex gap-3">
          <SettingsOutline width="24" class="fill-current" />
          Dashboard
        </NavButton>
        <NavButton href="/legal" extraClass="flex gap-3">
          <ReaderOutline width="24" class="fill-current" />
          Legal
        </NavButton>
        <NavButton href="/invite" extraClass="flex gap-3">
          <HappyOutline width="24" class="fill-current" />
          Invite
        </NavButton>
        <div class="flex flex-row">
          <NavButton external icon href="https://github.com/saboooor/Cactie" title="GitHub" extraClass="flex sm:hidden">
            <LogoGithub width="24" class="fill-green-100" />
          </NavButton>
          <NavButton icon href="/discord" title="Discord" extraClass="flex sm:hidden">
            <LogoDiscord width="24" class="fill-indigo-200" />
          </NavButton>
        </div>
      </MobileNav>
    </Nav>
  );
});

export const Nav = component$(() => {
  return (
    <nav class="z-20 fixed top-0 w-screen py-2 bg-gray-900/70 backdrop-blur-xl">
      <div class="mx-auto max-w-7xl px-4 lg:px-6">
        <Slot />
      </div>
    </nav>
  );
});

export const Brand = component$(() => {
  return (
    <div class="flex flex-1 items-center justify-start">
      <Link href="/" class="transition ease-in-out text-gray-300 hover:bg-gray-800 hover:text-white drop-shadow-2xl px-3 pt-3 pb-2 rounded-lg text-lg flex items-center whitespace-nowrap">
        <img class="h-10 w-10 mr-3" src={pfp} alt="Cactie" />
        <span class="flex sm:hidden md:flex">Cactie</span>
      </Link>
    </div>
  );
});

export const MainNav = component$(() => {
  return (
    <div class="relative flex h-16 items-center justify-between">
      <Brand/>
      <div class="flex flex-1 items-center justify-end">
        <div class="flex gap-2 text-gray-300 whitespace-nowrap">
          <Slot/>
        </div>
      </div>
    </div>
  );
});

export const MobileNav = component$(() => {
  return (
    <div id="mobile-menu" class="gap-4 py-4 px-3 bg-black rounded-lg mt-2 hidden flex-col sm:hidden">
      <Slot />
    </div>
  );
});

export const NavButton = component$(({ href, title, icon, external, extraClass, style }: any) => {
  const nav = useNavigate();
  return <>
    {external &&
      <a href={href} title={title} style={style} class={`group transition ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg  items-center`}>
        <Slot />
      </a>
    }
    {!external &&
      <button onClick$={() => { document.getElementById('mobile-menu')?.classList.replace('flex', 'hidden'); nav(href); }} title={title} style={style} class={`group transition ease-in-out ${extraClass} hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg items-center`}>
        <Slot />
      </button>
    }
  </>;
});