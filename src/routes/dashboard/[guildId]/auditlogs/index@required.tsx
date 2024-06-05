import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';

import { Close, ChatboxOutline, NewspaperOutline, FileTrayFullOutline } from 'qwik-ionicons';
import { Card, Dropdown, Header, LoadingIcon, Button, DropdownRaw } from '@luminescent/ui';

import { getGuild, getSrvConfig, updateSettingFn } from '../index@required';
import { ChannelType } from 'discord-api-types/v10';
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
  const { guild, channels } = useGetData().value;

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
        <div class="bg-blue-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <NewspaperOutline width="32" />
          Audit Logs
          <div class={{
            'transition-all': true,
            'opacity-0 -ml-12': !store.loading.includes('auditlogs'),
            'opacity-100': store.loading.includes('auditlogs'),
          }}>
            <LoadingIcon width={24} />
          </div>
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="py-10 grid grid-cols-2 gap-4">
        <Card>
          <Header id="logchannel" loading={store.loading.includes('logchannel')}>
            <FileTrayFullOutline width="32" class="fill-current" /> General Log Channel
          </Header>
          <Dropdown id="logchannel-value" onChange$={async (event: any) => {
            store.loading.push('logchannel');
            await updateSettingFn('logchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'logchannel');
          }} values={[
            { value: 'false', name: 'No logs' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ value: c.id, name: `# ${c.name}` })),
          ]} value={srvconfig?.logchannel}>
            The channel where general logs like moderation and tickets will appear (this is separate from the main audit logs for now)
          </Dropdown>
        </Card>
        <Card>
          <Header>
            <ChatboxOutline width="32" class="fill-current" /> Default Channel
          </Header>
          <Dropdown id="auditlogs-channel" onChange$={async (event: any) => {
            store.loading.push('auditlogs');
            srvconfig!.auditlogs.channel = event.target.value;
            await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
            store.loading = store.loading.filter(l => l != 'auditlogs');
          }} values={[
            { value: 'false', name: 'No channel specified.' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ value: c.id, name: `# ${c.name}` })),
          ]} value={srvconfig?.auditlogs.channel}>
            This is where logs will be sent if there is no specific channel set on them
          </Dropdown>
        </Card>
        <div class="flex flex-wrap gap-4">
          {
            Object.keys(srvconfig?.auditlogs.logs).map((log, i) => {
              return (
                <Card key={i}>
                  <div class="flex items-start flex-1">
                    <h1 class="flex-1 justify-start font-bold text-slate-100 text-2xl">
                      {log}
                    </h1>
                    <Close width="36" class="fill-red-400 cursor-pointer" onClick$={async () => {
                      store.loading.push('auditlogs');
                      delete srvconfig!.auditlogs.logs[log];
                      await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                      store.loading = store.loading.filter(l => l != 'auditlogs');
                    }} />
                  </div>
                  <Dropdown id={`auditlogs-logs-${log}.channel`} name={`auditlogs.logs.${log}.channel`} onChange$={async (event: any) => {
                    store.loading.push('auditlogs');
                    srvconfig!.auditlogs.logs[log].channel = event.target.value;
                    await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                    store.loading = store.loading.filter(l => l != 'auditlogs');
                  }} values={[
                    { value: 'false', name: 'Default Channel' },
                    ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ value: c.id, name: `# ${c.name}` })),
                  ]} value={srvconfig?.auditlogs.logs[log].channel}>
                    The channel to associate this log to
                  </Dropdown>
                </Card>
              );
            })
          }
          {!(srvconfig?.auditlogs.logs?.all || (
            (srvconfig?.auditlogs.logs?.member || (srvconfig?.auditlogs.logs?.memberjoin && srvconfig?.auditlogs.logs?.memberleave))
            && (srvconfig?.auditlogs.logs?.message || (srvconfig?.auditlogs.logs?.messagedelete && srvconfig?.auditlogs.logs?.messagedeletebulk && srvconfig?.auditlogs.logs?.messageupdate))
            && (srvconfig?.auditlogs.logs?.channel || (srvconfig?.auditlogs.logs?.channelcreate && srvconfig?.auditlogs.logs?.channeldelete && srvconfig?.auditlogs.logs?.channelupdate))
            && (srvconfig?.auditlogs.logs?.role || (srvconfig?.auditlogs.logs?.rolecreate && srvconfig?.auditlogs.logs?.roledelete && srvconfig?.auditlogs.logs?.roleupdate))
            && (srvconfig?.auditlogs.logs?.voice || (srvconfig?.auditlogs.logs?.voicejoin && srvconfig?.auditlogs.logs?.voiceleave && srvconfig?.auditlogs.logs?.voicemove && srvconfig?.auditlogs.logs?.voicedeafen && srvconfig?.auditlogs.logs?.voicemute))
          )) && (
            <Card>
              <DropdownRaw id="new-log" values={[
                { value: 'all', name: 'All Logs' },

                ...!(srvconfig?.auditlogs.logs?.member
                || (srvconfig?.auditlogs.logs?.memberjoin && srvconfig?.auditlogs.logs?.memberleave && srvconfig?.auditlogs.logs?.membernameupdate && srvconfig?.auditlogs.logs?.memberrolesupdate))
                  ? [
                    ...!(srvconfig?.auditlogs.logs?.memberjoin || srvconfig?.auditlogs.logs?.memberleave || srvconfig?.auditlogs.logs?.membernameupdate || srvconfig?.auditlogs.logs?.memberrolesupdate)
                      ? [{ value: 'member', name: 'All Member-Related Logs' }] : [],
                    ...!srvconfig?.auditlogs.logs?.memberjoin
                      ? [{ value: 'memberjoin', name: 'Member Joined' }] : [],
                    ...!srvconfig?.auditlogs.logs?.memberleave
                      ? [{ value: 'memberleave', name: 'Member Left' }] : [],
                    ...!srvconfig?.auditlogs.logs?.membernameupdate
                      ? [{ value: 'membernameupdate', name: 'Member Name Updated' }] : [],
                    ...!srvconfig?.auditlogs.logs?.memberrolesupdate
                      ? [{ value: 'memberrolesupdate', name: 'Member Roles Updated' }] : [],
                  ] : [],

                ...!(srvconfig?.auditlogs.logs?.message
                || (srvconfig?.auditlogs.logs?.messagedelete || srvconfig?.auditlogs.logs?.messagedeletebulk || srvconfig?.auditlogs.logs?.messageupdate))
                  ? [
                    ...!(srvconfig?.auditlogs.logs?.messagedelete || srvconfig?.auditlogs.logs?.messagedeletebulk || srvconfig?.auditlogs.logs?.messageupdate)
                      ? [{ value: 'message', name: 'All Message-Related Logs' }] : [],
                    ...!srvconfig?.auditlogs.logs?.messagedelete
                      ? [{ value: 'messagedelete', name: 'Message Deleted' }] : [],
                    ...!srvconfig?.auditlogs.logs?.messagedeletebulk
                      ? [{ value: 'messagedeletebulk', name: 'Messages Bulk-Deleted' }] : [],
                    ...!srvconfig?.auditlogs.logs?.messageupdate
                      ? [{ value: 'messageupdate', name: 'Message Edited' }] : [],
                  ] : [],

                ...!(srvconfig?.auditlogs.logs?.channel
                || (srvconfig?.auditlogs.logs?.channelcreate || srvconfig?.auditlogs.logs?.channeldelete || srvconfig?.auditlogs.logs?.channelupdate))
                  ? [
                    ...!(srvconfig?.auditlogs.logs?.channelcreate || srvconfig?.auditlogs.logs?.channeldelete || srvconfig?.auditlogs.logs?.channelupdate)
                      ? [{ value: 'channel', name: 'All Channel-Related Logs' }] : [],
                    ...!srvconfig?.auditlogs.logs?.channelcreate
                      ? [{ value: 'channelcreate', name: 'Channel Created' }] : [],
                    ...!srvconfig?.auditlogs.logs?.channeldelete
                      ? [{ value: 'channeldelete', name: 'Channel Deleted' }] : [],
                    ...!srvconfig?.auditlogs.logs?.channelupdate
                      ? [{ value: 'channelupdate', name: 'Channel Updated' }] : [],
                  ] : [],

                ...!(srvconfig?.auditlogs.logs?.role
                || (srvconfig?.auditlogs.logs?.rolecreate || srvconfig?.auditlogs.logs?.roledelete || srvconfig?.auditlogs.logs?.roleupdate))
                  ? [
                    ...!(srvconfig?.auditlogs.logs?.rolecreate || srvconfig?.auditlogs.logs?.roledelete || srvconfig?.auditlogs.logs?.roleupdate)
                      ? [{ value: 'role', name: 'All Role-Related Logs' }] : [],
                    ...!srvconfig?.auditlogs.logs?.rolecreate
                      ? [{ value: 'rolecreate', name: 'Role Created' }] : [],
                    ...!srvconfig?.auditlogs.logs?.roledelete
                      ? [{ value: 'roledelete', name: 'Role Deleted' }] : [],
                    ...!srvconfig?.auditlogs.logs?.roleupdate
                      ? [{ value: 'roleupdate', name: 'Role Updated' }] : [],
                  ] : [],

                ...!(srvconfig?.auditlogs.logs?.voice
                || (srvconfig?.auditlogs.logs?.voicejoin || srvconfig?.auditlogs.logs?.voiceleave || srvconfig?.auditlogs.logs?.voicemove || srvconfig?.auditlogs.logs?.voicedeafen || srvconfig?.auditlogs.logs?.voicemute))
                  ? [
                    ...!(srvconfig?.auditlogs.logs?.voicejoin || srvconfig?.auditlogs.logs?.voiceleave || srvconfig?.auditlogs.logs?.voicemove || srvconfig?.auditlogs.logs?.voicedeafen || srvconfig?.auditlogs.logs?.voicemute)
                      ? [{ value: 'voice', name: 'All Voice-Related Logs' }] : [],
                    ...!srvconfig?.auditlogs.logs?.voicejoin
                      ? [{ value: 'voicejoin', name: 'Joined Voice Channel' }] : [],
                    ...!srvconfig?.auditlogs.logs?.voiceleave
                      ? [{ value: 'voiceleave', name: 'Left Voice Channel' }] : [],
                    ...!srvconfig?.auditlogs.logs?.voicemove
                      ? [{ value: 'voicemove', name: 'Moved Voice Channels' }] : [],
                    ...!srvconfig?.auditlogs.logs?.voicedeafen
                      ? [{ value: 'voicedeafen', name: 'Voice Deafened' }] : [],
                    ...!srvconfig?.auditlogs.logs?.voicemute
                      ? [{ value: 'voicemute', name: 'Voice Muted' }] : [],
                  ] : [],
              ]} />
              <Dropdown id="new-log-channel" values={[
                { value: 'false', name: 'Default Channel' },
                ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ value: c.id, name: `# ${c.name}` })),
              ]}>
                The channel to associate this log to
              </Dropdown>
              <Button color="purple" onClick$={async () => {
                store.loading.push('auditlogs');
                const log = (document.getElementById('new-log') as HTMLSelectElement).value;
                const channel = (document.getElementById('new-log-channel') as HTMLSelectElement).value;
                srvconfig!.auditlogs.logs[log] = { channel };
                await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                store.loading = store.loading.filter(l => l != 'auditlogs');
              }}>
                Add Audit Log
              </Button>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Audit Logs',
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