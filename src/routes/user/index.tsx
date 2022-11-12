// File: src/routes/product/[skuId]/details/index.tsx
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import getAuth from '../../auth';

export interface UserInfo {
  tag: string;
  pfp: string;
  accent: string;
}

export const onGet: RequestHandler<UserInfo> = async ({ request }) => {
  const auth = getAuth(request);
  return auth ? {
    tag: auth.tag,
    pfp: auth.pfp,
    accent: auth.accent,
    guilds: auth.guildsdata,
    expires_on: auth.expires_in
  } : null;
};

export const head: DocumentHead = {
  title: 'User',
  meta: [
    {
      name: 'description',
      content: 'Info for the current logged in user. Will be null if the user is not logged in.'
    },
    {
      property: 'og:description',
      content: 'Info for the current logged in user. Will be null if the user is not logged in.'
    }
  ]
}