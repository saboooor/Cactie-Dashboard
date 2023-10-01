import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { APIGuildChannel, APIGuild, APIRole, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import type { reactionroles, settings } from '@prisma/client/edge';
import { PrismaClient } from '@prisma/client/edge';
import Menu, { MenuCategory, MenuItem, MenuTitle } from '~/components/Menu';
import TextInput from '~/components/elements/TextInput';
import Checkbox from '~/components/elements/Checkbox';
import SelectInput, { RawSelectInput } from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';
import EmojiInput, { EmojiPicker } from '~/components/elements/EmojiInput';
import { Add, At, Close, CreateOutline, FileTrayFullOutline, FolderOutline, HappyOutline, InvertModeOutline, MailOpenOutline, NewspaperOutline, NotificationsOffOutline, Remove, Ban, EllipsisVertical, ChatboxOutline, Checkmark, ToggleOutline, IdCardOutline, Link, ExitOutline, EnterOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import LoadingIcon from '~/components/icons/LoadingIcon';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

interface guildData {
  guild: Guild;
  channels: AnyGuildChannel[];
  roles: APIRole[];
  srvconfig: settings & {
    joinmessage: any,
    leavemessage: any,
    tickets: any,
    reactions: any[],
    auditlogs: any,
  } | null;
  reactionroles: {
    raw: reactionroles[];
    channels: any[];
  };
}

type AnyGuildChannel = APIGuildChannel<ChannelType>;

async function fetchData(url: string, props: RequestEventBase, user?: boolean, accessToken?: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      authorization: `${user ? `Bearer ${accessToken}` : `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`}`,
    },
  }).catch((err: any) => {
    console.log(err);
  });
  if (!res) throw new Error(`Fetch failed for ${url}`);

  const data: RESTError | RESTRateLimit | any = await res.json();
  if ('retry_after' in data) {
    console.log(`${data.message}, retrying after ${data.retry_after * 1000}ms`);
    await sleep(data.retry_after * 1000);
    return await fetchData(url, props);
  }
  if ('code' in data) throw new Error(`${url} error ${data.code}`);

  return data;
}

export const getSQLDataFn = server$(async function(channels: AnyGuildChannel[], props?: RequestEventBase) {
  props = props ?? this;

  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get(`DATABASE_URL${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

  const srvconfigUnparsed = await prisma.settings.findUnique({
    where: {
      guildId: props.params.guildId,
    },
  });

  const srvconfig = srvconfigUnparsed ? {
    ...srvconfigUnparsed,
    joinmessage: JSON.parse(srvconfigUnparsed.joinmessage),
    leavemessage: JSON.parse(srvconfigUnparsed.leavemessage),
    tickets: JSON.parse(srvconfigUnparsed.tickets),
    reactions: JSON.parse(srvconfigUnparsed.reactions),
    auditlogs: JSON.parse(srvconfigUnparsed.auditlogs),
  } : null;

  const reactionroles = {
    raw: await prisma.reactionroles.findMany({ where: { guildId: props.params.guildId } }),
    channels: [] as any[],
  };

  for (const i in reactionroles.raw) {
    const emojiId = reactionroles.raw[i].emojiId.match(/(\d*)/)![0];
    if (emojiId != '') reactionroles.raw[i].emojiId = `https://cdn.discordapp.com/emojis/${emojiId}`;
    if (reactionroles.channels.find(c => c.id == reactionroles.raw[i].channelId)) continue;
    const channelInfo = {
      id: reactionroles.raw[i].channelId,
      name: channels.find(c => c.id == reactionroles.raw[i].channelId)?.name,
      messages: [] as any[],
    };
    const channelreactionroles = reactionroles.raw.filter(r => r.channelId == channelInfo.id);
    for (const i2 in channelreactionroles) {
      if (channelInfo.messages.includes(channelreactionroles[i2].messageId)) continue;
      channelInfo.messages.push(channelreactionroles[i2].messageId);
    }
    reactionroles.channels.push(channelInfo);
  }

  return { srvconfig, reactionroles };
});

