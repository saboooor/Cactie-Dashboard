import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { ApplicationCommandType, ChannelType } from 'discord-api-types/v10';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Add, Close, TerminalOutline } from 'qwik-ionicons';
const actionTypes = {
  1: 'Send Message',
  2: 'Wait',
  3: 'Edit Channel',
};

import { getGuild } from '../index@required';
import MenuBar from '~/components/MenuBar';
import { Button, Card, Dropdown, Header, LoadingIcon, TextArea, TextInput, TextInputRaw, Toggle } from '@luminescent/ui';

export async function getCustomCmds(props: RequestEventBase) {
  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get(`DATABASE_URL${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

  const customcmdsUnparsed = await prisma.customcmds.findMany({
    where: {
      guildId: props.params.guildId,
    },
    cacheStrategy: { ttl: 15 },
  });

  const customcmds = customcmdsUnparsed ? customcmdsUnparsed.map(cmd => ({
    ...cmd,
    actions: JSON.parse(cmd.actions),
  })) : null;

  return customcmds;
}

export const useGetData = routeLoader$(async (props) => {
  const [customcmds, guild] = await Promise.all([
    getCustomCmds(props),
    getGuild(props),
  ]);
  return { customcmds, ...guild };
});

export const upsertCustomCommandFn = server$(async function(props: {
  id?: string;
  guildId: string;
  name: string;
  description?: string;
  actions?: any;
}, skipPOST?: boolean) {
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

  if (skipPOST) {
    await prisma.customcmds.update({
      where: { guildId_name: {
        guildId: props.guildId,
        name: props.name,
      } },
      data: props,
    });
    return;
  }

  const res = await fetch(`https://discord.com/api/v10/applications/${this.env.get(`CLIENT_ID${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}/guilds/${props.guildId}/commands`, {
    method: 'POST',
    headers: {
      authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: props.name,
      description: props.description,
      type: ApplicationCommandType.ChatInput,
    }),
  }).catch(() => null);
  if (!res) return new Error('creating command failed');
  const json = await res.json();
  props.id = json.id;

  const customcmd = await prisma.customcmds.upsert({
    where: { guildId_name: {
      guildId: props.guildId,
      name: props.name,
    } },
    update: props,
    create: {
      id: json.id,
      ...props,
    },
  });

  return customcmd;
});

export const deleteCustomCommandFn = server$(async function(props: {
  id: string;
  guildId: string;
}) {
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

  const res = await fetch(`https://discord.com/api/v10/applications/${this.env.get(`CLIENT_ID${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}/guilds/${props.guildId}/commands/${props.id}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bot ${this.env.get(`BOT_TOKEN${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`)}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => null);
  if (!res) return new Error('deleting command failed');

  await prisma.customcmds.delete({
    where: { id: props.id },
  });
});

