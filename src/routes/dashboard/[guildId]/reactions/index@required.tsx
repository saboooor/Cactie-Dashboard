import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';

import EmojiInput, { EmojiPicker } from '~/components/elements/EmojiInput';
import { Add, Close, Remove, ChatboxOutline } from 'qwik-ionicons';
import { LoadingIcon, Card, Header, TextInputRaw, Button } from '@luminescent/ui';

import { getGuild, getSrvConfig, updateSettingFn } from '../index@required';
import MenuBar from '~/components/MenuBar';
export const useGetGuild = routeLoader$(async (props) => await getGuild(props));
export const useGetSrvConfig = routeLoader$(async (props) => await getSrvConfig(props));

export default component$(() => {
  const { guild } = useGetGuild().value;

  const store = useStore({
    loading: [] as string[],
    srvconfig: useGetSrvConfig().value,
  });

  return (
    <section class="mx-auto max-w-6xl px-6 flex flex-col gap-4 items-center min-h-[100svh] pt-32">
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <div class="bg-green-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <ChatboxOutline width="32" />
          Reactions
          <div class={{
            'transition-all': true,
            'opacity-0 -ml-12': !store.loading.includes('reactionroles'),
            'opacity-100 -ml-2': store.loading.includes('reactionroles'),
          }}>
            <LoadingIcon width={24} />
          </div>
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
        <p>
          The Reactions feature uses regex to detect messages and react to them. You can use this to make your own custom reactions. In order to create a regex expression based on your needs, either ask AI to make one for you (for example: "Create a regex pattern that matches 'cactie' and 'great' in any order" will give you a regex pattern that matches "cactie is great" or "great cactie" etc.) or use a regex generator online (for example: https://regexr.com/)
        </p>
        <div class="py-10 grid gap-4">
          {
            store.srvconfig?.reactions.map((reaction, i) =>
              <Card key={i}>
                <TextInputRaw placeholder="Regex Pattern" value={reaction.regex} onChange$={async (event: any) => {
                  store.loading.push('reactions');
                  store.srvconfig!.reactions[i].regex = event.target.value;
                  await updateSettingFn('reactions', JSON.stringify(store.srvconfig?.reactions));
                  store.loading = store.loading.filter(l => l != 'reactions');
                }} class={{ 'font-mono': true }} />
                <div class="flex">
                  <div class="flex flex-wrap gap-2 flex-1">
                    <Button square disabled={reaction.emojis.length < 2} onClick$={async () => {
                      store.loading.push('reactions');
                      store.srvconfig!.reactions[i].emojis.pop();
                      await updateSettingFn('reactions', JSON.stringify(store.srvconfig?.reactions));
                      store.loading = store.loading.filter(l => l != 'reactions');
                    }}>
                      <Remove width="24" class="fill-current" />
                    </Button>
                    {(reaction.emojis as any[]).map((emoji, i2) => {
                      return <EmojiInput nolabel emoji={emoji} key={i2} id={`reaction-emoji-${i2}`} onChange$={async (event: any) => {
                        store.loading.push('reactions');
                        const reactions = JSON.parse(JSON.stringify(store.srvconfig?.reactions));
                        reactions[i].emojis[i2] = event.target.getAttribute('value');
                        await updateSettingFn('reactions', JSON.stringify(reactions));
                        store.loading = store.loading.filter(l => l != 'reactions');
                      }} />;
                    })}
                    <Button square onClick$={() => {
                      store.loading.push('reactions');
                      store.srvconfig!.reactions[i].emojis.push('Select an Emoji');
                      store.loading = store.loading.filter(l => l != 'reactions');
                    }} disabled={store.srvconfig?.reactions[i].emojis.includes('Select an Emoji')}>
                      <Add width="24" class="fill-current" />
                    </Button>
                  </div>
                  <Close width="36" class="fill-red-400 cursor-pointer" onClick$={async () => {
                    store.loading.push('reactions');
                    store.srvconfig!.reactions.splice(i, 1);
                    await updateSettingFn('reactions', JSON.stringify(store.srvconfig?.reactions));
                    store.loading = store.loading.filter(l => l != 'reactions');
                  }} />
                </div>
              </Card>,
            )
          }
          <Card>
            <Header>
              <Add width="32" class="fill-current" /> Create
            </Header>
            <div class="flex gap-2">
              <div class="flex-1">
                <TextInputRaw placeholder="Regex Pattern" class={{ 'font-mono w-full': true }} id="reaction-create-regex" />
              </div>
              <EmojiInput nolabel id="reaction-emoji-create" />
              <Add width="36" class="text-green-400 cursor-pointer" onClick$={async () => {
                store.loading.push('reactions');

                store.srvconfig?.reactions.push({
                  regex: (document.getElementById('reaction-create-regex') as HTMLInputElement).value,
                  emojis: [(document.getElementById('reaction-emoji-create') as HTMLInputElement).getAttribute('value')],
                });
                await updateSettingFn('reactions', JSON.stringify(store.srvconfig?.reactions));
                store.loading = store.loading.filter(l => l != 'reactions');
              }} />
            </div>
          </Card>
        </div>
      </div>

      <EmojiPicker props={{
        custom: [
          {
            id: 'custom',
            name: guild.name,
            emojis: guild.emojis.map(e => ({
              id: e.id,
              name: e.name,
              skins: [{ src: `https://cdn.discordapp.com/emojis/${e.id}` }],
            })),
          },
        ],
        categoryIcons: {
          custom: {
            src: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`,
          },
        },
      }}/>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Reactions',
  meta: [
    {
      name: 'description',
      content: 'The Cactie Dashboard',
    },
    {
      property: 'og:description',
      content: 'The Cactie Dashboard',
    },
  ],
};