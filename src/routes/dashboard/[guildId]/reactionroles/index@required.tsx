import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead, RequestEventBase } from '@builder.io/qwik-city';
import { routeLoader$, server$ } from '@builder.io/qwik-city';
import { ChannelType } from 'discord-api-types/v10';
import type { reactionroles } from '@prisma/client/edge';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

import EmojiInput, { EmojiPicker } from '~/components/elements/EmojiInput';
import { Add, HappyOutline, EllipsisVertical, Link } from 'qwik-ionicons';
import { LoadingIcon, Card, Dropdown, TextInput, Toggle, Button } from '@luminescent/ui';

import { type AnyGuildChannel, getGuild } from '../index@required';
import MenuBar from '~/components/MenuBar';

export async function getReactionRoles(channels: AnyGuildChannel[], props: RequestEventBase) {

  const prisma = new PrismaClient({ datasources: { db: { url: props.env.get(`DATABASE_URL${props.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

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

  return reactionroles;
}
export const getReactionRolesFn = server$(async function(channels: AnyGuildChannel[]) {
  return await getReactionRoles(channels, this);
});

export const useGetData = routeLoader$(async (props) => {
  const { guild, channels, roles } = await getGuild(props);
  const reactionroles = await getReactionRoles(channels, props);

  return { reactionroles, guild, channels, roles };
});

export const upsertReactionRoleFn = server$(async function(props: reactionroles) {
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

  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

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

  const prisma = new PrismaClient({ datasources: { db: { url: this.env.get(`DATABASE_URL${this.cookie.get('branch')?.value == 'dev' ? '_DEV' : ''}`) } } }).$extends(withAccelerate());

  await prisma.reactionroles.delete({
    where: { messageId_emojiId: {
      messageId: props.messageId,
      emojiId: props.emojiId,
    } },
  });
});

export default component$(() => {
  const data = useGetData().value;
  const { guild, channels, roles } = data;

  const store = useStore({
    modal: undefined as 'create' | 'edit' | undefined,
    reactionroles: data.reactionroles,
    loading: [] as string[],
    rrselected: [] as string[],
  });

  const reactionroles = store.reactionroles;

  return (
    <section class="mx-auto max-w-6xl px-6 flex flex-col gap-4 items-center min-h-[100svh] pt-32">
      <div class="menubar flex flex-col gap-4 items-center">
        <h1 class="flex items-center gap-5 font-bold text-white text-2xl sm:text-3xl md:text-4xl mb-2">
          {guild.icon && <img class="w-16 h-16 rounded-full" width={64} height={64} src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} style={{ 'view-transition-name': 'picture' }} />}
          {guild.name}
        </h1>
        <div class="bg-purple-400/40 w-64 h-8 -mb-12 -z-10 blur-2xl rounded-full" />
        <h2 class="text-xl text-slate-300 font-semibold fill-current flex items-center gap-3">
          <HappyOutline width="32" />
          Reaction Roles
          <div class={{
            'transition-all': true,
            'opacity-0 -ml-12': !store.loading.includes('reactionroles'),
            'opacity-100 -ml-2': store.loading.includes('reactionroles'),
          }}>
            <LoadingIcon width={24} />
          </div>
          <Add width="32" class="text-green-400 cursor-pointer" onClick$={async () => {
            store.modal = 'create';
          }} />
        </h2>
        <MenuBar guild={guild} />
      </div>
      <div class="grid gap-4 py-10">
        {reactionroles.channels.length == 0 &&
          <Card>
            You have no reaction roles set up. Click the + button to create one.
          </Card>
        }
        {
          reactionroles.channels.map(channel => (
            <div key={channel.id}>
              <div class="flex items-start flex-1 mb-4">
                <h1 class="flex-1 justify-start font-bold text-slate-100 text-2xl">
                    # {channel?.name ?? 'Channel Not Found.'}
                </h1>
                <Add width="36" class="text-green-400 cursor-pointer" onClick$={() => {
                  const channelselect = document.getElementById('rrcreatechannel') as HTMLSelectElement;
                  channelselect.value = channel.id;
                  store.modal = 'create';
                }} />
              </div>
              <div class='flex flex-col gap-4'>
                {channel.messages.map((messageId: string) => (
                  <Card key={messageId}>
                    <div class="flex items-center">
                      <a target='_blank' href={`https://discord.com/channels/${guild.id}/${channel.id}/${messageId}`} class="flex flex-1 gap-3 justify-start font-bold text-slate-100 text-2xl">
                        <Link width="30" />
                        <span class="flex flex-col">
                          <span>
                              Go to message
                          </span>
                          <span class="text-xs font-normal text-slate-200">
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
                          return <Card key={rr.roleId} row>
                            <div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
                              {rr.emojiId.startsWith('https') ? <img src={rr.emojiId} class="w-12 h-auto" width={48} height={48}/> : <p class="text-4xl py-1">{rr.emojiId}</p>}
                            </div>
                            <div class="flex-1">
                              <h1 class="font-bold text-slate-100 text-md" style={{ color: '#' + (role?.color ? role.color.toString(16) : 'ffffff') }}>@ {role?.name ?? 'Role Not Found.'}</h1>
                              <p class="flex">
                                {rr.type == 'switch' ? 'Add by reacting / Remove by unreacting' : 'Add / Remove by reacting'}<br />
                                {rr.silent == 'true' && 'Keep quiet when reacting / unreacting'}
                              </p>
                            </div>
                            <div class="flex flex-col justify-center gap-4">
                              <Toggle onColor="purple" checkbox id={`select-${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`} checked={store.rrselected.includes(`${rr.emojiId.startsWith('https') ? rr.emojiId.split('emojis/')[1] : rr.emojiId}-${rr.messageId}`)} onChange$={async (event: any) => {
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
                ))}
              </div>
            </div>
          ))
        }
      </div>
      <div class={`relative z-10 ${store.modal ? '' : 'pointer-events-none'}`}>
        <div class={`fixed inset-0 z-10 ${store.modal ? 'bg-gray-900/30' : 'opacity-0'} transition overflow-y-auto`}>
          <div class="flex min-h-full max-h-full items-start justify-center p-4 pt-24 text-center sm:items-center">
            <Card class={{ 'backdrop-blur-xl text-start': true }}>
              <h1 class="flex-1 justify-start font-bold text-slate-100 text-2xl">
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
                <Dropdown id="rrcreaterole" values={[
                  ...roles.map(r => ({ value: r.id, name: `@ ${r.name}` })),
                ]}>
                  The role to be given
                </Dropdown>
                <Dropdown id="rrcreatechannel" values={[
                  ...channels.filter(c => c.type == ChannelType.GuildText).map(c => ({ value: c.id, name: `# ${c.name}` })),
                ]}>
                  Select the channel the reaction role will be in
                </Dropdown>
                <div class={{
                  'hidden': store.modal != 'create',
                }}>
                  <TextInput id="rrcreatemessage" placeholder="1105427534889353317">
                    The Id of the message you want to create the reaction role in
                  </TextInput>
                </div>
                <Dropdown id="rrcreateswitch" values={[
                  { value: 'switch', name: 'Add by reacting / Remove by unreacting' },
                  { value: 'toggle', name: 'Add / Remove by reacting' },
                ]}>
                  Reaction role behavior
                </Dropdown>
                <Toggle onColor='purple' label="Silent" id="rrcreatesilent"/>
              </div>
              <div class="flex flex-row-reverse gap-3">
                <Button color="purple" onClick$={async () => {
                  store.loading.push('rrcreate');
                  const emojiId = document.getElementById('rrcreateemoji')!.getAttribute('value')!;
                  const roleId = document.getElementById('rrcreaterole')!as HTMLSelectElement;
                  const channelId = document.getElementById('rrcreatechannel')! as HTMLSelectElement;
                  const messageId = document.getElementById('rrcreatemessage')! as HTMLInputElement;
                  const type = document.getElementById('rrcreateswitch')! as HTMLSelectElement;
                  const silent = document.getElementById('rrcreatesilent')! as HTMLInputElement;

                  try {
                    await upsertReactionRoleFn({
                      guildId: guild.id,
                      emojiId,
                      roleId: roleId.value,
                      channelId: channelId.value,
                      messageId: messageId.value,
                      type: type.value,
                      silent: silent.checked ? 'true' : 'false',
                    });
                  }
                  catch (e) {
                    console.error(e);
                    store.loading = store.loading.filter(l => l != 'rrcreate');
                    return;
                  }

                  store.reactionroles = await getReactionRolesFn(channels);
                  store.loading = store.loading.filter(l => l != 'rrcreate');
                  store.modal = undefined;
                }}>
                  {store.modal == 'edit' ? 'Edit' : 'Create'}
                  <div class={{
                    'transition-all': true,
                    '-ml-9 opacity-0': !store.loading.includes('rrcreate'),
                    '-ml-1 opacity-100': store.loading.includes('rrcreate'),
                  }}>
                    <LoadingIcon width={24} />
                  </div>
                </Button>
                <Button onClick$={() => store.modal = undefined}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {
        !!store.rrselected.length &&
        <div id="rrselected" class="fixed flex flex-col bottom-4 right-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md p-6" style="cursor: auto;">
          <p class="text-slate-200 text-lg mb-5 max-w-[17rem]">
            {store.rrselected.length} Reaction Roles Selected
          </p>
          <div class="flex items-center gap-2 justify-evenly">
            <Button onClick$={async () => {
              store.rrselected = [];
            }}>
              Cancel
            </Button>
            <Button color="red" onClick$={async () => {
              store.loading.push('rrdelete');
              for (const rr of store.rrselected) {
                const emojiId = rr.split('-')[0];
                const messageId = rr.split('-')[1];
                const channelId = reactionroles.channels.find(c => c.messages.includes(messageId))?.id as string;
                const guildId = guild.id;
                await deleteReactionRoleFn({ emojiId, messageId, channelId, guildId });
              }
              store.rrselected = [];
              store.reactionroles = await getReactionRolesFn(channels);
              store.loading = store.loading.filter(l => l != 'rrdelete');
            }}>
              <div class={{
                'transition-all': true,
                '-ml-10 opacity-0': !store.loading.includes('rrdelete'),
                '-ml-1 opacity-100': store.loading.includes('rrdelete'),
              }}>
                <LoadingIcon width={24} />
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
  title: 'Dashboard - Reaction Roles',
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