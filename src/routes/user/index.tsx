// File: src/routes/product/[skuId]/details/index.tsx
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import getAuth from '../../auth';

export interface UserInfo {
  tag: string;
  pfp: string;
  accent: string;
}

export const onGet: RequestHandler<UserInfo> = async ({ url, params, request, response }) => {
  const auth = getAuth(request);
  return auth ? {
    tag: auth.tag,
    pfp: auth.pfp,
    accent: auth.accent,
  } : null;
};

export const head: DocumentHead = {
  title: 'User',
  meta: [
    {
      name: 'description',
      content: 'Info for the current logged in user. Will be null if the user is not logged in.'
    }
  ]
}