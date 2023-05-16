import { component$, $, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import type { APIGuildChannel, APIGuild, APIRole, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import type { reactionroles, settings } from '@prisma/client/edge';
import { PrismaClient } from '@prisma/client/edge';
import Menu, { MenuCategory, MenuItem, MenuTitle } from '~/components/Menu';
import TextInput from '~/components/elements/TextInput';
import Toggle from '~/components/elements/Toggle';
import SelectInput, { RawSelectInput } from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';
import { Add, Alert, At, CheckboxOutline, Close, CreateOutline, FileTrayFullOutline, FolderOutline, HappyOutline, InvertModeOutline, MailOpenOutline, NewspaperOutline, NotificationsOffOutline, Remove, SendOutline, SpeedometerOutline, Ban } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const getGuildFn = server$(async function(props: RequestEventBase): Promise<Guild | Error> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${props.params.guildId}`, {
    headers: {
      authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => null);
  if (!res) return new Error('Guild fetch failed');
  const guild: RESTError | RESTRateLimit | Guild = await res.json();
  if ('retry_after' in guild) {
    console.log(`${guild.message}, retrying after ${guild.retry_after * 1000}ms`);
    await sleep(guild.retry_after * 1000);
    return await getGuildFn(props);
  }
  if ('code' in guild) return new Error(`Guild error ${guild.code}`);
  return guild;
});

type AnyGuildChannel = APIGuildChannel<ChannelType>;
export const getGuildChannelsFn = server$(async function(props: RequestEventBase): Promise<AnyGuildChannel[] | Error> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${props.params.guildId}/channels`, {
    headers: {
      authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => null);
  if (!res) return new Error('Guild Channel fetch failed');
  const channels: RESTError | RESTRateLimit | AnyGuildChannel[] = await res.json();
  if ('retry_after' in channels) {
    console.log(`${channels.message}, retrying after ${channels.retry_after * 1000}ms`);
    await sleep(channels.retry_after * 1000);
    return await getGuildChannelsFn(props);
  }
  if ('code' in channels) return new Error(`Guild Channels error ${channels.code}`);
  channels.sort((a, b) => a.position - b.position);
  return channels;
});

export const getGuildRolesFn = server$(async function(props: RequestEventBase): Promise<APIRole[] | Error> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${props.params.guildId}/roles`, {
    headers: {
      authorization: `Bot ${props.env.get(`BOT_TOKEN${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
    },
  }).catch(() => null);
  if (!res) return new Error('Guild roles fetch failed');
  const roles: RESTError | RESTRateLimit | APIRole[] = await res.json();
  if ('retry_after' in roles) {
    console.log(`${roles.message}, retrying after ${roles.retry_after * 1000}ms`);
    await sleep(roles.retry_after * 1000);
    return await getGuildRolesFn(props);
  }
  if ('code' in roles) return new Error(`Guild Roles error ${roles.code}`);
  roles.sort((a, b) => a.position - b.position);
  roles.reverse();
  return roles;
});

declare interface guildData {
  guild: Guild;
  channels: AnyGuildChannel[];
  roles: APIRole[];
  srvconfig: settings & {
    joinmessage: any,
    leavemessage: any,
    auditlogs: any,
  } | null;
  reactionroles: {
    raw: reactionroles[];
    channels: any[];
  };
}

export const getGuildDataFn = server$(async function(props?: RequestEventBase): Promise<guildData | Error> {
  props = props ?? this;

  const guild = await getGuildFn(props);
  if (guild instanceof Error) return guild;

  const channels = await getGuildChannelsFn(props);
  if (channels instanceof Error) return channels;

  const roles = await getGuildRolesFn(props);
  if (roles instanceof Error) return roles;

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
  return { guild, channels, roles, srvconfig, reactionroles };
});

export const useGetGuildData = routeLoader$(async (props) => await getGuildDataFn(props));

export const updateSettingFn = server$(async function(name: string, value: string | number | boolean | null | undefined) {
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });
  const res = await prisma.settings.update({ where: { guildId: this.params.guildId }, data: { [name]: value } });
  return res;
});

export default component$(() => {
  const guildData = useGetGuildData().value;

  const store = useStore({
    dev: undefined as boolean | undefined,
    modal: false,
    guildData,
    loading: [] as string[],
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
          <MenuItem href="#prefix">
            <Alert width="24" class="fill-current" /> Prefix
          </MenuItem>
          <MenuItem href="#suggestions">
            <MailOpenOutline width="24" class="fill-current" /> Suggestions
          </MenuItem>
          <MenuItem href="#polls">
            <CheckboxOutline width="24" class="fill-current" /> Polls
          </MenuItem>
          <MenuItem href="#joinmessage">
            <Add width="24" class="fill-current" /> Join Message
          </MenuItem>
          <MenuItem href="#leavemessage">
            <Remove width="24" class="fill-current" /> Leave Message
          </MenuItem>
          <MenuItem href="#maxppsize">
            <SpeedometerOutline width="24" class="fill-current" /> Max PP Size
          </MenuItem>
          <MenuItem href="#reactions">
            <HappyOutline width="24" class="fill-current" /> Reactions
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="TICKET SYSTEM">
          <MenuItem href="#tickets">
            <InvertModeOutline width="24" class="fill-current" /> Mode
          </MenuItem>
          <MenuItem href="#ticketcategory">
            <FolderOutline width="24" class="fill-current" /> Category
          </MenuItem>
          <MenuItem href="#ticketlogchannel">
            <FileTrayFullOutline width="24" class="fill-current" /> Log Channel
          </MenuItem>
          <MenuItem href="#supportrole">
            <At width="24" class="fill-current" /> Access Role
          </MenuItem>
          <MenuItem href="#ticketmention">
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
        </MenuCategory>
        <MenuItem href="#auditlogs">
          <NewspaperOutline width="24" class="fill-current" /> Audit Logs
        </MenuItem>
        <MenuItem href="#reactionroles">
          <HappyOutline width="24" class="fill-current" /> Reaction Roles
        </MenuItem>
      </Menu>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4 pt-22 sm:pt-28">
        <MenuTitle>GENERAL SETTINGS</MenuTitle>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          <Card>
            <CardHeader id="prefix" loading={store.loading.includes('prefix')}>
              <Alert width="32" class="fill-current" /> Prefix
            </CardHeader>
            <TextInput id="prefix-input" value={srvconfig?.prefix} placeholder="The bot's prefix" onChange$={async (event: any) => {
              store.loading.push('prefix');
              await updateSettingFn('prefix', event.target.value);
              store.loading = store.loading.filter(l => l != 'prefix');
            }}>
              Cactie's text command prefix
            </TextInput>
          </Card>
          <Card>
            <CardHeader id="suggestions" loading={store.loading.includes('suggestions')}>
              <MailOpenOutline width="32" class="fill-current" /> Suggestions
            </CardHeader>
            <SelectInput id="suggestionchannel" label="Channel to make suggestions in" extraClass="mb-4" onChange$={async (event: any) => {
              store.loading.push('suggestions');
              await updateSettingFn('suggestionchannel', event.target.value);
              store.loading = store.loading.filter(l => l != 'suggestions');
            }}>
              <option value="false" selected={srvconfig?.suggestionchannel == 'false'}>Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.suggestionchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
            <Toggle id="suggestthreads" checked={srvconfig?.suggestthreads == 'true'} onChange$={async (event: any) => {
              store.loading.push('suggestions');
              await updateSettingFn('suggestthreads', event.target.checked ? 'true' : 'false');
              store.loading = store.loading.filter(l => l != 'suggestions');
            }}>
              Create threads associated to suggestions for discussion
            </Toggle>
          </Card>
          <Card>
            <CardHeader id="polls" loading={store.loading.includes('polls')}>
              <CheckboxOutline width="32" class="fill-current" /> Polls
            </CardHeader>
            <SelectInput id="pollchannel" label="Channel to make polls in" onChange$={async (event: any) => {
              store.loading.push('polls');
              await updateSettingFn('pollchannel', event.target.value);
              store.loading = store.loading.filter(l => l != 'polls');
            }}>
              <option value="false" selected={srvconfig?.pollchannel == 'false'}>Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.pollchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card>
            <CardHeader id="joinmessage" loading={store.loading.includes('joinmessage')}>
              <Add width="32" class="fill-current" /> Join Message
            </CardHeader>
            <TextInput big id="joinmessage-message" value={srvconfig?.joinmessage.message} placeholder="The content of the message sent when someone joins" onChange$={async (event: any) => {
              store.loading.push('joinmessage');
              srvconfig!.joinmessage.message = event.target.value;
              await updateSettingFn('joinmessage', JSON.stringify(srvconfig?.joinmessage));
              store.loading = store.loading.filter(l => l != 'joinmessage');
            }}>
              The message when someone joins the server
            </TextInput>
            <p class="mt-2 mb-4">
              Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
            </p>
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
          <Card>
            <CardHeader id="leavemessage" loading={store.loading.includes('leavemessage')}>
              <Remove width="32" class="fill-current" /> Leave Message
            </CardHeader>
            <TextInput big id="leavemessage-message" value={srvconfig?.leavemessage.message} placeholder="The content of the message sent when someone leaves" onChange$={async (event: any) => {
              store.loading.push('leavemessage');
              srvconfig!.leavemessage.message = event.target.value;
              await updateSettingFn('leavemessage', JSON.stringify(srvconfig?.leavemessage));
              store.loading = store.loading.filter(l => l != 'leavemessage');
            }}>
              The message when someone leaves the server
            </TextInput>
            <p class="mt-2 mb-4">
              Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
            </p>
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
          <div class="grid gap-4">
            <Card>
              <CardHeader id="maxppsize" loading={store.loading.includes('maxppsize')}>
                <SpeedometerOutline width="32" class="fill-current" /> Max PP Size
              </CardHeader>
              <NumberInput input value={(store.guildData as guildData).srvconfig?.maxppsize} id="maxppsize-input" onChange$={async (event: any) => {
                store.loading.push('maxppsize');
                await updateSettingFn('maxppsize', event.target.value);
                store.loading = store.loading.filter(l => l != 'maxppsize');
              }}
              onIncrement$={async () => {
                store.loading.push('maxppsize');
                (store.guildData as guildData).srvconfig!.maxppsize++;
                await updateSettingFn('maxppsize', (store.guildData as guildData).srvconfig!.maxppsize);
                store.loading = store.loading.filter(l => l != 'maxppsize');
              }}
              onDecrement$={async () => {
                store.loading.push('maxppsize');
                (store.guildData as guildData).srvconfig!.maxppsize--;
                await updateSettingFn('maxppsize', (store.guildData as guildData).srvconfig!.maxppsize);
                store.loading = store.loading.filter(l => l != 'maxppsize');
              }}>
                The maximum size for the boner command
              </NumberInput>
            </Card>
            <Card>
              <CardHeader id="reactions" loading={store.loading.includes('reactions')}>
                <Toggle id="reactions-input" checked={srvconfig?.reactions == 'true'} onChange$={async (event: any) => {
                  store.loading.push('reactions');
                  await updateSettingFn('reactions', event.target.checked ? 'true' : 'false');
                  store.loading = store.loading.filter(l => l != 'reactions');
                }}>
                  <span class="flex items-center gap-3">
                    <HappyOutline width="32" class="fill-current" /> Reactions
                  </span>
                </Toggle>
              </CardHeader>
              <p class="text-gray-400 text-md mt-2.5">Reacts with various emojis on messages that have specific key-words</p>
            </Card>
          </div>
        </div>
        <MenuTitle>TICKET SYSTEM</MenuTitle>
        <div class="flex flex-wrap gap-4 py-10">
          <Card fit>
            <CardHeader id="tickets" loading={store.loading.includes('tickets')}>
              <InvertModeOutline width="32" class="fill-current" /> Mode
            </CardHeader>
            <SelectInput id="tickets-input" label="This is how the bot will handle tickets" onChange$={async (event: any) => {
              store.loading.push('tickets');
              await updateSettingFn('tickets', event.target.value);
              store.loading = store.loading.filter(l => l != 'tickets');
            }}>
              <option value="false" selected={srvconfig?.tickets == 'false'}>Disable Tickets</option>
              <option value="buttons" selected={srvconfig?.tickets == 'buttons'}>Use buttons</option>
              <option value="reactions" selected={srvconfig?.tickets == 'reactions'}>Use reactions</option>
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="ticketcategory" loading={store.loading.includes('ticketcategory')}>
              <FolderOutline width="32" class="fill-current" /> Category
            </CardHeader>
            <SelectInput id="ticketcategory-input" label="The category where tickets will appear" onChange$={async (event: any) => {
              store.loading.push('ticketcategory');
              await updateSettingFn('ticketcategory', event.target.value);
              store.loading = store.loading.filter(l => l != 'ticketcategory');
            }}>
              <option value="false" selected={srvconfig?.ticketcategory == 'false'}>No Category</option>
              {channels.filter(c => c.type == ChannelType.GuildCategory).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.ticketcategory == c.id}>{`> ${c.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="ticketlogchannel" loading={store.loading.includes('ticketlogchannel')}>
              <FileTrayFullOutline width="32" class="fill-current" /> Log Channel
            </CardHeader>
            <SelectInput id="ticketlogchannel-value" label="The channel where transcripts will appear" onChange$={async (event: any) => {
              store.loading.push('ticketlogchannel');
              await updateSettingFn('ticketlogchannel', event.target.value);
              store.loading = store.loading.filter(l => l != 'ticketlogchannel');
            }}>
              <option value="false" selected={srvconfig?.ticketlogchannel == 'false'}>Don't send transcripts</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.ticketlogchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="supportrole" loading={store.loading.includes('ticketlogchannel')}>
              <At width="32" class="fill-current" /> Access Role
            </CardHeader>
            <SelectInput id="supportrole-input" label="The role that may access tickets" onChange$={async (event: any) => {
              store.loading.push('supportrole');
              await updateSettingFn('supportrole', event.target.value);
              event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
              store.loading = store.loading.filter(l => l != 'supportrole');
            }} style={{
              color: '#' + (roles.find(r => r.id == srvconfig?.supportrole)?.color ? roles.find(r => r.id == srvconfig?.supportrole)?.color.toString(16) : 'ffffff'),
            }}>
              <option value="false" selected={srvconfig?.supportrole == 'false'} style={{ color: '#ffffff' }}>Only Administrators</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.supportrole == r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </Card>
          <Card fit>
            <CardHeader id="ticketmention" loading={store.loading.includes('ticketmention')}>
              <At width="32" class="fill-current" /> Mention
            </CardHeader>
            <SelectInput id="ticketmention-input" label="Pings the specified role when a ticket is created" onChange$={async (event: any) => {
              store.loading.push('ticketmention');
              await updateSettingFn('ticketmention', event.target.value);
              event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
              store.loading = store.loading.filter(l => l != 'ticketmention');
            }} style={{
              color: '#' + (roles.find(r => r.id == srvconfig?.ticketmention)?.color ? roles.find(r => r.id == srvconfig?.supportrole)?.color.toString(16) : 'ffffff'),
            }}>
              <option value="false" selected={srvconfig?.ticketmention == 'false'} style={{ color: '#ffffff' }}>No mention</option>
              <option value="everyone" selected={srvconfig?.ticketmention == 'everyone'} style={{ color: 'rgb(59 130 246)' }}>@ everyone</option>
              <option value="here" selected={srvconfig?.ticketmention == 'here'} style={{ color: 'rgb(59 130 246)' }}>@ here</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.ticketmention == r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
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
              await updateSettingFn('msgshortener', event.target.value);
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
            <CardHeader id="ticketcategory" loading={store.loading.includes('ticketcategory')}>
              <NotificationsOffOutline width="32" class="fill-current" /> Mute Command
            </CardHeader>
            <SelectInput id="ticketcategory-input" label="Select a role to give when muting or use Discord's timeout feature" onChange$={async (event: any) => {
              store.loading.push('ticketcategory');
              await updateSettingFn('ticketcategory', event.target.value);
              event.target.style.color = event.target.options[event.target.selectedIndex].style.color;
              store.loading = store.loading.filter(l => l != 'ticketcategory');
            }} style={{
              color: '#' + (roles.find(r => r.id == srvconfig?.mutecmd)?.color ? roles.find(r => r.id == srvconfig?.supportrole)?.color.toString(16) : 'ffffff'),
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
        </div>
        <MenuTitle>AUDIT LOGS</MenuTitle>
        <div class="py-10 flex flex-col gap-4">
          <div class="flex flex-col md:flex-row gap-4">
            <Card>
              <CardHeader id="auditlogs" loading={store.loading.includes('auditlogs-channel')}>
                <SendOutline width="32" class="fill-current" /> Default Channel
              </CardHeader>
              <SelectInput id="auditlogs-channel" label="This is where logs will be sent if there is no specific channel set on them" onChange$={async (event: any) => {
                store.loading.push('auditlogs-channel');
                srvconfig!.auditlogs.message = event.target.value;
                await updateSettingFn('auditlogs', JSON.stringify(srvconfig?.auditlogs));
                store.loading = store.loading.filter(l => l != 'auditlogs-channel');
              }}>
                <option value="false" selected={srvconfig?.auditlogs.channel == 'false'}>No channel specified.</option>
                {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                  <option value={c.id} key={c.id} selected={srvconfig?.auditlogs.channel == c.id}>{`# ${c.name}`}</option>,
                )}
              </SelectInput>
            </Card>
            <Card squish>
              <RawSelectInput id="new-log">
                <option value="all">All Logs</option>
                {!srvconfig?.auditlogs.logs?.member && (
                  <>
                    <option value="member">All Member-Related Logs</option>
                    {!srvconfig?.auditlogs.logs?.memberjoin && (
                      <option value="memberjoin">Member Joined</option>
                    )}
                    {!srvconfig?.auditlogs.logs?.memberleave && (
                      <option value="memberleave">Member Left</option>
                    )}
                  </>
                )}
                {!srvconfig?.auditlogs.logs?.message && (
                  <>
                    <option value="message">All Message-Related Logs</option>
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
                    <option value="channel">All Channel-Related Logs</option>
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
                {!srvconfig?.auditlogs.logs?.voice && (
                  <>
                    <option value="voice">All Voice-Related Logs</option>
                    {!srvconfig?.auditlogs.logs?.voicejoin && (
                      <option value="voicejoin">Voice Channel</option>
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
              </RawSelectInput>
              <RawSelectInput id="new-log-channel" label="The channel to associate this log to">
                {srvconfig?.auditlogs.channel != 'false' &&
                    <option value="false" selected>Default Channel</option>
                }
                {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                  <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                )}
              </RawSelectInput>
              <Button color="primary">
                  Add Audit Log
              </Button>
            </Card>
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
                      <Close width="36" class="fill-red-400" />
                    </div>
                    <RawSelectInput id={`auditlogs-logs-${log}.channel`} name={`auditlogs.logs.${log}.channel`}>
                      <option value="false" selected={srvconfig?.auditlogs.logs[log].channel == 'false'}>Default Channel</option>
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
          <Button color="primary" onClick$={() => store.modal = !store.modal}>
            Create Reaction Role
          </Button>
        </div>
        <div class="flex flex-col gap-4 py-10">
          {
            reactionroles.channels.map(channel => (
              <Card key={channel.id}>
                <div class="flex items-start flex-1">
                  <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                    # {channel?.name ?? 'Channel Not Found.'}
                  </h1>
                  <Button color="primary" small onClick$={() => store.modal = !store.modal}>
                    Create Here
                  </Button>
                </div>
                <div class='flex flex-col gap-4'>
                  {
                    channel.messages.map((messageId: string) => (
                      <Card darker key={messageId}>
                        <div class="flex items-start flex-1">
                          <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                            Message # {messageId}
                          </h1>
                          <Button color="primary" small onClick$={() => store.modal = !store.modal}>
                            Create Here
                          </Button>
                        </div>
                        <div class='flex flex-wrap gap-4'>
                          {
                            reactionroles.raw.filter(r => r.messageId == messageId).map(rr => {
                              const role = roles.find(r => r.id == rr.roleId);

                              return <Card key={rr.roleId} row fit contextMenu={{ func: openContextMenu, args: [rr] }}>
                                <div class="p-1">
                                  {rr.emojiId.startsWith('https') ? <img src={rr.emojiId} class="w-12 h-auto" width={48} height={48}/> : <p class="text-4xl py-1">{rr.emojiId}</p>}
                                </div>
                                <div>
                                  <h1 class="font-bold text-gray-100 text-md" style={{ color: role?.color }}>@ {role?.name ?? 'Role Not Found.'} <br class="hidden group-hover:inline-flex sm:group-hover:hidden"/><span class="font-normal hidden group-hover:inline-flex text-gray-400">Right click to edit</span></h1>
                                  <p class="hidden sm:flex">
                                    {rr.type == 'switch' ? 'Add by reacting / Remove by unreacting' : 'Add / Remove by reacting'}<br />
                                    {rr.silent == 'true' && 'Keep quiet when reacting / unreacting'}
                                  </p>
                                </div>
                              </Card>;
                            })
                          }
                        </div>
                      </Card>
                    ))
                  }
                </div>
              </Card>
            ))
          }
        </div>
      </div>
      <div class="hidden flex-col gap-2 py-3 px-2 rounded-xl bg-gray-900/50 backdrop-blur-lg border border-gray-800 drop-shadow-lg absolute top-0" id="contextmenu" preventdefault:contextmenu>
        <RawSelectInput id="rrrole" transparent extraClass="text-sm hover:bg-gray-800">
          {roles.map(r =>
            <option value={r.id} key={r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
          )}
        </RawSelectInput>
        <RawSelectInput id="rrswitch" transparent extraClass="text-sm hover:bg-gray-800">
          <option value="switch">Add by reacting / Remove by unreacting</option>
          <option value="toggle">Add / Remove by reacting</option>
        </RawSelectInput>
        <a class="flex items-center py-2 px-3 pr-1">
          <span class="flex-1">
            Silent
          </span>
          <Toggle nolabel id="rrsilent" />
        </a>
        <a id="rrdelete" class="flex items-center py-2 px-3 rounded-md transition text-red-400 hover:bg-gray-800 cursor-pointer" onClick$={closeContextMenu}>
          Delete
        </a>
      </div>
      <div class={`relative z-10 ${store.modal ? '' : 'pointer-events-none'}`}>
        <div class={`fixed inset-0 z-10 ${store.modal ? 'bg-gray-900/30' : 'opacity-0'} transition overflow-y-auto`}>
          <div class="flex min-h-full max-h-full items-start justify-center p-4 pt-24 text-center sm:items-center">
            <div class="rounded-lg bg-gray-900/50 backdrop-blur-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
              <h1 class="flex-1 justify-start font-bold text-gray-100 text-2xl">
                Create Reaction Role
              </h1>
              <div class="flex flex-col my-4 gap-4">
                <div class="flex flex-col sm:flex-row gap-4">
                  <TextInput id="rrcreateemoji" value="😃">
                    The emoji to react with
                  </TextInput>
                  <div class="flex-1">
                    <SelectInput id="rrcreaterole" label="The role to be given">
                      {roles.map(r =>
                        <option value={r.id} key={r.id} style={{ color: '#' + (r.color ? r.color.toString(16) : 'ffffff') }}>{`@ ${r.name}`}</option>,
                      )}
                    </SelectInput>
                  </div>
                </div>
                <SelectInput id="rrcreatechannel" label="Select the channel the reaction role will be in">
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
                <TextInput id="rrcreatemessage" placeholder="1105427534889353317">
                  The Id of the message you want to create the reaction role in
                </TextInput>
                <SelectInput id="rrcreateswitch" label="Reaction role behavior">
                  <option value="switch">Add by reacting / Remove by unreacting</option>
                  <option value="toggle">Add / Remove by reacting</option>
                </SelectInput>
                <Toggle id="rrcreatesilent">
                  Silent
                </Toggle>
              </div>
              <div class="flex flex-row-reverse gap-3">
                <Button color="primary" extraClass="flex-1 sm:flex-initial">
                  Create
                </Button>
                <Button extraClass="flex-1 sm:flex-initial" onClick$={() => store.modal = !store.modal}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
});

export const openContextMenu = $((event: any, rr: any) => {
  const contextmenu = document.getElementById('contextmenu')!;
  const rrRole: any = document.getElementById('rrrole')!;
  const rrSwitch: any = document.getElementById('rrswitch')!;
  const rrSilent: any = document.getElementById('rrsilent')!;
  rrRole.value = rr.roleId;
  rrSwitch.value = rr.type;
  rrSilent.checked = rr.silent == 'true';
  contextmenu.style.display = 'flex';
  const Yoffset = event.pageY + contextmenu.clientHeight > document.body.clientHeight ? contextmenu.clientHeight : 0;
  contextmenu.style.top = `${event.pageY - Yoffset}px`;
  const Xoffset = event.pageX + contextmenu.clientWidth > document.body.clientWidth ? contextmenu.clientWidth : 0;
  contextmenu.style.left = `${event.pageX - Xoffset}px`;
  document.addEventListener('click', closeContextMenu);
});

export const closeContextMenu = $((event: any) => {
  const contextmenu = document.getElementById('contextmenu')!;
  if (event.target.id != 'rrdelete' && (contextmenu.contains(event.target) || event.target.innerText == '•••' || contextmenu.style.display == 'none')) return;
  contextmenu.style.display = 'none';
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