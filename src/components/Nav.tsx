import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LogoDiscord, Nav } from '@luminescent/ui-qwik';
import { SiGithub } from 'simple-icons-qwik';

export default component$(() => {
  return (
    <Nav floating fixed colorClass="lum-bg-lum-input-bg/50 !text-lum-text">
      <Link q:slot="start" href="/" class="lum-btn lum-bg-transparent rounded-lum-2">
        Sova
      </Link>

      <div q:slot="end" class="hidden gap-2 sm:flex">
        <SocialButtons />
      </div>

      <div q:slot="mobile" class="flex justify-evenly">
        <SocialButtons />
      </div>
    </Nav>
  );
});

export const SocialButtons = component$(({ large }: { large?: boolean }) => {
  return <>
    <a
      href="https://github.com/LuminescentDev"
      title="GitHub"
      class={{
        'lum-btn lum-bg-transparent': true,
        'p-3': large,
        'rounded-lum-2 p-2': !large,
      }}
    >
      <SiGithub size={large ? 32 : 20} />
    </a>
    <a
      href="/discord"
      title="Discord"
      class={{
        'lum-btn lum-bg-transparent': true,
        'p-3': large,
        'rounded-lum-2 p-2': !large,
      }}
    >
      <LogoDiscord size={large ? 32 : 20} />
    </a>
  </>;
});