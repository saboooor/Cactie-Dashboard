import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ url, response }) => {
  const guildId = url.searchParams.get('guild');
  throw response.redirect('https://discord.com/oauth2/authorize' + `?client_id=${bot.id}` + '&permissions=1428382149750' + '&scope=bot%20applications.commands' + (guildId ? `&guild_id=${guildId}` : ''))
};

export const head: DocumentHead = {
  title: 'Invite',
  meta: [
    {
      name: 'description',
      content: 'Invite me to your Discord server!'
    },
    {
      property: 'og:description',
      content: 'Invite me to your Discord server!'
    }
  ]
}