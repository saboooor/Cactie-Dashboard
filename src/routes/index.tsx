import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

// @ts-ignore
import iconAVIF from '~/components/images/Cactie.png?avif&w=1024&h=1024';
// @ts-ignore
import iconWEBP from '~/components/images/Cactie.png?webp&w=1024&h=1024';
// @ts-ignore
import icon from '~/components/images/Cactie.png?w=1024&h=1024';

import { HappyOutline, LogoDiscord, PersonCircleOutline, SettingsOutline } from 'qwik-ionicons';
import { useGetAuth } from './layout';
import { ExternalButton, SPAButton } from '~/components/elements/Button';

export default component$(() => {
  const auth = useGetAuth();
  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div>
        <div class="flex sm:hidden relative justify-center align-center sm:ml-auto mb-10" style="width: 100%;">
          <div class="absolute top-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl" style={{ left: '45%' }}></div>
          <div class="absolute top-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-2000" style={{ right: '50%' }}></div>
          <div class="absolute bottom-5 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-xl animation-delay-4000" style={{ left: '40%' }}></div>
          <picture>
            <source srcSet={iconAVIF} type="image/avif" />
            <source srcSet={iconWEBP} type="image/webp" />
            <img
              src={icon}
              class="z-10 animate-float ease-in-out mx-auto"
              alt="Cactie"
              loading="eager"
              decoding="async"
              style={{ maxWidth: '40%' }}
            />
          </picture>
        </div>
        <h1 class="font-bold text-white text-4xl sm:text-5xl md:text-6xl">
          The last <span class="text-blue-400">Discord</span> bot you need, <span class="text-green-200">Cactie</span>.
        </h1>
        <p class="mt-5 text-xl sm:text-2xl md:text-3xl text-gray-400">
          Moderation, Fun, Music, Utilities, and More!
        </p>
        <p class="my-5 text-xs text-gray-400">
          It's pronounced Cact-E, btw
        </p>
        <div class="flex flex-col sm:flex-row justify-start" style={{ filter: 'drop-shadow(0 5rem 10rem #CB6CE6)' }}>
          <ExternalButton massive bold color="primary" href="/invite" style={{ filter: 'drop-shadow(0 5rem 10rem #CB6CE6)' }}>
            <HappyOutline width="24" class="fill-current" />
            Invite me to your server!
          </ExternalButton>
        </div>
        <div class="mt-3 flex flex-col sm:flex-row gap-2">
          <div class="rounded-md shadow">
            <ExternalButton massive bold href="/discord">
              <LogoDiscord width="24" class="fill-current" />
              Join the Discord!
            </ExternalButton>
          </div>
          <div class="rounded-md shadow">
            {!auth.value &&
              <ExternalButton massive bold href="/login">
                <PersonCircleOutline width="24" class="fill-current" />
                Login
              </ExternalButton>
            }
            {auth.value &&
              <SPAButton massive bold href="/dashboard">
                <SettingsOutline width="24" class="fill-current" />
                Dashboard
              </SPAButton>
            }
          </div>
        </div>
      </div>
      <div class="hidden sm:flex relative justify-end align-center sm:ml-auto" style={{ maxWidth: '50%' }}>
        <div class="absolute top-10 left-10 w-72 h-72 bg-pink-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl"></div>
        <div class="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-2000"></div>
        <div class="absolute bottom-5 left-32 w-72 h-72 bg-yellow-200 rounded-full opacity-20 animate-blob ease-in-out filter blur-2xl animation-delay-4000"></div>
        <picture>
          <source srcSet={iconAVIF} type="image/avif" />
          <source srcSet={iconWEBP} type="image/webp" />
          <img
            src={icon}
            class="z-10 animate-float ease-in-out"
            alt="Cactie"
            loading="eager"
            decoding="async"
          />
        </picture>
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