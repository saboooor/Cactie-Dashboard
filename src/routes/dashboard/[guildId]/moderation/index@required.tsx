import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import SelectInput from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { CreateOutline, NotificationsOffOutline, ShieldCheckmarkOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';

import { getGuildFn, getSrvConfigFn, updateSettingFn } from '../index@required';
import MenuBar from '~/components/MenuBar';
export const useGetData = routeLoader$(async (props) => {
  const [srvconfig, guild] = await Promise.all([
    getSrvConfigFn(props),
    getGuildFn(props),
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
    <section class="mx-auto max-w-6xl px-6 py-24 flex flex-col gap-4 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <h2 class="text-xl text-gray-300 font-semibold fill-current flex items-center gap-3">
          <ShieldCheckmarkOutline width="32" /> Moderation
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="grid grid-cols-2 gap-4 py-10">
        <Card>
          <CardHeader id="msgshortener" loading={store.loading.includes('msgshortener')}>
            <CreateOutline width="32" class="fill-current" /> Message Shortener
          </CardHeader>
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
          <CardHeader id="mutecmd" loading={store.loading.includes('mutecmd')}>
            <NotificationsOffOutline width="32" class="fill-current" /> Mute Command
          </CardHeader>
          <SelectInput id="mutecmd-input" label="Select a role to give when muting or use Discord's timeout feature" onChange$={async (event: any) => {
            store.loading.push('mutecmd');
            await updateSettingFn('mutecmd', event.target.value);
            event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
            store.loading = store.loading.filter(l => l != 'mutecmd');
          }} style={{
            color: '#' + (roles.find(r => r.id == srvconfig?.mutecmd)?.color ? roles.find(r => r.id == srvconfig?.mutecmd)?.color.toString(16) : 'ffffff'),
          }}>
            <option value="timeout" selected={srvconfig?.mutecmd == 'timeout'} style={{ color: '#ffffff' }}>Use Discord's timeout feature</option>
            {roles.map(r =>
              <option value={r.id} key={r.id} selected={srvconfig?.mutecmd == r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
            )}
          </SelectInput>
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