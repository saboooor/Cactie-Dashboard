// File: src/routes/product/[skuId]/details/index.tsx
import type { RequestHandler } from '@builder.io/qwik-city';
import getAuth from '../../auth';

export interface UserInfo {
  tag: string;
  pfp: string;
}

export const onGet: RequestHandler<UserInfo> = async ({ url, params, request, response }) => {
  const auth = getAuth(request);
  return auth ? {
    tag: auth.tag,
    pfp: auth.pfp,
  } : null;
};