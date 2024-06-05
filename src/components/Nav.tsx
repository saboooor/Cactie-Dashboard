import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

import { LogoDiscord, LogoGithub, SettingsOutline, ReaderOutline, HappyOutline, LogOutOutline, LogInOutline } from 'qwik-ionicons';

import IconCactie from '~/components/images/Cactie.png?w=1024&h=1024&jsx';

import { Button, ButtonAnchor, LoadingIcon, Nav, LogoLuminescent, DropdownRaw } from '@luminescent/ui';

export default component$(({ auth }: any) => {
  const loc = useLocation();

  return (
    <Nav fixed>
      <Link q:slot="start" href="/">
        <Button square transparent>
          <IconCactie class="h-8 w-8" />
          <p class="mt-0.5 space-x-1 whitespace-nowrap hidden sm:flex">
            Cactie
          </p>
          <div class={{
            'transition-all': true,
            '-ml-7 sm:-ml-5 opacity-0': !loc.isNavigating,
          }}>
            <LoadingIcon width={16} speed="0.4s" />
          </div>
        </Button>
      </Link>

      {auth &&
        <Link q:slot="end" href="/dashboard" class={{ 'hidden sm:flex': true }}>
          <Button transparent class={{ 'w-full': true }}>
            <SettingsOutline width="24" class="fill-current" />
            Dashboard
          </Button>
        </Link>
      }
      <Link q:slot="end" href="/legal" class={{ 'hidden sm:flex': true }}>
        <Button transparent class={{ 'w-full': true }}>
          <ReaderOutline width="24" class="fill-current" />
          Legal
        </Button>
      </Link>
      <ButtonAnchor q:slot="end" href="/invite" transparent class={{ 'hidden sm:flex': true }}>
        <HappyOutline width="24" class="fill-current" />
        Invite
      </ButtonAnchor>
      <div q:slot='end' class="hidden sm:flex gap-2">
        <SocialButtons />
      </div>
      {!auth &&
        <ButtonAnchor q:slot="end" href="/login" transparent>
          <LogInOutline width="24" class="fill-current" />
          Login
        </ButtonAnchor>
      }
      {auth &&
        <DropdownRaw id="profile" q:slot='end' transparent display={
          <img src={auth.pfp ?? 'https://cdn.discordapp.com/embed/avatars/0.png'} class="rounded-full min-h-6 max-h-6 min-w-6 max-w-6" width={24} height={24} />
        } style={{ backgroundColor: auth.accent }}>
          <ButtonAnchor href="/logout" q:slot="extra-buttons" transparent>
            <LogOutOutline width="24" class="fill-current" />
            Logout
          </ButtonAnchor>
        </DropdownRaw>
      }

      {auth &&
        <Link q:slot="mobile" href="/dashboard">
          <Button transparent class={{ 'w-full': true }}>
            <SettingsOutline width="24" class="fill-current" />
            Dashboard
          </Button>
        </Link>
      }
      <Link q:slot="mobile" href="/legal">
        <Button transparent class={{ 'w-full': true }}>
          <ReaderOutline width="24" class="fill-current" />
          Legal
        </Button>
      </Link>
      <ButtonAnchor q:slot="mobile" href="/invite" transparent>
        <HappyOutline width="24" class="fill-current" />
        Invite
      </ButtonAnchor>
      <div q:slot='mobile' class="flex justify-evenly">
        <SocialButtons />
      </div>
    </Nav>
  );
});

export const SocialButtons = component$(() => {
  return <>
    <ButtonAnchor transparent square href="/github" title="GitHub">
      <LogoGithub width="24" />
    </ButtonAnchor>
    <ButtonAnchor transparent square href="/discord" title="Discord">
      <LogoDiscord width="24" class="fill-indigo-200" />
    </ButtonAnchor>
    <ButtonAnchor transparent square href="https://luminescent.dev" title="Luminescent">
      <LogoLuminescent width="24" class="fill-luminescent-300" />
    </ButtonAnchor>
  </>;
});