export default component$(() => {
  const data = useGetData().value;
  const { guild, channels } = data;

  const store = useStore({
    loading: [] as string[],
    customcmds: data.customcmds,
    customcmdtype: 1,
    generateembed: false,
  });

  const customcmds = store.customcmds;

  return (
    <section class="mx-auto max-w-6xl px-6 flex flex-col gap-4 items-center min-h-[100svh] pt-32">
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <div class="bg-pink-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <TerminalOutline width="32" />
          Custom Commands
          <div class={{
            'transition-all': true,
            'opacity-0 -ml-12': !store.loading.includes('customcmds'),
            'opacity-100 -ml-2': store.loading.includes('customcmds'),
          }}>
            <LoadingIcon width={24} />
          </div>
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="py-10 flex flex-col w-full gap-4">
        {
          customcmds?.map((cmd, i) =>
            <Card key={i}>
              <div class="flex gap-2">
                <p class="text-2xl p-1 px-2">
                  / {cmd.name}
                </p>
                <div class="flex-1">
                  <TextInputRaw class={{
                    'w-full': true,
                  }} placeholder="Command Description" value={cmd.description} onChange$={async (event: any) => {
                    store.loading.push(`customcmds-${cmd.id}`);
                    await upsertCustomCommandFn({
                      guildId: guild.id,
                      name: cmd.name,
                      description: event.target.value,
                    });
                    store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                  }} />
                </div>
                <div class="flex items-center">
                  <div class={{
                    'transition-all absolute': true,
                    'opacity-0': !store.loading.includes(`customcmds-${cmd.id}`),
                    'opacity-100': store.loading.includes(`customcmds-${cmd.id}`),
                  }}>
                    <LoadingIcon width={24} />
                  </div>
                  <div class={{
                    'transition-all': true,
                    'opacity-0': store.loading.includes(`customcmds-${cmd.id}`),
                    'opacity-100': !store.loading.includes(`customcmds-${cmd.id}`),
                  }}>
                    <Close width="36" class="fill-red-400 cursor-pointer" onClick$={async () => {
                      store.loading.push(`customcmds-${cmd.id}`);
                      await deleteCustomCommandFn({
                        id: cmd.id,
                        guildId: guild.id,
                      });
                      customcmds.splice(i, 1);
                      store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                    }} />
                  </div>
                </div>
              </div>
              {
                cmd.actions.map((action: any, i2: any) =>
                  <Card color="darkergray" key={i2}>
                    <Header>
                      Action {i2 + 1} - {actionTypes[action.type as keyof typeof actionTypes]}
                    </Header>
                    {action.type == 1 && <div class="flex flex-col gap-2">
                      <TextInput id={`textcontent-${i}-${i2}`} placeholder="Hello World!" value={action.content} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].content = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }}>
                        Text Content *Optional if embed is provided
                      </TextInput>
                      <TextArea id={`embed-${i}-${i2}`} placeholder="{ ...JSON here }" value={action.embeds[0] ? JSON.stringify(action.embeds[0]) : ''} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].embeds = [event.target.value != '' ? JSON.parse(event.target.value) : undefined];
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }}>
                        Embed *Optional if text content is provided
                      </TextArea>
                      <div class="mt-2">
                        <Toggle onColor='pink' label="Ephemeral" checked={action.ephemeral} onChange$={async (event: any) => {
                          store.loading.push(`customcmds-${cmd.id}`);
                          cmd.actions[i2].ephemeral = event.target.checked;
                          await upsertCustomCommandFn({
                            guildId: guild.id,
                            name: cmd.name,
                            actions: JSON.stringify(cmd.actions),
                          }, true);
                          store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                        }}/>
                      </div>
                    </div>}
                    {action.type == 2 && <div class="flex flex-col gap-2">
                      <TextInput id={`ms-${i}-${i2}`} placeholder="1000" value={action.ms} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].ms = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }}>
                        Time to wait in milliseconds
                      </TextInput>
                    </div>}
                    {action.type == 3 && <div class="flex flex-col gap-2">
                      <Dropdown id={`channel-${i}-${i2}`} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].channel = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }} value={action.channel} values={channels.map(c => ({ name: `# ${c.name}`, value: c.id }))}>
                        Select the channel to edit
                      </Dropdown>
                      <TextInput id={`channel-name-${i}-${i2}`} placeholder="general" value={action.name} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].name = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }}>
                        Set Channel Name
                      </TextInput>
                      <TextInput id={`channel-topic-${i}-${i2}`} placeholder="This is the general channel" value={action.topic} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].topic = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }}>
                        Set Channel Topic
                      </TextInput>
                      <Dropdown id={`channel-category-${i}-${i2}`} onChange$={async (event: any) => {
                        store.loading.push(`customcmds-${cmd.id}`);
                        cmd.actions[i2].parentId = event.target.value;
                        await upsertCustomCommandFn({
                          guildId: guild.id,
                          name: cmd.name,
                          actions: JSON.stringify(cmd.actions),
                        }, true);
                        store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                      }} values={[
                        { name: 'Don\'t change', value: 0 },
                        ...channels.filter(c => c.type == ChannelType.GuildCategory).map(c => ({ name: `# ${c.name}`, value: c.id })),
                      ]}>
                        Set channel category
                      </Dropdown>
                    </div>}
                  </Card>,
                )
              }
              <Card color="darkergray">
                <Header>
                  Add Action
                </Header>
                <Dropdown id="customcmd-create-type" onChange$={async (event: any) => {
                  store.customcmdtype = event.target.value;
                }} value={store.customcmdtype} values={Object.keys(actionTypes).map((t, i) => ({ name: actionTypes[i + 1 as keyof typeof actionTypes], value: i + 1 }))}>
                  Type
                </Dropdown>
                {store.customcmdtype == 1 && <div class="flex flex-col gap-2">
                  <TextInput placeholder="Hello World!" id={`customcmd-action-content-${cmd.id}`}>
                    Text Content *Optional if embed is provided
                  </TextInput>
                  <TextArea placeholder="{ ...JSON here }" id={`customcmd-action-embed-${cmd.id}`}>
                    Embed *Optional if text content is provided
                  </TextArea>
                  <div class="my-2">
                    <Toggle onColor='pink' label="Ephemeral" id={`customcmd-action-ephemeral-${cmd.id}`}/>
                  </div>
                </div>}
                {store.customcmdtype == 2 && <div class="flex flex-col gap-2">
                  <TextInput placeholder="1000" id={`customcmd-action-ms-${cmd.id}`}>
                    Time to wait in milliseconds
                  </TextInput>
                </div>}
                {store.customcmdtype == 3 && <div class="flex flex-col gap-2">
                  <Dropdown id={`customcmd-action-channel-${cmd.id}`} values={channels.map(c => ({ name: `# ${c.name}`, value: c.id }))}>
                    Select the channel to edit
                  </Dropdown>
                  <TextInput placeholder="general" id={`customcmd-action-channel-name-${cmd.id}`}>
                    Set Channel Name
                  </TextInput>
                  <TextInput placeholder="This is the general channel" id={`customcmd-action-channel-topic-${cmd.id}`}>
                    Set Channel Topic
                  </TextInput>
                  <Dropdown id={`customcmd-action-channel-category-${cmd.id}`} values={[
                    { name: 'Don\'t change', value: 0 },
                    ...channels.filter(c => c.type == ChannelType.GuildCategory).map(c => ({ name: `# ${c.name}`, value: c.id })),
                  ]}>
                    Set channel category
                  </Dropdown>
                </div>}
                <Button color="pink" onClick$={async () => {
                  store.loading.push(`customcmds-${cmd.id}`);
                  const action: any = {
                    type: store.customcmdtype,
                  };
                  if (action.type == 1) {
                    const content = document.getElementById(`customcmd-action-content-${cmd.id}`) as HTMLInputElement;
                    const embed = document.getElementById(`customcmd-action-embed-${cmd.id}`) as HTMLInputElement;
                    const ephemeral = document.getElementById(`customcmd-action-ephemeral-${cmd.id}`) as HTMLInputElement;
                    action.content = content.value;
                    action.embeds = [embed.value != '' ? JSON.parse(embed.value) : undefined];
                    action.ephemeral = ephemeral.checked;
                  }
                  else if (action.type == 2) {
                    const ms = document.getElementById(`customcmd-action-ms-${cmd.id}`) as HTMLInputElement;
                    action.ms = ms.value;
                  }
                  else if (action.type == 3) {
                    const channelId = document.getElementById(`customcmd-action-channel-${cmd.id}`) as HTMLSelectElement;
                    const name = document.getElementById(`customcmd-action-channel-name-${cmd.id}`) as HTMLInputElement;
                    const topic = document.getElementById(`customcmd-action-channel-topic-${cmd.id}`) as HTMLInputElement;
                    const parentId = document.getElementById(`customcmd-action-channel-category-${cmd.id}`) as HTMLInputElement;
                    action.channelId = channelId.value;
                    action.name = name.value == '' ? undefined : name.value;
                    action.topic = topic.value == '' ? undefined : topic.value;
                    action.parentId = parentId.value == '' ? undefined : parentId.value;
                  }
                  await upsertCustomCommandFn({
                    guildId: guild.id,
                    name: cmd.name,
                    actions: JSON.stringify([...cmd.actions, action]),
                  }, true);
                  customcmds[i].actions.push(action);
                  store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                }}>
                    Add Action
                </Button>
              </Card>
            </Card>,
          )
        }
        <Card>
          <Header loading={store.loading.includes('customcmds')}>
            <Add width="32" class="fill-current" /> Create
          </Header>
          <p>
            You will be able to add the actions for this command once you create it.
          </p>
          <div class="flex flex-wrap gap-2">
            <p class="text-2xl p-1 px-2">/</p>
            <TextInputRaw placeholder="Command Name" id="customcmd-create-name" />
            <TextInputRaw class={{
              'flex-1': true,
            }} placeholder="Command Description" id="customcmd-create-description" />
            <Add width="36" class="text-green-400 cursor-pointer" onClick$={async () => {
              store.loading.push('customcmds');
              const name = document.getElementById('customcmd-create-name')! as HTMLInputElement;
              const description = document.getElementById('customcmd-create-description')! as HTMLInputElement;
              const customcmd = await upsertCustomCommandFn({
                guildId: guild.id,
                name: name.value,
                description: description.value,
              });
              if (customcmd instanceof Error || !customcmd) {
                store.loading = store.loading.filter(l => l != 'customcmds');
                return;
              }
              customcmds?.push(customcmd);
              store.loading = store.loading.filter(l => l != 'customcmds');
            }} />
          </div>
        </Card>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Custom Commands',
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