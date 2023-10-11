import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { PrismaClient, type settings } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import type { APIGuild, APIGuildChannel, APIRole, ChannelType, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { ChatboxOutline, HappyOutline, NewspaperOutline, SettingsOutline, ShieldCheckmarkOutline, TerminalOutline, TicketOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import Switcher from '~/components/elements/Switcher';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getSrvConfigFn = server$(async function(props?: RequestEventBase) {
  props = props ?? this;

  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get(`DATABASE_URL${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

  const srvconfigUnparsed = await prisma.settings.findUnique({
    where: {
      guildId: props.params.guildId,
    },
    cacheStrategy: { ttl: 15 },
  });

  const srvconfig = srvconfigUnparsed ? {
    ...srvconfigUnparsed,
    joinmessage: JSON.parse(srvconfigUnparsed.joinmessage),
    leavemessage: JSON.parse(srvconfigUnparsed.leavemessage),
    tickets: JSON.parse(srvconfigUnparsed.tickets),
    voicechats: JSON.parse(srvconfigUnparsed.voicechats),
    reactions: JSON.parse(srvconfigUnparsed.reactions),
    auditlogs: JSON.parse(srvconfigUnparsed.auditlogs),
  } : null;

  return srvconfig as settings & {
    joinmessage: any,
    leavemessage: any,
    tickets: any,
    voicechats: any,
    reactions: any[],
    auditlogs: any,
  } | null;
});

export const updateSettingFn = server$(async function(name: string, value: string | number | boolean | null | undefined) {
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());
  await prisma.settings.update({ where: { guildId: this.params.guildId }, data: { [name]: value } });
});

export async function fetchData(url: string, props: RequestEventBase, user?: boolean, accessToken?: string): Promise<any> {
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

export type AnyGuildChannel = APIGuildChannel<ChannelType>;

interface guildData {
  guild: APIGuild,
  channels: AnyGuildChannel[],
  roles: APIRole[],
}

const guildCache = new Map<string, guildData>();

export const getGuildFn = server$(async function(props?: RequestEventBase, noCache?: boolean) {
  props = props ?? this;
  const guildId = props.params.guildId;
  if (!noCache && guildCache.has(guildId)) return guildCache.get(guildId)!;

  console.log('Fetching guild data for', guildId);

  const [guild, channels, roles] = await Promise.all([
    fetchData(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, props) as Promise<APIGuild>,
    fetchData(`https://discord.com/api/v10/guilds/${guildId}/channels`, props) as Promise<AnyGuildChannel[]>,
    fetchData(`https://discord.com/api/v10/guilds/${guildId}/roles`, props) as Promise<APIRole[]>,
  ]);

  // Sort roles by position
  roles.sort((a, b) => b.position - a.position);
  // Sort channels by position
  channels.sort((a, b) => a.position - b.position);

  guildCache.set(guildId, { guild, channels, roles });

  return { guild, channels, roles };
});

export const useGetGuild = routeLoader$(async (props) => await getGuildFn(props));

export default component$(() => {
  const guildData = useGetGuild().value;
  const { guild, channels, roles } = guildData;

  const store = useStore({
    dev: undefined as boolean | undefined,
  });

  useVisibleTask$(() => {
    store.dev = document.cookie.includes('branch=dev');
  });

  return (
    <section class="mx-auto max-w-5xl px-6 py-24 flex flex-col gap-4 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl">
        {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
        {guild.name}
      </h1>
      <div class="flex-1 my-4">
        <Switcher store={store} label='Bot:' onSwitch$={() => {}} />
      </div>
      <div class="w-full">
        <Card darker>
          <CardHeader>
            Server Info
          </CardHeader>
          <div class="grid sm:grid-cols-2 gap-4">
            <p>
              Id: {guild.id}
            </p>
            <p>
              Channels: {channels.length}
            </p>
            <p>
              Online Members: {guild.approximate_presence_count} / {guild.approximate_member_count}
            </p>
            <p>
              Roles: {roles.length}
            </p>
          </div>
        </Card>
      </div>
      <div class="w-full grid md:grid-cols-6 gap-4 fill-current">
        <Card extraClass={{ 'md:col-span-2': true }} color="red" link={`/dashboard/${guild.id}/general`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <SettingsOutline width='48' />
              General
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-2': true }} color="orange" link={`/dashboard/${guild.id}/tickets`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <TicketOutline width='48' />
              Tickets
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-2': true }} color="yellow" link={`/dashboard/${guild.id}/moderation`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <ShieldCheckmarkOutline width='48' />
              Moderation
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-3': true }} color="green" link={`/dashboard/${guild.id}/reactions`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <ChatboxOutline width='48' />
              Reactions
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-3': true }} color="blue" link={`/dashboard/${guild.id}/auditlogs`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <NewspaperOutline width='48' />
              Audit Logs
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-3': true }} color="purple" link={`/dashboard/${guild.id}/reactionroles`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <HappyOutline width='48' />
              Reaction Roles
            </div>
          </CardHeader>
        </Card>
        <Card extraClass={{ 'md:col-span-3': true }} color="pink" link={`/dashboard/${guild.id}/customcmds`}>
          <CardHeader>
            <div class="flex flex-col items-center w-full gap-4 py-10">
              <TerminalOutline width='48' />
              Custom Commands
            </div>
          </CardHeader>
        </Card>
      </div>
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