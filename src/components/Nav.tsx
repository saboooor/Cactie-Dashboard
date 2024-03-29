import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

import { LogoDiscord, LogoGithub, Menu, SettingsOutline, ReaderOutline, HappyOutline, PersonCircleOutline } from 'qwik-ionicons';
// @ts-ignore
import iconAVIF from '~/components/images/Cactie.png?format=avif&w=96&h=96';
// @ts-ignore
import iconWEBP from '~/components/images/Cactie.png?format=webp&w=96&h=96';
// @ts-ignore
import icon from '~/components/images/Cactie.png?w=96&h=96';

import Luminescent from './icons/Luminescent';
import LoadingIcon from './icons/LoadingIcon';

export default component$(({ auth }: any) => {
  return (
    <Nav>
      <MainNav>
        <NavButton external={!auth} href="/dashboard" extraClass="hidden sm:flex gap-3">
          <SettingsOutline width="24" class="fill-current" />
          Dashboard
        </NavButton>
        <NavButton href="/legal" extraClass="hidden sm:flex gap-3">
          <ReaderOutline width="24" class="fill-current" />
          Legal
        </NavButton>
        <NavButton external href="/invite" extraClass="hidden sm:flex gap-3">
          <HappyOutline width="24" class="fill-current" />
          Invite
        </NavButton>
        <NavButton external icon href="/github" title="GitHub" extraClass="hidden sm:flex">
          <LogoGithub width="24" class="fill-green-100" />
        </NavButton>
        <NavButton external icon href="/discord" title="Discord" extraClass="hidden sm:flex">
          <LogoDiscord width="24" class="fill-indigo-200" />
        </NavButton>
        <NavButton external icon href="https://luminescent.dev" title="Luminescent" extraClass="hidden sm:flex justify-center w-10 h-10">
          <div style={{ filter: 'drop-shadow(0 0 0 #DD6CFF)' }}>
            <div style={{ filter: 'drop-shadow(0 0 1rem #CB6CE6)' }} class="w-10 h-10">
              <Luminescent/>
            </div>
          </div>
        </NavButton>
        {auth &&
          <NavButton external icon href="/logout" title="Log out" style={{ backgroundColor: auth.accent }}>
            <img src={auth.pfp ?? 'https://cdn.discordapp.com/embed/avatars/0.png'} class="rounded-full h-6 w-6" width={24} height={24} />
          </NavButton>
        }
        {!auth &&
          <NavButton external icon href="/login" title="Login">
            <PersonCircleOutline width="24" class="fill-luminescent-300" />
          </NavButton>
        }
        <button id="mobile-menu-button" type="button" title="Menu" onClick$={() => {
          const classList = document.getElementById('mobile-menu')?.classList;
          if (classList?.contains('hidden')) classList.replace('hidden', 'flex');
          else classList?.replace('flex', 'hidden');
        }} class="transition ease-in-out hover:bg-gray-800 hover:text-white p-2 rounded-lg text-3xl sm:hidden">
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
        <NavButton external href="/invite" extraClass="flex gap-3">
          <HappyOutline width="24" class="fill-current" />
          Invite
        </NavButton>
        <div class="flex justify-evenly">
          <NavButton external href="/github" title="GitHub" extraClass="flex sm:hidden">
            <LogoGithub width="24" class="fill-green-100" />
          </NavButton>
          <NavButton external href="/discord" title="Discord" extraClass="flex sm:hidden">
            <LogoDiscord width="24" class="fill-indigo-200" />
          </NavButton>
          <NavButton external href="https://luminescent.dev" title="Luminescent" extraClass="flex sm:hidden justify-center w-14">
            <div style={{ filter: 'drop-shadow(0 0 0 #DD6CFF)' }}>
              <div style={{ filter: 'drop-shadow(0 0 1rem #CB6CE6)' }} class="w-10 h-10">
                <Luminescent/>
              </div>
            </div>
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
  const location = useLocation();
  return (
    <div class="flex items-center justify-start">
      <Link href="/" class="transition ease-in-out text-gray-300 hover:bg-gray-800 hover:text-white drop-shadow-2xl pl-3 pr-3 md:pr-4 py-3 rounded-lg text-lg flex gap-2 items-center whitespace-nowrap">
        <picture>
          <source srcSet={iconAVIF} type="image/avif" />
          <source srcSet={iconWEBP} type="image/webp" />
          <img
            src={icon}
            class="h-8 w-8"
            width={32}
            height={32}
            alt="Cactie"
            loading="eager"
            decoding="async"
          />
        </picture>
        <span class="hidden md:flex">Cactie</span>
        <div class={`${location.isNavigating ? '' : '-ml-10 opacity-0'} transition-all`}>
          <LoadingIcon/>
        </div>
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
  return <>
    {external &&
      <a href={href} title={title} style={style} class={`group transition ease-in-out hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg items-center ${extraClass}`}>
        <Slot />
      </a>
    }
    {!external &&
      <Link href={href} onClick$={async () => { document.getElementById('mobile-menu')?.classList.replace('flex', 'hidden'); }} title={title} style={style} class={`group transition ease-in-out hover:bg-gray-800 hover:text-white ${icon ? 'text-3xl px-2' : 'px-4'} py-2 rounded-lg items-center ${extraClass}`}>
        <Slot />
      </Link>
    }
  </>;
});
