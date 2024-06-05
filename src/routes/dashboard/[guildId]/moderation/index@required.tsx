import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';

import { CreateOutline, NotificationsOffOutline, ShieldCheckmarkOutline } from 'qwik-ionicons';
import { Card, Dropdown, Header, NumberInput } from '@luminescent/ui';

import { getGuild, getSrvConfig, updateSettingFn } from '../index@required';
import MenuBar from '~/components/MenuBar';
export const useGetData = routeLoader$(async (props) => {
  const [srvconfig, guild] = await Promise.all([
    getSrvConfig(props),
    getGuild(props),
  ]);
  return { srvconfig, ...guild };
});

export default component$(() => {
  const data = useGetData().value;
  const { guild, roles } = useGetData().value;

  const store = useStore({
    loading: [] as string[],
    srvconfig: data.srvconfig,
  });

  const srvconfig = store.srvconfig;

  return (
    <section class="mx-auto max-w-6xl px-6 flex flex-col gap-4 items-center min-h-[100svh] pt-32">
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <div class="bg-yellow-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <ShieldCheckmarkOutline width="32" /> Moderation
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="grid md:grid-cols-2 gap-4 py-10">
        <Card>
          <Header id="msgshortener" loading={store.loading.includes('msgshortener')}>
            <CreateOutline width="32" class="fill-current" /> Message Shortener
          </Header>
          <NumberInput input value={srvconfig?.msgshortener} id="msgshortener-input" onChange$={async (event: any) => {
            store.loading.push('msgshortener');
            srvconfig!.msgshortener = parseInt(event.target.value);
            await updateSettingFn('msgshortener', srvconfig?.msgshortener);
            store.loading = store.loading.filter(l => l != 'msgshortener');
          }}
          onIncrement$={async () => {
            store.loading.push('msgshortener');
            srvconfig!.msgshortener++;
            await updateSettingFn('msgshortener', srvconfig?.msgshortener);
            store.loading = store.loading.filter(l => l != 'msgshortener');
          }}
          onDecrement$={async () => {
            store.loading.push('msgshortener');
            srvconfig!.msgshortener--;
            await updateSettingFn('msgshortener', srvconfig?.msgshortener);
            store.loading = store.loading.filter(l => l != 'msgshortener');
          }}>
            The amount of lines in a message to shorten into a link. To disable, set to 0
          </NumberInput>
        </Card>
        <Card>
          <Header id="mutecmd" loading={store.loading.includes('mutecmd')}>
            <NotificationsOffOutline width="32" class="fill-current" /> Mute Command
          </Header>
          <Dropdown id="mutecmd-input" onChange$={async (event: any) => {
            store.loading.push('mutecmd');
            await updateSettingFn('mutecmd', event.target.value);
            event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
            store.loading = store.loading.filter(l => l != 'mutecmd');
          }} style={{
            color: '#' + (roles.find(r => r.id == srvconfig?.mutecmd)?.color ? roles.find(r => r.id == srvconfig?.mutecmd)?.color.toString(16) : 'ffffff'),
          }} values={[
            { name: 'Use Discord\'s timeout feature', value: 'timeout' },
            ...roles.map(r => ({ name: `@ ${r.name}`, value: r.id, style: { color: '#' + (r.color ? r.color.toString(16) : 'ffffff') } })),
          ]} value={srvconfig?.mutecmd}>
            Select a role to give when muting or use Discord's timeout feature
          </Dropdown>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Moderation',
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