export const getGuildDataFn = server$(async function(props?: RequestEventBase): Promise<guildData | Error> {
  props = props ?? this;
  const guildId = props.params.guildId;
  const [guild, channels, roles] = await Promise.all([
    fetchData(`https://discord.com/api/v10/guilds/${guildId}`, props),
    fetchData(`https://discord.com/api/v10/guilds/${guildId}/channels`, props),
    fetchData(`https://discord.com/api/v10/guilds/${guildId}/roles`, props),
  ]);

  const { srvconfig, reactionroles } = await getSQLDataFn(channels, props);
  if (srvconfig instanceof Error) return srvconfig;
  if (reactionroles instanceof Error) return reactionroles;

  return { guild, channels, roles, srvconfig, reactionroles };
});

export const useGetGuildData = routeLoader$(async (props) => await getGuildDataFn(props));

export const updateSettingFn = server$(async function(name: string, value: string | number | boolean | null | undefined) {
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });
  await prisma.settings.update({ where: { guildId: this.params.guildId }, data: { [name]: value } });
});

export const updateReactionRoleFn = server$(async function(props: reactionroles) {
  let emojiId = props.emojiId.match(/(\d*)/)![0];
  if (emojiId != '') {
    const res = await fetch(`https://discord.com/api/v10/guilds/${props.guildId}/emojis/${props.emojiId}`, {
      headers: {
        authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
      },
    }).catch(() => null);
    if (!res) return new Error('Fetching custom emoji failed');
    const emoji = await res.json();
    emojiId = `${emoji.name}:${emoji.id}`;
  }
  else {
    emojiId = props.emojiId;
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${props.channelId}/messages/${props.messageId}/reactions/${emojiId}/@me`, {
    method: 'PUT',
    headers: {
      authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => null);
  if (!res) return new Error('reaction failed');

  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

  await prisma.reactionroles.upsert({
    where: { messageId_emojiId: {
      messageId: props.messageId,
      emojiId: props.emojiId,
    } },
    update: props,
    create: props,
  });
});

export const deleteReactionRoleFn = server$(async function(props: { messageId: string, emojiId: string, channelId: string, guildId: string }) {
  let emojiId = props.emojiId.match(/(\d*)/)![0];
  if (emojiId != '') {
    const res = await fetch(`https://discord.com/api/v10/guilds/${props.guildId}/emojis/${props.emojiId}`, {
      headers: {
        authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
      },
    }).catch(() => null);
    if (!res) return new Error('Fetching custom emoji failed');
    const emoji = await res.json();
    emojiId = `${emoji.name}:${emoji.id}`;
  }
  else {
    emojiId = props.emojiId;
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${props.channelId}/messages/${props.messageId}/reactions/${emojiId}/@me`, {
    method: 'DELETE',
    headers: {
      authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => null);
  if (!res) return new Error('delete reaction failed');

  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

  await prisma.reactionroles.delete({
    where: { messageId_emojiId: {
      messageId: props.messageId,
      emojiId: props.emojiId,
    } },
  });
});

export default component$(() => {
  const guildData = useGetGuildData().value;

  const store = useStore({
    dev: undefined as boolean | undefined,
    modal: undefined as 'create' | 'edit' | undefined,
    guildData,
    loading: [] as string[],
    rrselected: [] as string[],
  });

  if (store.guildData instanceof Error) {
    return (
      <div class="flex flex-col gap-3 items-center justify-center h-full pt-24">
        <h1 class="text-4xl font-bold">Error</h1>
        <p class="text-xl">{(guildData as Error).message}</p>
        <Button onClick$={() => location.reload()} color="danger">
          Reload
        </Button>
      </div>
    );
  }

  const { guild, channels, roles, srvconfig, reactionroles } = store.guildData;

  useVisibleTask$(() => {
    store.dev = document.cookie.includes('branch=dev');
  });

  return (
    <section class="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 min-h-[calc(100lvh-80px)]">
      <Menu guild={guild} store={store} onSwitcherSwitch$={async () => {
        store.guildData = await getGuildDataFn();
      }}>
        <MenuCategory name="GENERAL SETTINGS">
          <MenuItem href="#joinmessage">
            <EnterOutline width="24" class="fill-current" /> Join Message
          </MenuItem>
          <MenuItem href="#leavemessage">
            <ExitOutline width="24" class="fill-current" /> Leave Message
          </MenuItem>
          <MenuItem href="#suggestionpoll">
            <MailOpenOutline width="24" class="fill-current" /> Suggestions & Polls
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="TICKET SYSTEM">
          <MenuItem href="#tickets">
            <ToggleOutline width="24" class="fill-current" /> Enabled
          </MenuItem>
          <MenuItem href="#tickets-type">
            <InvertModeOutline width="24" class="fill-current" /> Type
          </MenuItem>
          <MenuItem href="#tickets-name">
            <IdCardOutline width="24" class="fill-current" /> Name
          </MenuItem>
          <MenuItem href="#tickets-category">
            <FolderOutline width="24" class="fill-current" /> Category
          </MenuItem>
          <MenuItem href="#tickets-logchannel">
            <FileTrayFullOutline width="24" class="fill-current" /> Log Channel
          </MenuItem>
          <MenuItem href="#tickets-role">
            <At width="24" class="fill-current" /> Access Role
          </MenuItem>
          <MenuItem href="#tickets-mention">
            <At width="24" class="fill-current" /> Mention
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="MODERATION">
          <MenuItem href="#msgshortener">
            <CreateOutline width="24" class="fill-current" /> Message Shortener
          </MenuItem>
          <MenuItem href="#mutecmd">
            <NotificationsOffOutline width="24" class="fill-current" /> Mute Command
          </MenuItem>
          <MenuItem href="#disabledcmds">
            <Ban width="24" class="fill-current" /> Disabled Commands
          </MenuItem>
          <MenuItem href="#logchannel">
            <FileTrayFullOutline width="24" class="fill-current" /> Log Channel
          </MenuItem>
        </MenuCategory>
        <MenuItem href="#reactions">
          <ChatboxOutline width="24" class="fill-current" /> Reactions
        </MenuItem>
        <MenuItem href="#auditlogs">
          <NewspaperOutline width="24" class="fill-current" /> Audit Logs
        </MenuItem>
        <MenuItem href="#reactionroles">
          <HappyOutline width="24" class="fill-current" /> Reaction Roles
        </MenuItem>
      </Menu>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4 pt-22 sm:pt-28">
        <MenuTitle>GENERAL SETTINGS</MenuTitle>
        <div class="flex flex-wrap gap-4 py-10">
          <Card fit>
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
          <Card fit>
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
        <div class="flex mb-2">
          <span id="tickets" class="block h-32 -mt-32" />
          <Checkbox toggle id="tickets-enabled" checked={srvconfig?.tickets.enabled} onChange$={async (event: any) => {
            store.loading.push('tickets-enabled');
            srvconfig!.tickets.enabled = event.target.checked;
            await updateSettingFn('tickets', JSON.stringify(srvconfig!.tickets));
            store.loading = store.loading.filter(l => l != 'tickets-enabled');
          }}>
            <MenuTitle extraClass="flex-1">TICKET SYSTEM</MenuTitle>
          </Checkbox>
          <div class={{
            'transition-all': true,
            'opacity-0': !store.loading.includes('tickets-enabled'),
            'opacity-100': store.loading.includes('tickets-enabled'),
          }}>
            <LoadingIcon />
          </div>
        </div>
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
              <option value="false" selected={srvconfig?.tickets.role == 'false'} style={{ color: '#ffffff' }}>Only Administrators</option>
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
        <MenuTitle>MODERATION</MenuTitle>
        <div class="flex flex-wrap gap-4 py-10">
          <Card>
            <CardHeader id="msgshortener" loading={store.loading.includes('msgshortener')}>
              <CreateOutline width="32" class="fill-current" /> Message Shortener
            </CardHeader>
            <NumberInput input value={(store.guildData as guildData).srvconfig!.msgshortener} id="msgshortener-input" onChange$={async (event: any) => {
              store.loading.push('msgshortener');
              await updateSettingFn('msgshortener', parseInt(event.target.value));
              store.loading = store.loading.filter(l => l != 'msgshortener');
            }}
            onIncrement$={async () => {
              store.loading.push('msgshortener');
              (store.guildData as guildData).srvconfig!.msgshortener++;
              await updateSettingFn('msgshortener', (store.guildData as guildData).srvconfig!.msgshortener);
              store.loading = store.loading.filter(l => l != 'msgshortener');
            }}
            onDecrement$={async () => {
              store.loading.push('msgshortener');
              (store.guildData as guildData).srvconfig!.msgshortener--;
              await updateSettingFn('msgshortener', (store.guildData as guildData).srvconfig!.msgshortener);
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
          <Card>
            <CardHeader id="disabledcmds" loading={store.loading.includes('disabledcmds')}>
              <Ban width="32" class="fill-current" />Disabled Commands
            </CardHeader>
            <TextInput id="disabledcmds-input" value={srvconfig?.disabledcmds == 'false' ? '' : srvconfig?.disabledcmds} placeholder="Specify commands to disable, no spaces" onChange$={async (event: any) => {
              store.loading.push('disabledcmds');
              await updateSettingFn('disabledcmds', event.target.value);
              store.loading = store.loading.filter(l => l != 'disabledcmds');
            }}>
              Disable certain commands from Cactie separated by commas
            </TextInput>
          </Card>
          <Card>
            <CardHeader id="logchannel" loading={store.loading.includes('logchannel')}>
              <FileTrayFullOutline width="32" class="fill-current" /> Log Channel
            </CardHeader>
            <SelectInput id="logchannel-value" label="The channel where moderation logs will appear (this is separate from audit logs for now)" onChange$={async (event: any) => {
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
        </div>
        <div class="flex mb-2">
          <span id="reactions" class="block h-32 -mt-32" />
          <MenuTitle extraClass="flex-1">REACTIONS</MenuTitle>
          <div class={{
            'transition-all': true,
            'opacity-0': !store.loading.includes('reactions'),
            'opacity-100': store.loading.includes('reactions'),
          }}>
            <LoadingIcon />
          </div>
        </div>
        <p>
          The Reactions feature uses regex to detect messages and react to them. You can use this to make your own custom reactions. In order to create a regex expression based on your needs, either ask AI to make one for you (for example: "Create a regex pattern that matches 'cactie' and 'stupid' in any order" will give you a regex pattern that matches "cactie is stupid" or "stupid cactie" etc.) or use a regex generator online (for example: https://regexr.com/)
        </p>
        <div class="py-10 grid gap-4">
          {
            srvconfig?.reactions.map((reaction, i) =>
              <Card key={i}>
                <TextInput placeholder="Regex Pattern" value={reaction.regex} onChange$={async (event: any) => {
                  store.loading.push('reactions');
                  (store.guildData as guildData).srvconfig!.reactions[i].regex = event.target.value;
                  await updateSettingFn('reactions', JSON.stringify(srvconfig?.reactions));
                  store.loading = store.loading.filter(l => l != 'reactions');
                }} extraClass="font-mono" />
                <div class="flex">
                  <div class="flex flex-wrap gap-2 flex-1">
                    <Button small disabled={reaction.emojis.length < 2} onClick$={async () => {
                      store.loading.push('reactions');
                      (store.guildData as guildData).srvconfig!.reactions[i].emojis.pop();
                      await updateSettingFn('reactions', JSON.stringify(srvconfig?.reactions));
                      store.loading = store.loading.filter(l => l != 'reactions');
                    }}>
                      <Remove width="24" class="fill-current" />
                    </Button>
                    {(reaction.emojis as any[]).map((emoji, i2) => {
                      return <EmojiInput nolabel emoji={emoji} key={i2} id={`reaction-emoji-${i2}`} onChange$={async (event: any) => {
                        store.loading.push('reactions');
                        const reactions = JSON.parse(JSON.stringify(srvconfig?.reactions));
                        reactions[i].emojis[i2] = event.target.getAttribute('value');
                        await updateSettingFn('reactions', JSON.stringify(reactions));
                        store.loading = store.loading.filter(l => l != 'reactions');
                      }} />;
                    })}
                    <Button small onClick$={() => {
                      store.loading.push('reactions');
                      (store.guildData as guildData).srvconfig!.reactions[i].emojis.push('Select an Emoji');
                      store.loading = store.loading.filter(l => l != 'reactions');
                    }} disabled={srvconfig?.reactions[i].emojis.includes('Select an Emoji')}>
                      <Add width="24" class="fill-current" />
                    </Button>
                  </div>
                  <Close width="36" class="fill-red-400 cursor-pointer" onClick$={async () => {
                    store.loading.push('reactions');
                    (store.guildData as guildData).srvconfig!.reactions.splice(i, 1);
                    await updateSettingFn('reactions', JSON.stringify(srvconfig?.reactions));
                    store.loading = store.loading.filter(l => l != 'reactions');
                  }} />
                </div>
              </Card>,
            )
          }
          <Card>
            <CardHeader>
              <Add width="32" class="fill-current" /> Create
            </CardHeader>
            <div class="flex gap-2">
              <div class="flex-1">
                <TextInput nolabel placeholder="Regex Pattern" extraClass="font-mono" id="reaction-create-regex" />
              </div>
              <EmojiInput nolabel id="reaction-emoji-create" />
              <Checkmark width="36" class="text-green-400 cursor-pointer" onClick$={async () => {
                store.loading.push('reactions');

                srvconfig?.reactions.push({
                  regex: (document.getElementById('reaction-create-regex') as HTMLInputElement).value,
                  emojis: [(document.getElementById('reaction-emoji-create') as HTMLInputElement).getAttribute('value')],
                });
                await updateSettingFn('reactions', JSON.stringify(srvconfig?.reactions));
                store.loading = store.loading.filter(l => l != 'reactions');
              }} />
            </div>
          </Card>
        </div>
        <div class="flex">
          <span id="auditlogs" class="block h-32 -mt-32" />
          <MenuTitle extraClass="flex-1">AUDIT LOGS</MenuTitle>
          <div class={{
            'transition-all': true,
            'opacity-0': !store.loading.includes('auditlogs'),
            'opacity-100': store.loading.includes('auditlogs'),
          }}>
            <LoadingIcon />
          </div>
        </div>
        <div class="py-10 flex flex-col gap-4">
          <div class="flex flex-col md:flex-row gap-4">
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
                            <option value="memberleave">Member Name Updated</option>
                          )}
                          {!srvconfig?.auditlogs.logs?.memberrolesupdate && (
                            <option value="memberleave">Member Roles Updated</option>
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
                  (store.guildData as guildData).srvconfig!.auditlogs.logs[log] = { channel };
                  await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                  store.loading = store.loading.filter(l => l != 'auditlogs');
                }}>
                  Add Audit Log
                </Button>
              </Card>
            )}
          </div>
          <div class="flex flex-wrap justify-center gap-4">
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
                        delete (store.guildData as guildData).srvconfig!.auditlogs.logs[log];
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
          </div>
        </div>
        <div class="flex">
          <span id="reactionroles" class="block h-32 -mt-32" />
          <MenuTitle extraClass="flex-1">REACTION ROLES</MenuTitle>
          <div class="flex items-center gap-3">
            <div class={{
              'transition-all': true,
              'opacity-0': !store.loading.includes('reactionroles'),
              'opacity-100': store.loading.includes('reactionroles'),
            }}>
              <LoadingIcon />
            </div>
            <Add width="36" class="text-green-400 cursor-pointer" onClick$={async () => {
              store.modal = 'create';
            }} />
          </div>
        </div>
        <div class="flex flex-col gap-4 py-10">
          {
            reactionroles.channels.map(channel => (
              <div key={channel.id}>
                <div class="flex items-start flex-1 mb-4">
                  <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                    # {channel?.name ?? 'Channel Not Found.'}
                  </h1>
                  <Add width="36" class="text-green-400 cursor-pointer" onClick$={() => {
                    const channelselect = document.getElementById('rrcreatechannel') as HTMLSelectElement;
                    channelselect.value = channel.id;
                    store.modal = 'create';
                  }} />
                </div>
                <div class='flex flex-col gap-4'>
                  {
                    channel.messages.map((messageId: string) => (
                      <Card key={messageId}>
                        <div class="flex items-center">
                          <a target='_blank' href={`https://discord.com/channels/${guild.id}/${channel.id}/${messageId}`} class="flex flex-1 gap-3 justify-start font-bold text-gray-100 text-2xl">
                            <Link width="30" />
                            <span class="flex flex-col">
                              <span>
                                Go to message
                              </span>
                              <span class="text-xs font-normal text-gray-200">
                                {messageId}
                              </span>
                            </span>
                          </a>
                          <Add width="36" class="text-green-400 cursor-pointer" onClick$={() => {
                            const channelselect = document.getElementById('rrcreatechannel') as HTMLSelectElement;
                            channelselect.value = channel.id;
                            const messageinput = document.getElementById('rrcreatemessage') as HTMLInputElement;
                            messageinput.value = messageId;
                            store.modal = 'create';
                          }} />
                        </div>
                        <div class='flex flex-wrap gap-4'>
                          {
                            reactionroles.raw.filter(r => r.messageId == messageId).map(rr => {
                              const role = roles.find(r => r.id == rr.roleId);

                              return <Card darker key={rr.roleId} row fit>
                                <div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                  {rr.emojiId.startsWith('https') ? <img src={rr.emojiId} class="w-12 h-auto" width={48} height={48}/> : <p class="text-4xl py-1">{rr.emojiId}</p>}
                                </div>
                                <div class="flex-1">
                                  <h1 class="font-bold text-gray-100 text-md" style={{ color: '#' + (role?.color ? role.color.toString(16) : 'ffffff') }}>@ {role?.name ?? 'Role Not Found.'}</h1>
                                  <p class="flex">
                                    {rr.type == 'switch' ? 'Add by reacting / Remove by unreacting' : 'Add / Remove by reacting'}<br />
                                    {rr.silent == 'true' && 'Keep quiet when reacting / unreacting'}
                                  </p>
                                </div>
                                <div class="flex flex-col justify-center gap-4">
                                  <Checkbox nolabel id={`select-${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`} checked={store.rrselected.includes(`${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`)} onChange$={async (event: any) => {
                                    if (event.target.checked) store.rrselected.push(`${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`);
                                    else store.rrselected = store.rrselected.filter(s => s != `${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`);
                                  }} />
                                  <EllipsisVertical width="24" class="fill-gray-400 cursor-pointer flex" onClick$={() => {
                                    const channelselect = document.getElementById('rrcreatechannel') as HTMLSelectElement;
                                    const messageinput = document.getElementById('rrcreatemessage') as HTMLInputElement;
                                    const roleinput = document.getElementById('rrcreaterole') as HTMLSelectElement;
                                    const emojiinput = document.getElementById('rrcreateemoji') as HTMLButtonElement;
                                    const typeinput = document.getElementById('rrcreateswitch') as HTMLSelectElement;
                                    const silentinput = document.getElementById('rrcreatesilent') as HTMLInputElement;
                                    channelselect.value = channel.id;
                                    messageinput.value = messageId;
                                    roleinput.value = role!.id;
                                    emojiinput.setAttribute('value', rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId);
                                    typeinput.value = rr.type;
                                    silentinput.checked = rr.silent == 'true';
                                    store.modal = 'edit';
                                  }} />
                                </div>
                              </Card>;
                            })
                          }
                        </div>
                      </Card>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div class={`relative z-10 ${store.modal ? '' : 'pointer-events-none'}`}>
        <div class={`fixed inset-0 z-10 ${store.modal ? 'bg-gray-900/30' : 'opacity-0'} transition overflow-y-auto`}>
          <div class="flex min-h-full max-h-full items-start justify-center p-4 pt-24 text-center sm:items-center">
            <div class="rounded-lg bg-gray-800 border border-gray-700 text-left transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
              <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                {store.modal == 'edit' ? 'Edit' : 'Create'} Reaction Role
              </h1>
              <div class="flex flex-col my-4 gap-4">
                <div class={{
                  'hidden': store.modal != 'create',
                }}>
                  <EmojiInput id="rrcreateemoji">
                    The emoji to react with
                  </EmojiInput>
                </div>
                <SelectInput id="rrcreaterole" label="The role to be given">
                  {roles.map(r =>
                    <option value={r.id} key={r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
                  )}
                </SelectInput>
                <SelectInput id="rrcreatechannel" label="Select the channel the reaction role will be in">
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
                <div class={{
                  'hidden': store.modal != 'create',
                }}>
                  <TextInput id="rrcreatemessage" placeholder="1105427534889353317">
                    The Id of the message you want to create the reaction role in
                  </TextInput>
                </div>
                <SelectInput id="rrcreateswitch" label="Reaction role behavior">
                  <option value="switch">Add by reacting / Remove by unreacting</option>
                  <option value="toggle">Add / Remove by reacting</option>
                </SelectInput>
                <Checkbox toggle id="rrcreatesilent">
                  Silent
                </Checkbox>
              </div>
              <div class="flex flex-row-reverse gap-3">
                <Button color="primary" extraClass="flex-1 sm:flex-initial" onClick$={async () => {
                  store.loading.push('rrcreate');
                  const emojiId = document.getElementById('rrcreateemoji')!.getAttribute('value')!;
                  const roleId = document.getElementById('rrcreaterole')!as HTMLSelectElement;
                  const channelId = document.getElementById('rrcreatechannel')! as HTMLSelectElement;
                  const messageId = document.getElementById('rrcreatemessage')! as HTMLInputElement;
                  const type = document.getElementById('rrcreateswitch')! as HTMLSelectElement;
                  const silent = document.getElementById('rrcreatesilent')! as HTMLInputElement;

                  await updateReactionRoleFn({
                    guildId: guild.id,
                    emojiId,
                    roleId: roleId.value,
                    channelId: channelId.value,
                    messageId: messageId.value,
                    type: type.value,
                    silent: silent.checked ? 'true' : 'false',
                  });

                  store.guildData = {
                    ...store.guildData,
                    ...(await getSQLDataFn(channels)),
                  };
                  store.loading = store.loading.filter(l => l != 'rrcreate');
                  store.modal = undefined;
                }}>
                  {store.modal == 'edit' ? 'Edit' : 'Create'}
                  <div class={{
                    'transition-all': true,
                    '-ml-10 opacity-0': !store.loading.includes('rrcreate'),
                    '-ml-1 opacity-100': store.loading.includes('rrcreate'),
                  }}>
                    <LoadingIcon />
                  </div>
                </Button>
                <Button extraClass="flex-1 sm:flex-initial" onClick$={() => store.modal = undefined}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        !!store.rrselected.length &&
        <div id="rrselected" class="fixed flex flex-col bottom-4 right-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md p-6" style="cursor: auto;">
          <p class="text-gray-200 text-lg mb-5 max-w-[17rem]">
            {store.rrselected.length} Reaction Roles Selected
          </p>
          <div class="flex items-center gap-2 justify-evenly">
            <Button onClick$={async () => {
              store.rrselected = [];
            }}>
              Cancel
            </Button>
            <Button color="danger" onClick$={async () => {
              store.loading.push('rrdelete');
              for (const rr of store.rrselected) {
                const emojiId = rr.split('-')[0];
                const messageId = rr.split('-')[1];
                const channelId = reactionroles.channels.find(c => c.messages.includes(messageId))?.id as string;
                const guildId = guild.id;
                await deleteReactionRoleFn({ emojiId, messageId, channelId, guildId });
              }
              store.rrselected = [];
              store.guildData = {
                ...store.guildData,
                ...(await getSQLDataFn(channels)),
              };
              store.loading = store.loading.filter(l => l != 'rrdelete');
            }}>
              <div class={{
                'transition-all': true,
                '-ml-10 opacity-0': !store.loading.includes('rrdelete'),
                '-ml-1 opacity-100': store.loading.includes('rrdelete'),
              }}>
                <LoadingIcon />
              </div>
              Delete
            </Button>
          </div>
        </div>
      }

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
  title: 'Dashboard',
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