import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ChannelType } from 'discord-api-types/v10';
import Checkbox from '~/components/elements/Checkbox';
import SelectInput from '~/components/elements/SelectInput';
import { At, FileTrayFullOutline, FolderOutline, InvertModeOutline, IdCardOutline, TicketOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import LoadingIcon from '~/components/icons/LoadingIcon';

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
  const { srvconfig, guild, channels, roles } = useGetData().value;

  const store = useStore({
    loading: [] as string[],
  });

  return (
    <section class="mx-auto max-w-6xl px-6 py-24 flex flex-col gap-4 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <Checkbox toggle id="tickets-enabled" checked={srvconfig?.tickets.enabled} onChange$={async (event: any) => {
          store.loading.push('tickets-enabled');
          srvconfig!.tickets.enabled = event.target.checked;
          await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
          store.loading = store.loading.filter(l => l != 'tickets-enabled');
        }}>
          <h2 class="text-xl text-gray-300 font-semibold fill-current flex items-center gap-3">
            <TicketOutline width="32" />
            Tickets
            <div class={{
              'transition-all': true,
              'opacity-0 -ml-12': !store.loading.includes('tickets'),
              'opacity-100 -ml-1': store.loading.includes('tickets'),
            }}>
              <LoadingIcon />
            </div>
          </h2>
        </Checkbox>
        <MenuBar guild={guild} />
      </div>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          <Card fit>
            <CardHeader id="tickets-type" loading={store.loading.includes('tickets-type')}>
              <InvertModeOutline width="32" class="fill-current" /> Type
            </CardHeader>
            <SelectInput id="tickets-type-input" label="Whether to use buttons or reactions for ticket interactions" onChange$={async (event: any) => {
              store.loading.push('tickets-type');
              srvconfig!.tickets.type = event.target.value;
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              store.loading = store.loading.filter(l => l != 'tickets-type');
            }}>
              <option value="buttons" selected={srvconfig?.tickets.type == 'buttons'}>Use buttons</option>
              <option value="reactions" selected={srvconfig?.tickets.type == 'reactions'}>Use reactions</option>
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="tickets-name" loading={store.loading.includes('tickets-name')}>
              <IdCardOutline width="32" class="fill-current" /> Name
            </CardHeader>
            <Checkbox toggle id="tickets-name-input" checked={srvconfig?.tickets.count == 'false'} onChange$={async () => {
              store.loading.push('tickets-name');
              srvconfig!.tickets.count = srvconfig?.tickets.count == 'false' ? 1 : 'false';
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              store.loading = store.loading.filter(l => l != 'tickets-name');
            }}>
              Use usernames in ticket names
            </Checkbox>
            <p>
              Enabling and disabling this setting will reset the ticket counter to 1.
            </p>
          </Card>
          <Card fit>
            <CardHeader id="tickets-category" loading={store.loading.includes('tickets-category')}>
              <FolderOutline width="32" class="fill-current" /> Category
            </CardHeader>
            <SelectInput id="tickets-category-input" label="The category where tickets will appear" onChange$={async (event: any) => {
              store.loading.push('tickets-category');
              srvconfig!.tickets.category = event.target.value;
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              store.loading = store.loading.filter(l => l != 'tickets-category');
            }}>
              <option value="false" selected={srvconfig?.tickets.category == 'false'}>No Category</option>
              {channels.filter(c => c.type == ChannelType.GuildCategory).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.tickets.category == c.id}>{`> ${c.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="tickets-logchannel" loading={store.loading.includes('tickets-logchannel')}>
              <FileTrayFullOutline width="32" class="fill-current" /> Log Channel
            </CardHeader>
            <SelectInput id="tickets-logchannel-input" label="The channel where transcripts will appear" onChange$={async (event: any) => {
              store.loading.push('tickets-logchannel');
              srvconfig!.tickets.logchannel = event.target.value;
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              store.loading = store.loading.filter(l => l != 'tickets-logchannel');
            }}>
              <option value="false" selected={srvconfig?.tickets.logchannel == 'false'}>Don't send transcripts</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.tickets.logchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="tickets-role" loading={store.loading.includes('tickets-role')}>
              <At width="32" class="fill-current" /> Access Role
            </CardHeader>
            <SelectInput id="tickets-role-input" label="The role that may access tickets" onChange$={async (event: any) => {
              store.loading.push('tickets-role');
              srvconfig!.tickets.role = event.target.value;
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
              store.loading = store.loading.filter(l => l != 'tickets-role');
            }} style={{
              color: '#' + (roles.find(r => r.id == srvconfig?.tickets.role)?.color ? roles.find(r => r.id == srvconfig?.tickets.role)?.color.toString(16) : 'ffffff'),
            }}>
              <option value="false" selected={srvconfig?.tickets.role == 'false'} style={{ color: '#ffffff' }}>Not Set</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.tickets.role == r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="tickets-mention" loading={store.loading.includes('tickets-mention')}>
              <At width="32" class="fill-current" /> Mention
            </CardHeader>
            <SelectInput id="tickets-mention-input" label="Pings the specified role when a ticket is created" onChange$={async (event: any) => {
              store.loading.push('tickets-mention');
              srvconfig!.tickets.mention = event.target.value;
              await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
              event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
              store.loading = store.loading.filter(l => l != 'tickets-mention');
            }} style={{
              color: '#' + (roles.find(r => r.id == srvconfig?.tickets.mention)?.color ? roles.find(r => r.id == srvconfig?.tickets.mention)?.color.toString(16) : 'ffffff'),
            }}>
              <option value="false" selected={srvconfig?.tickets.mention == 'false'} style={{ color: '#ffffff' }}>No mention</option>
              <option value="everyone" selected={srvconfig?.tickets.mention == 'everyone'} style={{ color: 'rgb(59 130 246)' }}>@ everyone</option>
              <option value="here" selected={srvconfig?.tickets.mention == 'here'} style={{ color: 'rgb(59 130 246)' }}>@ here</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.tickets.mention == r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </Card>
        </div>
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