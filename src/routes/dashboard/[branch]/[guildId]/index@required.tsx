import { component$, $, useStore } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import type { APIChannel, APIGuild, APIRole, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import { PrismaClient } from '@prisma/client/edge';
import { MenuIndex, MenuCategory, MenuItem, MenuTitle } from '~/components/Menu';
import TextInput from '~/components/elements/TextInput';
import Toggle from '~/components/elements/Toggle';
import SelectInput, { RawSelectInput } from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';
import { Close } from 'qwik-ionicons';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const useData = routeLoader$(async ({ url, redirect, params, env }) => {
  const guildres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/preview`, {
    headers: {
      authorization: `Bot ${env.get(`BOT_TOKEN${params.branch == 'dev' ? '_DEV' : ''}`)}`,
    },
  });
  const guild: RESTError | RESTRateLimit | Guild = await guildres.json();
  if ('retry_after' in guild) {
    console.log(`${guild.message}, retrying after ${guild.retry_after}ms`);
    await sleep(guild.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in guild) throw redirect(302, `/dashboard?error=${guild.code}&message=${guild.message}`);

  const channelsres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
    headers: {
      authorization: `Bot ${env.get(`BOT_TOKEN${params.branch == 'dev' ? '_DEV' : ''}`)}`,
    },
  });
  const channels: RESTError | RESTRateLimit | APIChannel[] = await channelsres.json();
  if ('retry_after' in channels) {
    console.log(`${channels.message}, retrying after ${channels.retry_after}ms`);
    await sleep(channels.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in channels) throw redirect(302, `/dashboard?error=${channels.code}&message=${channels.message}`);

  const rolesres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/roles`, {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
    },
  });
  const roles: RESTError | RESTRateLimit | APIRole[] = await rolesres.json();
  if ('retry_after' in roles) {
    console.log(`${roles.message}, retrying after ${roles.retry_after}ms`);
    await sleep(roles.retry_after);
    throw redirect(302, url.href);
  }
  if ('code' in roles) throw redirect(302, `/dashboard?error=${roles.code}&message=${roles.message}`);

  const prisma = new PrismaClient({ datasources: { db: { url: env.get(`DATABASE_URL${params.branch == 'dev' ? '_DEV' : ''}`) } } });
  const srvconfig = await prisma.settings.findUnique({
    where: {
      guildId: params.guildId,
    },
  });

  const reactionroles = {
    raw: await prisma.reactionroles.findMany({ where: { guildId: params.guildId } }),
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

export default component$(() => {
  const guildData = useData();
  const { guild, channels, roles, srvconfig, reactionroles } = guildData.value;

  const store = useStore({
    dev: undefined as boolean | undefined,
    modal: false,
  });

  return (
    <section class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 pt-6 sm:pt-12 min-h-[calc(100lvh-80px)]">
      <MenuIndex guild={guild} store={store} onSwitcherSwitch$={() => {}} >
        <MenuCategory name="GENERAL SETTINGS">
          <MenuItem href="#">
            Prefix
          </MenuItem>
          <MenuItem href="#">
            Suggestions
          </MenuItem>
          <MenuItem href="#">
            Polls
          </MenuItem>
          <MenuItem href="#">
            Join Message
          </MenuItem>
          <MenuItem href="#">
            Leave Message
          </MenuItem>
          <MenuItem href="#">
            Max PP Size
          </MenuItem>
          <MenuItem href="#">
            Reactions
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="TICKET SYSTEM">
          <MenuItem href="#">
            Mode
          </MenuItem>
          <MenuItem href="#">
            Category
          </MenuItem>
          <MenuItem href="#">
            Log Channel
          </MenuItem>
          <MenuItem href="#">
            Access Role
          </MenuItem>
          <MenuItem href="#">
            Mention
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="MODERATION">
          <MenuItem href="#">
            Message Shortener
          </MenuItem>
          <MenuItem href="#">
            Mute Command
          </MenuItem>
          <MenuItem href="#">
            Disabled Commands
          </MenuItem>
        </MenuCategory>
        <MenuItem href="#audit">
            Audit Logs
        </MenuItem>
        <MenuItem href="#reactionroles">
            Reaction Roles
        </MenuItem>
      </MenuIndex>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
        <MenuTitle>General Settings</MenuTitle>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Prefix</h1>
            <TextInput name="prefix" value={srvconfig?.prefix} placeholder="The bot's prefix">
              Cactie's text command prefix
            </TextInput>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Suggestions</h1>
            <SelectInput id="suggestionchannel" name="suggestionchannel" label="Channel to make suggestions in" extraClass="mb-4">
              <option value="false" selected={srvconfig?.suggestionchannel == 'false'}>Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.suggestionchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
            <Toggle id="suggestthreads" name="suggestthreads" checked={srvconfig?.suggestthreads == 'true'}>
              <span>
                Create threads associated to suggestions for discussion
              </span>
            </Toggle>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Polls</h1>
            <SelectInput id="pollchannel" name="pollchannel" label="Channel to make polls in">
              <option value="false" selected={srvconfig?.pollchannel == 'false'}>Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.pollchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </div>
          {(() => {
            const joinmessage = JSON.parse(srvconfig?.joinmessage ?? '{"message":"","channel":"false"}');
            return (
              <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                <h1 class="font-bold text-white text-2xl mb-2">Join Message</h1>
                <TextInput big id="joinmessage-message" name="joinmessage.message" value={joinmessage.message} placeholder="The content of the message sent when someone joins">
                    The message when someone joins the server
                </TextInput>
                <p class="mt-2 mb-4">
                  Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
                </p>
                <SelectInput id="joinmessage-channel" name="joinmessage.channel" label="Channel to send the message in">
                  <option value="false" selected={joinmessage.channel == 'false'}>System Channel</option>
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id} selected={joinmessage.channel == c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
              </div>
            );
          })()}
          {(() => {
            const leavemessage = JSON.parse(srvconfig?.joinmessage ?? '{"message":"","channel":"false"}');
            return (
              <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                <h1 class="font-bold text-white text-2xl mb-2">Leave Message</h1>
                <TextInput big id="leavemessage-message" name="leavemessage.message" value={leavemessage.message} placeholder="The content of the message sent when someone leaves">
                  The message when someone leaves the server
                </TextInput>
                <p class="mt-2 mb-4">
                  Placeholders: <code>{'{USER MENTION}'}</code> <code>{'{USERNAME}'}</code>
                </p>
                <SelectInput id="leavemessage-channel" name="leavemessage.channel" label="Channel to send the message in">
                  <option value="false" selected={leavemessage.channel == 'false'}>System Channel</option>
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id} selected={leavemessage.channel == c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
              </div>
            );
          })()}
          <div class="grid gap-6">
            <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
              <h1 class="font-bold text-white text-2xl mb-2">Max PP Size</h1>
              <NumberInput input value={srvconfig?.maxppsize} name="maxppsize" id="maxppsize">
                The maximum size for the boner command
              </NumberInput>
            </div>
            <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
              <Toggle id="reactions" name="reactions" checked={srvconfig?.reactions == 'true'}>
                <span class="text-2xl font-bold">
                  Reactions
                </span>
              </Toggle>
              <p class="text-gray-400 text-md mt-2.5">Reacts with various emojis on messages that have specific key-words</p>
            </div>
          </div>
        </div>
        <MenuTitle>Ticket System</MenuTitle>
        <div class="flex flex-wrap gap-6 py-10">
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Mode</h1>
            <SelectInput id="tickets" name="tickets" label="This is how the bot will handle tickets">
              <option value="false" selected={srvconfig?.tickets == 'false'}>Disable Tickets</option>
              <option value="buttons" selected={srvconfig?.tickets == 'buttons'}>Use buttons</option>
              <option value="reactions" selected={srvconfig?.tickets == 'reactions'}>Use reactions</option>
            </SelectInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Category</h1>
            <SelectInput id="ticketcategory" name="ticketcategory" label="The category where tickets will appear">
              <option value="false" selected={srvconfig?.ticketcategory == 'false'}>No Category</option>
              {channels.filter(c => c.type == ChannelType.GuildCategory).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.ticketcategory == c.id}>{`> ${c.name}`}</option>,
              )}
            </SelectInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Log Channel</h1>
            <SelectInput id="ticketlogchannel" name="ticketlogchannel" label="The channel where transcripts will appear">
              <option value="false" selected={srvconfig?.ticketlogchannel == 'false'}>Don't send transcripts</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id} selected={srvconfig?.ticketlogchannel == c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Access Role</h1>
            <SelectInput id="supportrole" name="supportrole" label="The role that may access tickets">
              <option value="false" selected={srvconfig?.supportrole == 'false'}>Only Administrators</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.supportrole == r.id}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Mention</h1>
            <SelectInput id="ticketmention" name="ticketmention" label="Pings the specified role when a ticket is created">
              <option value="false" selected={srvconfig?.ticketmention == 'false'}>No mention</option>
              <option value="everyone" selected={srvconfig?.ticketmention == 'everyone'}>@ everyone</option>
              <option value="here" selected={srvconfig?.ticketmention == 'here'}>@ here</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.ticketmention == r.id}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </div>
        </div>
        <MenuTitle>Moderation</MenuTitle>
        <div class="flex flex-wrap gap-6 py-10">
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Message Shortener</h1>
            <NumberInput input value={srvconfig?.msgshortener} name="msgshortener" id="msgshortener">
              The amount of lines in a message to shorten into a link. To disable, set to 0
            </NumberInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Mute Command</h1>
            <SelectInput id="ticketcategory" name="ticketcategory" label="Select a role to give when muting or use Discord's timeout feature">
              <option value="timeout" selected={srvconfig?.mutecmd == 'timeout'}>Use Discord's timeout feature</option>
              {roles.map(r =>
                <option value={r.id} key={r.id} selected={srvconfig?.mutecmd == r.id}>{`@ ${r.name}`}</option>,
              )}
            </SelectInput>
          </div>
          <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Disabled Commands</h1>
            <TextInput name="disabledcmds" value={srvconfig?.disabledcmds == 'false' ? '' : srvconfig?.disabledcmds} placeholder="Specify commands to disable, no spaces">
              Disable certain commands from Cactie separated by commas
            </TextInput>
          </div>
        </div>
        <MenuTitle>Audit Logs</MenuTitle>
        {(() => {
          const auditlogs = JSON.parse(srvconfig?.auditlogs ?? '{ channel: "false", logs: {} }');
          return <div class="py-10 flex flex-col gap-6">
            <div class="flex flex-col sm:flex-row gap-6">
              <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                <h1 class="font-bold text-white text-2xl mb-2">Default Channel</h1>
                <SelectInput id="auditlogs-channel" name="auditlogs.channel" label="This is where logs will be sent if there is no specific channel set on them">
                  <option value="false" selected={auditlogs.channel == 'false'}>No channel specified.</option>
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id} selected={auditlogs.channel == c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
              </div>
              <div class="flex flex-col gap-2 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                <RawSelectInput id="new-log">
                  <option value="all">All Logs</option>
                  {!auditlogs.logs?.member && (
                    <>
                      <option value="member">All Member-Related Logs</option>
                      {!auditlogs.logs?.memberjoin && (
                        <option value="memberjoin">Member Joined</option>
                      )}
                      {!auditlogs.logs?.memberleave && (
                        <option value="memberleave">Member Left</option>
                      )}
                    </>
                  )}
                  {!auditlogs.logs?.message && (
                    <>
                      <option value="message">All Message-Related Logs</option>
                      {!auditlogs.logs?.messagedelete && (
                        <option value="messagedelete">Message Deleted</option>
                      )}
                      {!auditlogs.logs?.messagedeletebulk && (
                        <option value="messagedeletebulk">Messages Bulk-Deleted</option>
                      )}
                      {!auditlogs.logs?.messageupdate && (
                        <option value="messageupdate">Message Edited</option>
                      )}
                    </>
                  )}
                  {!auditlogs.logs?.channel && (
                    <>
                      <option value="channel">All Channel-Related Logs</option>
                      {!auditlogs.logs?.channelcreate && (
                        <option value="channelcreate">Channel Created</option>
                      )}
                      {!auditlogs.logs?.channeldelete && (
                        <option value="channeldelete">Channel Deleted</option>
                      )}
                      {!auditlogs.logs?.channelupdate && (
                        <option value="channelupdate">Channel Updated</option>
                      )}
                    </>
                  )}
                  {!auditlogs.logs?.voice && (
                    <>
                      <option value="voice">All Voice-Related Logs</option>
                      {!auditlogs.logs?.voicejoin && (
                        <option value="voicejoin">Voice Channel</option>
                      )}
                      {!auditlogs.logs?.voiceleave && (
                        <option value="voiceleave">Left Voice Channel</option>
                      )}
                      {!auditlogs.logs?.voicemove && (
                        <option value="voicemove">Moved Voice Channels</option>
                      )}
                      {!auditlogs.logs?.voicedeafen && (
                        <option value="voicedeafen">Voice Deafened</option>
                      )}
                      {!auditlogs.logs?.voicemute && (
                        <option value="voicemute">Voice Muted</option>
                      )}
                    </>
                  )}
                </RawSelectInput>
                <RawSelectInput id="new-log-channel" label="The channel to associate this log to">
                  {auditlogs.channel != 'false' &&
                    <option value="false" selected>Default Channel</option>
                  }
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                  )}
                </RawSelectInput>
                <Button color="primary">
                  Add Audit Log
                </Button>
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-6">
              {
                Object.keys(auditlogs.logs).map((log, i) => {
                  return (
                    <div key={i} class="flex-1 flex flex-col bg-gray-800 border-2 border-gray-700 rounded-xl p-6 gap-4">
                      <div class="flex items-start flex-1">
                        <h1 class="flex-1 justify-start font-bold text-white text-2xl">
                          {log}
                        </h1>
                        <Close width="36" class="fill-red-400" />
                      </div>
                      <RawSelectInput id={`auditlogs-logs-${log}.channel`} name={`auditlogs.logs.${log}.channel`}>
                        <option value="false" selected={auditlogs.logs[log].channel == 'false'}>Default Channel</option>
                        {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                          <option value={c.id} key={c.id} selected={auditlogs.logs[log].channel == c.id}>{`# ${c.name}`}</option>,
                        )}
                      </RawSelectInput>
                    </div>
                  );
                })
              }
            </div>
          </div>;
        })()}
        <div class="flex">
          <MenuTitle extraClass="flex-1">Reaction Roles</MenuTitle>
          <Button color="primary" onClick$={() => store.modal = !store.modal}>
            Create Reaction Role
          </Button>
        </div>
        <div class="flex flex-col gap-6 py-10">
          {
            reactionroles.channels.map(channel => (
              <div key={channel.id} class="flex-1 flex flex-col bg-gray-800 border-2 border-gray-700 rounded-xl p-4 gap-4">
                <div class="flex items-start flex-1">
                  <h1 class="flex-1 justify-start font-bold text-white text-2xl">
                    # {channel?.name ?? 'Channel Not Found.'}
                  </h1>
                  <Button color="primary" small onClick$={() => store.modal = !store.modal}>
                    Create Here
                  </Button>
                </div>
                <div class='flex flex-col gap-4'>
                  {
                    channel.messages.map((messageId: string) => (
                      <div key={messageId} class="flex-1 flex flex-col bg-gray-900/50 border-2 border-gray-700 rounded-xl p-4 gap-4">
                        <div class="flex items-start flex-1">
                          <h1 class="flex-1 justify-start font-bold text-white text-2xl">
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

                              return <div key={rr.roleId} class="flex-1 min-w-max flex bg-gray-800 rounded-xl p-4 gap-4" onContextMenu$={(event) => openContextMenu(event, rr)} preventdefault:contextmenu>
                                <div class="p-1">
                                  {rr.emojiId.startsWith('https') ? <img src={rr.emojiId} class="w-12"/> : <p class="text-4xl py-1">{rr.emojiId}</p>}
                                </div>
                                <div>
                                  <h1 class="font-bold text-white text-md" style={{ color: role?.color }}>@ {role?.name ?? 'Role Not Found.'} <br class="hidden group-hover:inline-flex sm:group-hover:hidden"/><span class="font-normal hidden group-hover:inline-flex text-gray-400">Right click to edit</span></h1>
                                  <p class="hidden sm:flex">
                                    {rr.type == 'switch' ? 'Add by reacting / Remove by unreacting' : 'Add / Remove by reacting'}<br />
                                    {rr.silent == 'true' && 'Keep quiet when reacting / unreacting'}
                                  </p>
                                </div>
                              </div>;
                            })
                          }
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div class="hidden flex-col gap-2 py-3 px-2 rounded-xl bg-gray-900/50 backdrop-blur-lg border-2 border-gray-800 drop-shadow-lg absolute top-0" id="contextmenu" preventdefault:contextmenu>
        <RawSelectInput id="rrrole" name="rrrole" extraClass="text-sm bg-transparent hover:bg-gray-800">
          {roles.map(r =>
            <option value={r.id} key={r.id}>{`@ ${r.name}`}</option>,
          )}
        </RawSelectInput>
        <RawSelectInput id="rrswitch" name="rrswitch" extraClass="text-sm bg-transparent hover:bg-gray-800">
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
              <h1 class="flex-1 justify-start font-bold text-white text-2xl">
                Create Reaction Role
              </h1>
              <div class="flex flex-col my-4 gap-4">
                <div class="flex flex-col sm:flex-row gap-4">
                  <TextInput id="rrcreateemoji" name="rrcreateemoji" value="😃">
                    The emoji to react with
                  </TextInput>
                  <div class="flex-1">
                    <SelectInput id="rrcreaterole" name="rrcreaterole" label="The role to be given">
                      {roles.map(r =>
                        <option value={r.id} key={r.id}>{`@ ${r.name}`}</option>,
                      )}
                    </SelectInput>
                  </div>
                </div>
                <SelectInput id="rrcreatechannel" name="rrcreatechannel" label="Select the channel the reaction role will be in">
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
                <TextInput id="rrcreatemessage" name="rrcreatemessage" placeholder="1105427534889353317">
                  The Id of the message you want to create the reaction role in
                </TextInput>
                <SelectInput id="rrcreateswitch" name="rrcreateswitch" label="Reaction role behavior">
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