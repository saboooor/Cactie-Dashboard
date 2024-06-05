import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ChannelType } from 'discord-api-types/v10';

import { At, FileTrayFullOutline, FolderOutline, InvertModeOutline, IdCardOutline, TicketOutline } from 'qwik-ionicons';
import { Card, Dropdown, Header, LoadingIcon, Toggle } from '@luminescent/ui';

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
  const { srvconfig, guild, channels, roles } = useGetData().value;

  const store = useStore({
    loading: [] as string[],
  });

  return (
    <section class="mx-auto max-w-6xl px-6 flex flex-col gap-4 items-center min-h-[100svh] pt-32">
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <div class="bg-orange-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <Toggle onColor="orange" label={
          <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
            <TicketOutline width="32" />
              Tickets
            <div class={{
              'transition-all': true,
              'opacity-0 -ml-12': !store.loading.includes('tickets'),
              'opacity-100 -ml-1': store.loading.includes('tickets'),
            }}>
              <LoadingIcon width={24} />
            </div>
          </h2>
        } id="tickets-enabled" checked={srvconfig?.tickets.enabled} onChange$={async (event: any) => {
          store.loading.push('tickets-enabled');
          srvconfig!.tickets.enabled = event.target.checked;
          await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
          store.loading = store.loading.filter(l => l != 'tickets-enabled');
        }}/>
        <MenuBar guild={guild} />
      </div>
      <div class="grid sm:grid-cols-2 gap-4 py-10">
        <Card>
          <Header id="tickets-type" loading={store.loading.includes('tickets-type')}>
            <InvertModeOutline width="32" class="fill-current" /> Type
          </Header>
          <Dropdown id="tickets-type-input" onChange$={async (event: any) => {
            store.loading.push('tickets-type');
            srvconfig!.tickets.type = event.target.value;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            store.loading = store.loading.filter(l => l != 'tickets-type');
          }} values={[
            { name: 'Use buttons', value: 'buttons' },
            { name: 'Use reactions', value: 'reactions' },
          ]} value={srvconfig?.tickets.type}>
            Use buttons or reactions for ticket interactions
          </Dropdown>
        </Card>
        <Card>
          <Header id="tickets-name" loading={store.loading.includes('tickets-name')}>
            <IdCardOutline width="32" class="fill-current" /> Name
          </Header>
          <Toggle onColor='orange' label="Use usernames in ticket names" id="tickets-name-input" checked={srvconfig?.tickets.count == 'false'} onChange$={async () => {
            store.loading.push('tickets-name');
            srvconfig!.tickets.count = srvconfig?.tickets.count == 'false' ? 1 : 'false';
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            store.loading = store.loading.filter(l => l != 'tickets-name');
          }}/>
          <p>
            Enabling and disabling this setting will reset the ticket counter to 1.
          </p>
        </Card>
        <Card>
          <Header id="tickets-category" loading={store.loading.includes('tickets-category')}>
            <FolderOutline width="32" class="fill-current" /> Category
          </Header>
          <Dropdown id="tickets-category-input" onChange$={async (event: any) => {
            store.loading.push('tickets-category');
            srvconfig!.tickets.category = event.target.value;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            store.loading = store.loading.filter(l => l != 'tickets-category');
          }} values={[
            { name: 'No Category', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildCategory).map(c => ({ name: `> ${c.name}`, value: c.id })),
          ]} value={srvconfig?.tickets.category}>
            The category where tickets will appear
          </Dropdown>
        </Card>
        <Card>
          <Header id="tickets-logchannel" loading={store.loading.includes('tickets-logchannel')}>
            <FileTrayFullOutline width="32" class="fill-current" /> Log Channel
          </Header>
          <Dropdown id="tickets-logchannel-input" onChange$={async (event: any) => {
            store.loading.push('tickets-logchannel');
            srvconfig!.tickets.logchannel = event.target.value;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            store.loading = store.loading.filter(l => l != 'tickets-logchannel');
          }} values={[
            { name: 'Don\'t send transcripts', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ name: `# ${c.name}`, value: c.id })),
          ]} value={srvconfig?.tickets.logchannel}>
            The channel where transcripts will appear
          </Dropdown>
        </Card>
        <Card>
          <Header id="tickets-role" loading={store.loading.includes('tickets-role')}>
            <At width="32" class="fill-current" /> Access Role
          </Header>
          <Dropdown id="tickets-role-input" onChange$={async (event: any) => {
            store.loading.push('tickets-role');
            srvconfig!.tickets.role = event.target.value;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
            store.loading = store.loading.filter(l => l != 'tickets-role');
          }} style={{
            color: '#' + (roles.find(r => r.id == srvconfig?.tickets.role)?.color ? roles.find(r => r.id == srvconfig?.tickets.role)?.color.toString(16) : 'ffffff'),
          }} values={[
            { name: 'Not Set', value: 'false' },
            ...roles.map(r => ({ name: `@ ${r.name}`, value: r.id })),
          ]} value={srvconfig?.tickets.role}>
            The role that may access tickets
          </Dropdown>
        </Card>
        <Card>
          <Header id="tickets-mention" loading={store.loading.includes('tickets-mention')}>
            <At width="32" class="fill-current" /> Mention
          </Header>
          <Dropdown id="tickets-mention-input" onChange$={async (event: any) => {
            store.loading.push('tickets-mention');
            srvconfig!.tickets.mention = event.target.value;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
            store.loading = store.loading.filter(l => l != 'tickets-mention');
          }} style={{
            color: '#' + (roles.find(r => r.id == srvconfig?.tickets.mention)?.color ? roles.find(r => r.id == srvconfig?.tickets.mention)?.color.toString(16) : 'ffffff'),
          }} values={[
            { name: 'No mention', value: 'false' },
            { name: '@ everyone', value: 'everyone' },
            { name: '@ here', value: 'here' },
            ...roles.map(r => ({ name: `@ ${r.name}`, value: r.id })),
          ]} value={srvconfig?.tickets.mention}>
            Pings the specified role when a ticket is created
          </Dropdown>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Tickets',
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