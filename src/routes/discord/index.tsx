import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ response }) => { throw response.redirect('https://discord.gg/sf5Hty88TR'); };

export const head: DocumentHead = {
  title: 'Discord',
  meta: [
    {
      name: 'description',
      content: 'Join the Discord Server!'
    },
    {
      property: 'og:description',
      content: 'Join the Discord Server!'
    }
  ]
}