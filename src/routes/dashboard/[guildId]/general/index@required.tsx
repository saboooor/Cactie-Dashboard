import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import TextInput from '~/components/elements/TextInput';
import Checkbox from '~/components/elements/Checkbox';
import SelectInput from '~/components/elements/SelectInput';
import { MailOpenOutline, ExitOutline, EnterOutline, SettingsOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import { ChannelType } from 'discord-api-types/v10';

import { getGuildFn, getSrvConfigFn, updateSettingFn } from '../index@required';
import MenuBar from '~/components/MenuBar';
export const useGetGuild = routeLoader$(async (props) => await getGuildFn(props));
export const useGetSrvConfig = routeLoader$(async (props) => await getSrvConfigFn(props));

export default component$(() => {
  const { guild, channels } = useGetGuild().value;
  const srvconfig = useGetSrvConfig().value;

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
        <h2 class="text-xl text-gray-300 font-semibold fill-current flex items-center gap-3">
          <SettingsOutline width="32" /> General
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="flex flex-wrap gap-4 py-10">
        <Card extraClass={{ 'min-w-fit': true }}>
          <CardHeader id="joinmessage" loading={store.loading.includes('joinmessage')}>
            <EnterOutline width="32" class="fill-current" /> Join Message
          </CardHeader>
          <TextInput big id="joinmessage-message" value={srvconfig?.joinmessage.message} placeholder="The content of the message sent when someone joins" onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.message = event.target.value;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }}>
            The message when someone joins the server
          </TextInput>
          <p>
            Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
          </p>
          <Checkbox toggle id="joinmessage-silent" checked={srvconfig?.joinmessage.silent} onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.silent = event.target.checked;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }}>
            Silent
          </Checkbox>
          <SelectInput id="joinmessage-channel" label="Channel to send the message in" onChange$={async (event: any) => {
            store.loading.push('joinmessage');
            srvconfig!.joinmessage.channel = event.target.value;
            await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
            store.loading = store.loading.filter(l => l != 'joinmessage');
          }}>
            <option value="false" selected={srvconfig?.joinmessage.channel == 'false'}>System Channel</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.joinmessage.channel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
        </Card>
        <Card extraClass={{ 'min-w-fit': true }}>
          <CardHeader id="leavemessage" loading={store.loading.includes('leavemessage')}>
            <ExitOutline width="32" class="fill-current" /> Leave Message
          </CardHeader>
          <TextInput big id="leavemessage-message" value={srvconfig?.leavemessage.message} placeholder="The content of the message sent when someone leaves" onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.message = event.target.value;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }}>
            The message when someone leaves the server
          </TextInput>
          <p>
            Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
          </p>
          <Checkbox toggle id="leavemessage-silent" checked={srvconfig?.leavemessage.silent} onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.silent = event.target.checked;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }}>
            Silent
          </Checkbox>
          <SelectInput id="leavemessage-channel" label="Channel to send the message in" onChange$={async (event: any) => {
            store.loading.push('leavemessage');
            srvconfig!.leavemessage.channel = event.target.value;
            await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
            store.loading = store.loading.filter(l => l != 'leavemessage');
          }}>
            <option value="false" selected={srvconfig?.leavemessage.channel == 'false'}>System Channel</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.leavemessage.channel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
        </Card>
        <Card fit extraClass={{ 'gap-5': true }}>
          <CardHeader id="suggestionpoll" loading={store.loading.includes('suggestionpoll')}>
            <MailOpenOutline width="32" class="fill-current" /> Suggestions & Polls
          </CardHeader>
          <SelectInput id="suggestionchannel" label="Channel to make suggestions in" onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('suggestionchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }}>
            <option value="false" selected={srvconfig?.suggestionchannel == 'false'}>Same channel as user</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.suggestionchannel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
          <Checkbox toggle id="suggestthreads" checked={srvconfig?.suggestthreads == 'true'} onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('suggestthreads', event.target.checked ? 'true' : 'false');
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }}>
            Create threads associated to suggestions for discussion
          </Checkbox>
          <SelectInput id="pollchannel" label="Channel to make polls in" onChange$={async (event: any) => {
            store.loading.push('suggestionpoll');
            await updateSettingFn('pollchannel', event.target.value);
            store.loading = store.loading.filter(l => l != 'suggestionpoll');
          }}>
            <option value="false" selected={srvconfig?.pollchannel == 'false'}>Same channel as user</option>
            {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
              <option value={c.id} key={c.id} selected={srvconfig?.pollchannel == c.id}>{`# ${c.name}`}</option>,
            )}
          </SelectInput>
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