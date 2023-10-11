import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import SelectInput, { RawSelectInput } from '~/components/elements/SelectInput';
import { Button } from '~/components/elements/Button';
import { Close, ChatboxOutline, NewspaperOutline, FileTrayFullOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import LoadingIcon from '~/components/icons/LoadingIcon';

import { getGuildFn, getSrvConfigFn, updateSettingFn } from '../index@required';
import { ChannelType } from 'discord-api-types/v10';
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
  const { guild, channels } = useGetData().value;

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
          <NewspaperOutline width="32" />
          Audit Logs
          <div class={{
            'transition-all': true,
            'opacity-0 -ml-12': !store.loading.includes('auditlogs'),
            'opacity-100 -ml-2': store.loading.includes('auditlogs'),
          }}>
            <LoadingIcon />
          </div>
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="py-10 flex flex-col gap-4">
        <Card>
          <CardHeader id="logchannel" loading={store.loading.includes('logchannel')}>
            <FileTrayFullOutline width="32" class="fill-current" /> General Log Channel
          </CardHeader>
          <SelectInput id="logchannel-value" label="The channel where general logs like moderation and tickets will appear (this is separate from the main audit logs for now)" onChange$={async (event: any) => {
            store.loading.push('logchannel');
            await updateSettingFn('logchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'logchannel');
          }}>
            <option value="false" selected={srvconfig?.logchannel == 'false'}>No logs</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.logchannel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
        </Card>
        <Card>
          <CardHeader>
            <ChatboxOutline width="32" class="fill-current" /> Default Channel
          </CardHeader>
          <SelectInput id="auditlogs-channel" label="This is where logs will be sent if there is no specific channel set on them" onChange$={async (event: any) => {
            store.loading.push('auditlogs');
            srvconfig!.auditlogs.channel = event.target.value;
            await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
            store.loading = store.loading.filter(l => l != 'auditlogs');
          }}>
            <option value="false" selected={srvconfig?.auditlogs.channel == 'false'}>No channel specified.</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.auditlogs.channel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
        </Card>
        <div class="flex flex-wrap gap-4">
          {
            Object.keys(srvconfig?.auditlogs.logs).map((log, i) => {
              return (
                <Card key={i}>
                  <div class="flex items-start flex-1">
                    <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                      {log}
                    </h1>
                    <Close width="36" class="fill-red-400 cursor-pointer" onClick$={async () => {
                      store.loading.push('auditlogs');
                      delete srvconfig!.auditlogs.logs[log];
                      await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                      store.loading = store.loading.filter(l => l != 'auditlogs');
                    }} />
                  </div>
                  <RawSelectInput id={`auditlogs-logs-${log}.channel`} name={`auditlogs.logs.${log}.channel`} onChange$={async (event: any) => {
                    store.loading.push('auditlogs');
                    srvconfig!.auditlogs.logs[log].channel = event.target.value;
                    await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                    store.loading = store.loading.filter(l => l != 'auditlogs');
                  }}>
                    {srvconfig?.auditlogs.channel != 'false' &&
                      <option value="false" selected={srvconfig?.auditlogs.logs[log].channel == 'false'}>Default Channel</option>
                    }
                    {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                      <option value={c.id} key={c.id} selected={srvconfig?.auditlogs.logs[log].channel == c.id}>{`# ${c.name}`}</option>,
                    )}
                  </RawSelectInput>
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
            <Card squish>
              <RawSelectInput id="new-log">
                {!srvconfig?.auditlogs.logs?.all && (
                  <>
                    {(!srvconfig?.auditlogs.logs?.member && !srvconfig?.auditlogs.logs?.memberjoin && !srvconfig?.auditlogs.logs?.memberleave && !srvconfig?.auditlogs.logs?.membernameupdate && !srvconfig?.auditlogs.logs?.memberrolesupdate
                  && !srvconfig?.auditlogs.logs?.message && !srvconfig?.auditlogs.logs?.messagedelete && !srvconfig?.auditlogs.logs?.messagedeletebulk && !srvconfig?.auditlogs.logs?.messageupdate
                  && !srvconfig?.auditlogs.logs?.channel && !srvconfig?.auditlogs.logs?.channelcreate && !srvconfig?.auditlogs.logs?.channeldelete && !srvconfig?.auditlogs.logs?.channelupdate
                  && !srvconfig?.auditlogs.logs?.role && !srvconfig?.auditlogs.logs?.rolereate && !srvconfig?.auditlogs.logs?.roledelete && !srvconfig?.auditlogs.logs?.roleupdate
                  && !srvconfig?.auditlogs.logs?.voice && !srvconfig?.auditlogs.logs?.voicejoin && !srvconfig?.auditlogs.logs?.voiceleave && !srvconfig?.auditlogs.logs?.voicemove && !srvconfig?.auditlogs.logs?.voicedeafen && !srvconfig?.auditlogs.logs?.voicemute
                    ) && (
                      <option value="all">All Logs</option>
                    )}
                    {!srvconfig?.auditlogs.logs?.member && (
                      <>
                        {(!srvconfig?.auditlogs.logs?.memberjoin && !srvconfig?.auditlogs.logs?.memberleave && !srvconfig?.auditlogs.logs?.membernameupdate && !srvconfig?.auditlogs.logs?.memberrolesupdate) && (
                          <option value="member">All Member-Related Logs</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.memberjoin && (
                          <option value="memberjoin">Member Joined</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.memberleave && (
                          <option value="memberleave">Member Left</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.membernameupdate && (
                          <option value="membernameupdate">Member Name Updated</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.memberrolesupdate && (
                          <option value="memberrolesupdate">Member Roles Updated</option>
                        )}
                      </>
                    )}
                    {!srvconfig?.auditlogs.logs?.message && (
                      <>
                        {(!srvconfig?.auditlogs.logs?.messagedelete && !srvconfig?.auditlogs.logs?.messagedeletebulk && !srvconfig?.auditlogs.logs?.messageupdate) && (
                          <option value="message">All Message-Related Logs</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.messagedelete && (
                          <option value="messagedelete">Message Deleted</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.messagedeletebulk && (
                          <option value="messagedeletebulk">Messages Bulk-Deleted</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.messageupdate && (
                          <option value="messageupdate">Message Edited</option>
                        )}
                      </>
                    )}
                    {!srvconfig?.auditlogs.logs?.channel && (
                      <>
                        {(!srvconfig?.auditlogs.logs?.channelcreate && !srvconfig?.auditlogs.logs?.channeldelete && !srvconfig?.auditlogs.logs?.channelupdate) && (
                          <option value="channel">All Channel-Related Logs</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.channelcreate && (
                          <option value="channelcreate">Channel Created</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.channeldelete && (
                          <option value="channeldelete">Channel Deleted</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.channelupdate && (
                          <option value="channelupdate">Channel Updated</option>
                        )}
                      </>
                    )}
                    {!srvconfig?.auditlogs.logs?.role && (
                      <>
                        {(!srvconfig?.auditlogs.logs?.rolecreate && !srvconfig?.auditlogs.logs?.roledelete && !srvconfig?.auditlogs.logs?.roleupdate) && (
                          <option value="role">All Role-Related Logs</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.rolecreate && (
                          <option value="rolecreate">Role Created</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.roledelete && (
                          <option value="roledelete">Role Deleted</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.roleupdate && (
                          <option value="roleupdate">Role Updated</option>
                        )}
                      </>
                    )}
                    {!srvconfig?.auditlogs.logs?.voice && (
                      <>
                        {(!srvconfig?.auditlogs.logs?.voicejoin && !srvconfig?.auditlogs.logs?.voiceleave && !srvconfig?.auditlogs.logs?.voicemove && !srvconfig?.auditlogs.logs?.voicedeafen && !srvconfig?.auditlogs.logs?.voicemute) && (
                          <option value="voice">All Voice-Related Logs</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.voicejoin && (
                          <option value="voicejoin">Joined Voice Channel</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.voiceleave && (
                          <option value="voiceleave">Left Voice Channel</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.voicemove && (
                          <option value="voicemove">Moved Voice Channels</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.voicedeafen && (
                          <option value="voicedeafen">Voice Deafened</option>
                        )}
                        {!srvconfig?.auditlogs.logs?.voicemute && (
                          <option value="voicemute">Voice Muted</option>
                        )}
                      </>
                    )}
                  </>
                )}
              </RawSelectInput>
              <RawSelectInput id="new-log-channel" label="The channel to associate this log to">
                {srvconfig?.auditlogs.channel != 'false' &&
                  <option value="false" selected>Default Channel</option>
                }
                {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                  <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                )}
              </RawSelectInput>
              <Button color="primary" onClick$={async () => {
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