import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { ApplicationCommandType, ChannelType } from 'discord-api-types/v10';
import { PrismaClient } from '@prisma/client/edge';
import TextInput from '~/components/elements/TextInput';
import Checkbox from '~/components/elements/Checkbox';
import SelectInput from '~/components/elements/SelectInput';
import { Button } from '~/components/elements/Button';
import { Add, Close, TerminalOutline } from 'qwik-ionicons';
import Card, { CardHeader } from '~/components/elements/Card';
import LoadingIcon from '~/components/icons/LoadingIcon';
const actionTypes = {
  1: 'Send Message',
  2: 'Wait',
  3: 'Edit Channel',
};

import { getGuildFn } from '../index@required';
import MenuBar from '~/components/MenuBar';

export const getCustomCmdsFn = server$(async function(props?: RequestEventBase) {
  props = props ?? this;

  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get(`DATABASE_URL${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

  const customcmdsUnparsed = await prisma.customcmds.findMany({
    where: {
      guildId: props.params.guildId,
    },
  });

  const customcmds = customcmdsUnparsed ? customcmdsUnparsed.map(cmd => ({
    ...cmd,
    actions: JSON.parse(cmd.actions),
  })) : null;

  return customcmds;
});

export const useGetData = routeLoader$(async (props) => {
  const [customcmds, guild] = await Promise.all([
    getCustomCmdsFn(props),
    getGuildFn(props, false, true),
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
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

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
  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } });

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
    <section class="mx-auto max-w-6xl px-6 py-24 flex flex-col gap-4 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
        {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
        {guild.name}
      </h1>
      <h2 class="text-xl text-gray-300 font-semibold fill-current flex items-center gap-3">
        <TerminalOutline width="32" />
        Custom Commands
        <div class={{
          'transition-all': true,
          'opacity-0 -ml-12': !store.loading.includes('customcmds'),
          'opacity-100 -ml-2': store.loading.includes('customcmds'),
        }}>
          <LoadingIcon />
        </div>
      </h2>
      <MenuBar guild={guild} />
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
        <div class="py-10 grid gap-4">
          {
            customcmds?.map((cmd, i) =>
              <Card key={i}>
                <div class="flex gap-2">
                  <p class="text-2xl p-1 px-2">
                    / {cmd.name}
                  </p>
                  <div class="flex-1">
                    <TextInput nolabel placeholder="Command Description" value={cmd.description} onChange$={async (event: any) => {
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
                      <LoadingIcon />
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
                    <Card darker key={i2}>
                      <CardHeader>
                        Action {i2 + 1} - {actionTypes[action.type as keyof typeof actionTypes]}
                      </CardHeader>
                      {action.type == 1 && <div class="flex flex-col gap-2">
                        <TextInput placeholder="Hello World!" value={action.content} onChange$={async (event: any) => {
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
                        <TextInput big placeholder="{ ...JSON here }" value={action.embeds[0] ? JSON.stringify(action.embeds[0]) : ''} onChange$={async (event: any) => {
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
                        </TextInput>
                        <div class="mt-2">
                          <Checkbox toggle checked={action.ephemeral} onChange$={async (event: any) => {
                            store.loading.push(`customcmds-${cmd.id}`);
                            cmd.actions[i2].ephemeral = event.target.checked;
                            await upsertCustomCommandFn({
                              guildId: guild.id,
                              name: cmd.name,
                              actions: JSON.stringify(cmd.actions),
                            }, true);
                            store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                          }}>
                            Ephemeral
                          </Checkbox>
                        </div>
                      </div>}
                      {action.type == 2 && <div class="flex flex-col gap-2">
                        <TextInput placeholder="1000" value={action.ms} onChange$={async (event: any) => {
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
                        <SelectInput label="Select the channel to edit" value={action.channel} onChange$={async (event: any) => {
                          store.loading.push(`customcmds-${cmd.id}`);
                          cmd.actions[i2].channel = event.target.value;
                          await upsertCustomCommandFn({
                            guildId: guild.id,
                            name: cmd.name,
                            actions: JSON.stringify(cmd.actions),
                          }, true);
                          store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                        }}>
                          {channels.map(c =>
                            <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                          )}
                        </SelectInput>
                        <TextInput placeholder="general" value={action.name} onChange$={async (event: any) => {
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
                        <TextInput placeholder="This is the general channel" value={action.topic} onChange$={async (event: any) => {
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
                        <SelectInput label="Set channel category" value={action.topic} onChange$={async (event: any) => {
                          store.loading.push(`customcmds-${cmd.id}`);
                          cmd.actions[i2].parentId = event.target.value;
                          await upsertCustomCommandFn({
                            guildId: guild.id,
                            name: cmd.name,
                            actions: JSON.stringify(cmd.actions),
                          }, true);
                          store.loading = store.loading.filter(l => l != `customcmds-${cmd.id}`);
                        }}>
                          <option value={undefined}>Don't change</option>
                          {channels.filter(c => c.type == ChannelType.GuildCategory).map(c =>
                            <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                          )}
                        </SelectInput>
                      </div>}
                    </Card>,
                  )
                }
                <Card darker>
                  <CardHeader>
                    Add Action
                  </CardHeader>
                  <SelectInput id="customcmd-create-type" label="Type" value={store.customcmdtype} onChange$={async (event: any) => {
                    store.customcmdtype = event.target.value;
                  }}>
                    {Object.keys(actionTypes).map((t, i) =>
                      <option value={i + 1} key={i + 1}>{actionTypes[i + 1 as keyof typeof actionTypes]}</option>,
                    )}
                  </SelectInput>
                  {store.customcmdtype == 1 && <div class="flex flex-col gap-2">
                    <TextInput placeholder="Hello World!" id={`customcmd-action-content-${cmd.id}`}>
                      Text Content *Optional if embed is provided
                    </TextInput>
                    <TextInput big placeholder="{ ...JSON here }" id={`customcmd-action-embed-${cmd.id}`}>
                      Embed *Optional if text content is provided
                    </TextInput>
                    <div class="my-2">
                      <Checkbox toggle id={`customcmd-action-ephemeral-${cmd.id}`}>
                        Ephemeral
                      </Checkbox>
                    </div>
                  </div>}
                  {store.customcmdtype == 2 && <div class="flex flex-col gap-2">
                    <TextInput placeholder="1000" id={`customcmd-action-ms-${cmd.id}`}>
                      Time to wait in milliseconds
                    </TextInput>
                  </div>}
                  {store.customcmdtype == 3 && <div class="flex flex-col gap-2">
                    <SelectInput id={`customcmd-action-channel-${cmd.id}`} label="Select the channel to edit">
                      {channels.map(c =>
                        <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                      )}
                    </SelectInput>
                    <TextInput placeholder="general" id={`customcmd-action-channel-name-${cmd.id}`}>
                      Set Channel Name
                    </TextInput>
                    <TextInput placeholder="This is the general channel" id={`customcmd-action-channel-topic-${cmd.id}`}>
                      Set Channel Topic
                    </TextInput>
                    <SelectInput id={`customcmd-action-channel-category-${cmd.id}`} label="Set channel category">
                      <option value={undefined}>Don't change</option>
                      {channels.filter(c => c.type == ChannelType.GuildCategory).map(c =>
                        <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                      )}
                    </SelectInput>
                  </div>}
                  <Button color="primary" onClick$={async () => {
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
            <CardHeader loading={store.loading.includes('customcmds')}>
              <Add width="32" class="fill-current" /> Create
            </CardHeader>
            <p>
              You will be able to add the actions for this command once you create it.
            </p>
            <div class="flex gap-2">
              <p class="text-2xl p-1 px-2">/</p>
              <div class="flex-1">
                <TextInput nolabel placeholder="Command Name" id="customcmd-create-name" />
              </div>
              <div class="flex-1">
                <TextInput nolabel placeholder="Command Description" id="customcmd-create-description" />
              </div>
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