import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ url, response }) => {
  const guildId = url.searchParams.get('guild');
  throw response.redirect('https://discord.com/oauth2/authorize' + `?client_id=1037611758858272809` + '&permissions=328602086464' + '&scope=bot%20applications.commands' + (guildId ? `&guild_id=${guildId}` : ''))
};

export const head: DocumentHead = {
  title: 'Invite Plus',
  meta: [
    {
      name: 'description',
      content: 'Invite Cactie Plus to your Discord server!'
    },
    {
      property: 'og:description',
      content: 'Invite Cactie Plus to your Discord server!'
    }
  ]
}