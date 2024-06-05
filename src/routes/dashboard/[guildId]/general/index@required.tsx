import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';

import { MailOpenOutline, ExitOutline, EnterOutline, SettingsOutline, MicOutline } from 'qwik-ionicons';
import { Card, Dropdown, Header, TextArea, Toggle } from '@luminescent/ui';
import { ChannelType } from 'discord-api-types/v10';

import { getGuild, getSrvConfig, updateSettingFn } from '../index@required';
import MenuBar from '~/components/MenuBar';
export const useGetGuild = routeLoader$(async (props) => await getGuild(props));
export const useGetSrvConfig = routeLoader$(async (props) => await getSrvConfig(props));

export default component$(() => {
  const { guild, channels } = useGetGuild().value;
  const srvconfig = useGetSrvConfig().value;

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
        <div class="bg-red-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <SettingsOutline width="32" /> General
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="grid grid-cols-2 gap-4 pt-10">
        <Card>
          <Header id="joinmessage" loading={store.loading.includes('joinmessage')}>
            <EnterOutline width="32" class="fill-current" /> Join Message
          </Header>
          <TextArea id="joinmessage-message" value={srvconfig?.joinmessage.message} placeholder="The content of the message sent when someone joins" onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.message = event.target.value;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }}>
            The message when someone joins the server
          </TextArea>
          <p>
            Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
          </p>
          <Toggle onColor='red' label="Silent" id="joinmessage-silent" checked={srvconfig?.joinmessage.silent} onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.silent = event.target.checked;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }}/>
          <Dropdown class={{ 'w-full': true }} id="joinmessage-channel" onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.channel = event.target.value;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }} values={[
            { name: 'System Channel', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ name: `# ${c.name}`, value: c.id })),
          ]} value={srvconfig?.leavemessage.channel}>
            Channel to send the message in
          </Dropdown>
        </Card>
        <Card>
          <Header id="leavemessage" loading={store.loading.includes('leavemessage')}>
            <ExitOutline width="32" class="fill-current" /> Leave Message
          </Header>
          <TextArea id="leavemessage-message" value={srvconfig?.leavemessage.message} placeholder="The content of the message sent when someone leaves" onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.message = event.target.value;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }}>
            The message when someone leaves the server
          </TextArea>
          <p>
            Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
          </p>
          <Toggle onColor='red' label="Silent" id="leavemessage-silent" checked={srvconfig?.leavemessage.silent} onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.silent = event.target.checked;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }}/>
          <Dropdown class={{ 'w-full': true }} id="leavemessage-channel" onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.channel = event.target.value;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }} values={[
            { name: 'System Channel', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ name: `# ${c.name}`, value: c.id })),
          ]} value={srvconfig?.leavemessage.channel}>
            Channel to send the message in
          </Dropdown>
        </Card>
        <Card>
          <Header id="suggestionpoll" loading={store.loading.includes('suggestionpoll')}>
            <MailOpenOutline width="32" class="fill-current" /> Suggestions & Polls
          </Header>
          <Dropdown class={{ 'w-full': true }} id="suggestionchannel" onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('suggestionchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }} values={[
            { name: 'Same channel as user', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ name: `# ${c.name}`, value: c.id })),
          ]} value={srvconfig?.suggestionchannel}>
            Channel to make suggestions in
          </Dropdown>
          <Toggle onColor='red' label="Create threads associated to suggestions for discussion" id="suggestthreads" checked={srvconfig?.suggestthreads == 'true'} onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('suggestthreads', event.target.checked ? 'true' : 'false');
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }}/>
          <Dropdown class={{ 'w-full': true }} id="pollchannel" onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('pollchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }} values={[
            { name: 'Same channel as user', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ name: `# ${c.name}`, value: c.id })),
          ]} value={srvconfig?.pollchannel}>
            Channel to make polls in
          </Dropdown>
        </Card>
        <Card>
          <Header id="voicechats" loading={store.loading.includes('voicechats')}>
            <MicOutline width="32" class="fill-current" /> Custom Voice Chats
          </Header>
          <p>
            To disable custom voice chats, you can disable the /voicechat command in your server settings.
          </p>
          <Dropdown class={{ 'w-full': true }} id="voicechatscategory" onChange$={async (event: any) => {
            store.loading.push('voicechats');
            srvconfig!.voicechats.category = event.target.value;
            await updateSettingFn('voicechats', JSON.stringify(srvconfig!.voicechats));
            store.loading = store.loading.filter(l => l != 'voicechats');
          }} values={[
            { name: 'No Category', value: 'false' },
            ...channels.filter(c => c.type == ChannelType.GuildCategory).map(c => ({ name: `> ${c.name}`, value: c.id })),
          ]} value={srvconfig?.voicechats.category}>
            Category to make voice chats in
          </Dropdown>
          <Dropdown class={{ 'w-full': true }} id="voicechatstype" onChange$={async (event: any) => {
            store.loading.push('voicechats');
            srvconfig!.voicechats.type = event.target.value;
            await updateSettingFn('voicechats', JSON.stringify(srvconfig!.voicechats));
            store.loading = store.loading.filter(l => l != 'voicechats');
          }} values={[
            { name: 'Private', value: 'private' },
            { name: 'Public', value: 'public' },
          ]} value={srvconfig?.voicechats.type}>
            Make voice chats public or private
          </Dropdown>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - General',
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