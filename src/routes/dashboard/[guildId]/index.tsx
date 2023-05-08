import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import type { APIChannel, APIGuild, APIRole, RESTError, RESTRateLimit } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import getAuth from '~/components/functions/auth';
import { MenuIndex, MenuCategory, MenuItem, MenuTitle } from '~/components/Menu';
import { PrismaClient } from '@prisma/client/edge';
import TextInput from '~/components/elements/TextInput';
import Toggle from '~/components/elements/Toggle';
import SelectInput, { RawSelectInput } from '~/components/elements/SelectInput';
import NumberInput from '~/components/elements/NumberInput';
import { Button } from '~/components/elements/Button';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Guild extends APIGuild {
  id: string;
  mutual: boolean;
}

export const onGet: RequestHandler = async ({ url, cookie, redirect, env }) => {
  const auth = await getAuth(cookie, env);
  if (!auth) {
    cookie.set('redirecturl', url.href, { path: '/' });
    throw redirect(302, '/login');
  }
};

export const useData = routeLoader$(async ({ url, redirect, params, env }) => {
  const guildres = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/preview`, {
    headers: {
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
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
      authorization: `Bot ${env.get('BOT_TOKEN')}`,
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

  const prisma = new PrismaClient({ datasources: { db: { url: env.get('DATABASE_URL') } } });
  const srvconfig = await prisma.settings.findUnique({
    where: {
      guildId: params.guildId,
    },
  });

  return { guild, channels, roles, srvconfig };
});

export default component$(() => {
  const guildData = useData();
  const { guild, channels, srvconfig } = guildData.value;
  return (
    <section class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 pt-6 sm:pt-12 min-h-[calc(100lvh-80px)]">
      <MenuIndex guild={guild}>
        <MenuCategory name="GENERAL SETTINGS">
          <MenuItem href="#">
            Prefix
          </MenuItem>
          <MenuItem href="#">
            Reactions
          </MenuItem>
          <MenuItem href="#">
            Suggestions
          </MenuItem>
          <MenuItem href="#">
            Polls
          </MenuItem>
        </MenuCategory>
        <MenuCategory name="MISCELLANEOUS">
          <MenuItem href="#">
            Join Message
          </MenuItem>
          <MenuItem href="#">
            Leave Message
          </MenuItem>
          <MenuItem href="#">
            Max PP Size
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
        <div class="grid sm:grid-cols-2 gap-6 py-10">
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Prefix</h1>
            <TextInput name="prefix" value={srvconfig?.prefix} placeholder="The bot's prefix">
              Cactie's text command prefix
            </TextInput>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <Toggle id="reactions" name="reactions" checked={srvconfig?.reactions == 'true'}>
              <span class="text-2xl font-bold">
                Reactions
              </span>
            </Toggle>
            <p class="text-gray-400 text-md mt-2.5">Reacts with various emojis on messages that have specific key-words</p>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Suggestions</h1>
            <SelectInput id="suggestionchannel" name="suggestionchannel" label="Channel to make suggestions in" value={srvconfig?.suggestionchannel} extraClass="mb-4">
              <option value="false">Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
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
            <SelectInput id="pollchannel" name="pollchannel" label="Channel to make polls in" value={srvconfig?.pollchannel}>
              <option value="false">Same channel as user</option>
              {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
              )}
            </SelectInput>
          </div>
        </div>
        <MenuTitle>Miscellaneous</MenuTitle>
        <div class="grid sm:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Join Message</h1>
            <TextInput big name="joinmessage" value={srvconfig?.joinmessage} placeholder="The content of the message sent when someone joins">
              The message when someone joins the server
            </TextInput>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Leave Message</h1>
            <TextInput big name="leavemessage" value={srvconfig?.leavemessage} placeholder="The content of the message sent when someone leaves">
              The message when someone leaves the server
            </TextInput>
          </div>
          <div class="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
            <h1 class="font-bold text-white text-2xl mb-2">Max PP Size</h1>
            <NumberInput input value={srvconfig?.maxppsize} name="maxppsize" id="maxppsize">
              The maximum size for the boner command
            </NumberInput>
          </div>
        </div>
        <MenuTitle>Audit Logs</MenuTitle>
        {(() => {
          const auditlogs = JSON.parse(srvconfig?.auditlogs ?? '{ channel: "false", logs: [] }');
          return (
            <div class="flex flex-col sm:flex-row gap-6 py-10">
              <div class="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                <h1 class="font-bold text-white text-2xl mb-2">Default Channel</h1>
                <SelectInput id="auditlogs-channel" name="auditlogs.channel" label="This is where audit logs without a channel specified will be posted" value={auditlogs.channel}>
                  <option value="false">No channel specified.</option>
                  {channels.filter(c => c.type == ChannelType.GuildText).map(c =>
                    <option value={c.id} key={c.id}>{`# ${c.name}`}</option>,
                  )}
                </SelectInput>
              </div>
              <div class="flex flex-col gap-2 bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                {
                  <>
                    <RawSelectInput id="new-log" label="Create a new log" value={auditlogs.channel}>
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
                  </>
                }
              </div>
            </div>
          );
        })()}
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