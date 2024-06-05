import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

import IconCactie from '~/components/images/Cactie.png?w=1024&h=1024&jsx';

import { HappyOutline, LogoDiscord, LogInOutline, SettingsOutline } from 'qwik-ionicons';
import { useGetAuth } from './layout';
import { ButtonAnchor, Button } from '@luminescent/ui';

export default component$(() => {
  const auth = useGetAuth();
  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center min-h-[100svh] pt-20">
      <div>
        <div class="flex relative w-full">
          <h1 class="font-bold text-white text-3xl sm:text-5xl md:text-6xl">
            The only <span class="text-blue-400">Discord</span> bot you need, <span class="text-green-200">Cactie</span>.
          </h1>
          <IconCactie class="sm:hidden floating" style={{ filter: 'drop-shadow(0 1rem 2rem #AEF9C260)', maxWidth: '40vw', objectFit: 'contain' }}/>
        </div>
        <p class="mt-5 text-lg sm:text-2xl md:text-3xl text-slate-400">
          Moderation, Fun, QOL, Utilities, and More!
        </p>
        <p class="my-5 text-xs text-slate-400">
          It's pronounced Cact-E, btw
        </p>
        <div class="flex flex-col sm:flex-row justify-start">
          <ButtonAnchor size="xl" color="purple" href="/invite" style={{ filter: 'drop-shadow(0 3rem 6rem #CB6CE6)' }}>
            <HappyOutline width="24" class="fill-current" />
            Invite me to your server!
          </ButtonAnchor>
        </div>
        <div class="mt-3 flex flex-col sm:flex-row gap-2">
          <div class="rounded-md shadow">
            <ButtonAnchor size="xl" color="gray" href="/discord">
              <LogoDiscord width="24" class="fill-current" />
              Join the Discord!
            </ButtonAnchor>
          </div>
          <div class="rounded-md shadow">
            {!auth.value &&
              <ButtonAnchor size="xl" color="gray" href="/login">
                <LogInOutline width="24" class="fill-current" />
                Login
              </ButtonAnchor>
            }
            {auth.value &&
              <Link href="/dashboard">
                <Button size="xl" color="gray" class={{ 'w-full': true }}>
                  <SettingsOutline width="24" class="fill-current" />
                  Dashboard
                </Button>
              </Link>
            }
          </div>
        </div>
      </div>
      <div class="hidden sm:flex relative z-20">
        <IconCactie class="z-10 floating mx-auto" style={{ filter: 'drop-shadow(0 6rem 12rem #AEF9C260)' }}/>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Home',
  meta: [
    {
      name: 'description',
      content: 'A bot that does stuff ig',
    },
    {
      property: 'og:description',
      content: 'A bot that does stuff ig',
    },
  ],
};