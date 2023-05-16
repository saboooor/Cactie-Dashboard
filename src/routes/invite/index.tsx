import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ url, redirect }) => {
  const dev = url.searchParams.get('dev');
  const guildId = url.searchParams.get('guild');
  throw redirect(302, 'https://discord.com/oauth2/authorize' + `?client_id=${dev ? '765287593762881616' : '848775888673439745'}` + '&permissions=1428382149750' + '&scope=bot%20applications.commands' + (guildId ? `&guild_id=${guildId}` : ''));
};

export const head: DocumentHead = {
  title: 'Invite',
  meta: [
    {
      name: 'description',
      content: 'Invite me to your Discord server!',
    },
    {
      property: 'og:description',
      content: 'Invite me to your Discord server!',
    },
  ],
};