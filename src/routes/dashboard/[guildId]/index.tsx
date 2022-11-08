import { Resource, component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useEndpoint } from "@builder.io/qwik-city";
import getAuth from "../../../auth";
import { ChannelType } from "discord.js";

interface guildData {
  guild: any;
  srvconfig: any;
}

interface obj {
  id: string;
  name: string;
  type?: number;
}

export const onGet: RequestHandler<guildData> = async ({
  url,
  params,
  request,
  response,
}) => {
  const auth = getAuth(request);
  if (!auth) {
    response.headers.set("Set-Cookie", `redirect.url=${url.href}`);
    throw response.redirect("/login");
  }
  const guild = client.guilds.cache.get(params.guildId);
  if (!guild) throw response.redirect(`/dashboard?error=guild_not_found`);
  const guildJSON: any = guild.toJSON();
  guildJSON.channels = guild.channels.cache.map((c) => {
    return { name: c.name, id: c.id, type: c.type };
  });
  guildJSON.roles = guild.roles.cache.map((r) => {
    return { name: r.name, id: r.id };
  });
  return {
    srvconfig: await db.getData("settings", { guildId: params.guildId }),
    guild: guildJSON,
  };
};

export default component$(() => {
  const GuildData = useEndpoint<guildData>();
  return (
    <section
      class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 pt-12"
      style="min-height: calc(100vh - 64px);"
    >
      <aside
        class="w-full sm:h-1 align-middle sm:sticky sm:top-28"
        aria-label="Sidebar"
      >
        <Resource
          value={GuildData}
          onPending={() => <span class="flex-1 ml-3">Loading...</span>}
          onRejected={() => <span class="flex-1 ml-3">Error</span>}
          onResolved={({ guild }) => {
            return (
              <p class="flex items-center p-6 text-base font-bold rounded-2xl mb-6 bg-gray-800 text-white">
                <img
                  class="w-10 h-10 rounded-full"
                  src={guild.iconURL ?? undefined}
                  alt={guild.name}
                ></img>
                <span class="flex-1 ml-3 text-lg">{guild.name}</span>
              </p>
            );
          }}
        />
        <div class="overflow-y-auto py-4 px-3 rounded-2xl bg-gray-800">
          <ul class="space-y-2">
            <li>
              <a
                href="#general"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                General Settings
              </a>
            </li>
            <li>
              <a
                href="#suggestpolls"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Suggestions / Polls
              </a>
            </li>
            <li>
              <a
                href="#misc"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Miscellaneous
              </a>
            </li>
            <li>
              <a
                href="#logging"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Audit Logs
              </a>
            </li>
            <li>
              <a
                href="#tickets"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Ticket System
              </a>
            </li>
            <li>
              <a
                href="#moderation"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Moderation
              </a>
            </li>
            <li>
              <a
                href="#reactionroles"
                class="flex flex-1 items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700"
              >
                Reaction Roles
              </a>
            </li>
          </ul>
        </div>
      </aside>
      <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
        <h1 class="font-bold tracking-tight text-white text-4xl" id="general">
          General Settings
        </h1>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">Prefix</h1>
            <p class="text-gray-400 text-md">Cactie's text command prefix</p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { prefix } }) => {
                return (
                  <input
                    type="text"
                    class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600"
                    placeholder="The bot's prefix"
                    value={prefix}
                  />
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <div class="sm:flex">
              <div>
                <label
                  for="reactions"
                  class="inline-flex relative items-center cursor-pointer mr-4"
                >
                  <Resource
                    value={GuildData}
                    onResolved={({ srvconfig: { reactions } }) => {
                      return (
                        <input
                          type="checkbox"
                          value=""
                          checked={reactions == "true"}
                          id="reactions"
                          class="sr-only peer"
                        />
                      );
                    }}
                  />
                  <div class="w-12 h-7 peer-focus:ring ring-indigo-600 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <h1 class="font-bold tracking-tight text-white text-2xl">
                Reactions
              </h1>
            </div>
            <p class="text-gray-400 text-md mt-2.5">
              Reacts with various reactions on messages with some words
            </p>
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 col-span-2 lg:col-span-1">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Language
            </h1>
            <p class="text-gray-400 text-md">The language Cactie will use</p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { language } }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={language == "false"}>
                      Use the server default
                    </option>
                    <option value="English" selected={language == "English"}>
                      English
                    </option>
                    <option
                      value="Portuguese"
                      selected={language == "Portuguese"}
                    >
                      Portuguese
                    </option>
                    <option value="Lispuwu" selected={language == "Lispuwu"}>
                      Lisp UwU
                    </option>
                    <option value="Uwu" selected={language == "Uwu"}>
                      UwU
                    </option>
                  </select>
                );
              }}
            />
          </div>
        </div>
        <h1
          class="font-bold tracking-tight text-white text-4xl"
          id="suggestpolls"
        >
          Suggestions / Polls
        </h1>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Suggestion Channel
            </h1>
            <p class="text-gray-400 text-md">
              This is where suggestions are made
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { suggestchannel },
                guild: { channels },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={suggestchannel == "false"}>
                      Same channel as user
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={suggestchannel == c.id}
                          >
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <div class="sm:flex">
              <div>
                <label
                  for="suggestthreads"
                  class="inline-flex relative items-center cursor-pointer mr-4"
                >
                  <Resource
                    value={GuildData}
                    onResolved={({ srvconfig: { suggestthreads } }) => {
                      return (
                        <input
                          type="checkbox"
                          value=""
                          checked={suggestthreads == "true"}
                          id="suggestthreads"
                          class="sr-only peer"
                        />
                      );
                    }}
                  />
                  <div class="w-12 h-7 peer-focus:ring ring-indigo-600 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <h1 class="font-bold tracking-tight text-white text-2xl">
                Suggestion Threads
              </h1>
            </div>
            <p class="text-gray-400 text-md mt-2.5">
              Creates a thread for discussing a suggestion
            </p>
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2 lg:col-span-1">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Poll Channel
            </h1>
            <p class="text-gray-400 text-md">This is where polls are made</p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { pollchannel },
                guild: { channels },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={pollchannel == "false"}>
                      Same channel as user
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option value={c.id} selected={pollchannel == c.id}>
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
        </div>
        <h1 class="font-bold tracking-tight text-white text-4xl" id="misc">
          Miscellaneous
        </h1>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Join Message
            </h1>
            <p class="text-gray-400 text-md">
              The message when someone joins the server
            </p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { joinmessage } }) => {
                joinmessage = JSON.parse(joinmessage);
                return (
                  <textarea
                    class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600"
                    placeholder="The content of the message sent when someone joins"
                  >
                    {joinmessage.message}
                  </textarea>
                );
              }}
            />
            <p class="text-gray-400 text-md">
              Variables: {"{USER MENTION} {USER TAG}"}
            </p>
            <p class="font-bold text-white text-lg pt-2.5">
              The channel to post in
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { joinmessage },
                guild: { channels },
              }) => {
                joinmessage = JSON.parse(joinmessage);
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option
                      value="false"
                      selected={joinmessage.channel == "false"}
                    >
                      Use system channel
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={joinmessage.channel == c.id}
                          >
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Leave Message
            </h1>
            <p class="text-gray-400 text-md">
              The message when someone leaves the server
            </p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { leavemessage } }) => {
                leavemessage = JSON.parse(leavemessage);
                return (
                  <textarea
                    class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600"
                    placeholder="The content of the message sent when someone leaves"
                  >
                    {leavemessage.message}
                  </textarea>
                );
              }}
            />
            <p class="text-gray-400 text-md">
              Variables: {"{USER MENTION} {USER TAG}"}
            </p>
            <p class="font-bold text-white text-lg pt-2.5">
              The channel to post in
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { leavemessage },
                guild: { channels },
              }) => {
                leavemessage = JSON.parse(leavemessage);
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option
                      value="false"
                      selected={leavemessage.channel == "false"}
                    >
                      Use system channel
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={leavemessage.channel == c.id}
                          >
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2 lg:col-span-1">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Max PP Size
            </h1>
            <p class="text-gray-400 text-md">
              The maximum pp size for the boner commands
            </p>
            <div class="flex w-28 h-9 mt-2.5">
              <button
                data-action="decrement"
                onClick$={(element) => console.log(element)}
                class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-l-lg cursor-pointer"
              >
                -
              </button>
              <Resource
                value={GuildData}
                onResolved={({ srvconfig: { maxppsize } }) => {
                  return (
                    <input
                      type="number"
                      class="text-sm text-center w-full bg-gray-700 placeholder-gray-400 text-white focus:bg-gray-600 focus:ring ring-indigo-600"
                      value={maxppsize}
                    />
                  );
                }}
              />
              <button
                data-action="increment"
                onClick$={(element) => console.log(element)}
                class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-r-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <h1 class="font-bold tracking-tiught text-white text-4xl" id="logging">
          Audit Logs
        </h1>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6 col-span-1 lg:col-span-2 xl:col-span-3">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Default Channel
            </h1>
            <p class="text-gray-400 text-md">
              This is where audit logs without a channel specified will be
              posted
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { auditlogs },
                guild: { channels },
              }) => {
                auditlogs = JSON.parse(auditlogs);
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option
                      value="false"
                      selected={auditlogs.channel == "false"}
                    >
                      Use system channel
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={auditlogs.channel == c.id}
                          >
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { auditlogs }, guild: { channels } }) => {
                auditlogs = JSON.parse(auditlogs);
                if (auditlogs.logs?.all) {
                  return (
                    <>
                      <h1 class="font-bold tracking-tight text-white text-2xl">There's no more audit logs to add!</h1>
                    </>
                  )
                }
                return (
                  <>
                    <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mb-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
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
                            <option value="voicejoin">Joined Voice Channel</option>
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
                    </select>
                    <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mb-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                      <option value="false" selected>
                        Use Default Channel
                      </option>
                      {channels
                        .filter((c: obj) => c.type == ChannelType.GuildText)
                        .map((c: obj) => {
                          return <option value={c.id}># {c.name}</option>;
                        })}
                    </select>
                    <div class="rounded-md shadow">
                      <a class="flex w-full items-center justify-center rounded-lg border border-transparent bg-lime-600 p-2.5 text-sm font-bold text-gray-200 hover:bg-lime-500">
                        Add Audit Log
                      </a>
                    </div>
                  </>
                );
              }}
            />
          </div>
          <Resource
            value={GuildData}
            onResolved={({ guild: { channels }, srvconfig: { auditlogs } }) => {
              auditlogs = JSON.parse(auditlogs);
              const tiles = Object.keys(auditlogs.logs ?? {}).map((log) => {
                return (
                  <div class="bg-gray-800 rounded-2xl p-6">
                    <h1 class="float-left font-bold tracking-tight text-white text-2xl">
                      {log}
                    </h1>
                    <h1 class="float-right font-bold tracking-tight text-red-400 text-2xl">
                      X
                    </h1>
                    <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                      <option
                        value="false"
                        selected={auditlogs.logs[log].channel == "false"}
                      >
                        Use Default Channel
                      </option>
                      {channels
                        .filter((c: obj) => c.type == ChannelType.GuildText)
                        .map((c: obj) => {
                          return (
                            <option
                              value={c.id}
                              selected={auditlogs.logs[log].channel == c.id}
                            >
                              # {c.name}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                );
              });
              return <>{tiles}</>;
            }}
          />
        </div>
        <h1 class="font-bold tracking-tight text-white text-4xl" id="tickets">
          Ticket System
        </h1>
        <div class="grid md:grid-cols-6 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
            <h1 class="font-bold tracking-tight text-white text-2xl">Mode</h1>
            <p class="text-gray-400 text-md">
              This is how the bot will handle tickets
            </p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { tickets } }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={tickets == "false"}>
                      Disable Tickets
                    </option>
                    <option value="buttons" selected={tickets == "buttons"}>
                      Use buttons
                    </option>
                    <option value="reactions" selected={tickets == "reactions"}>
                      Use reactions
                    </option>
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Category
            </h1>
            <p class="text-gray-400 text-md">
              The category where tickets will appear
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { ticketcategory },
                guild: { channels },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={ticketcategory == "false"}>
                      No category
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildCategory)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={ticketcategory == c.id}
                          >
                            &gt; {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Log Channel
            </h1>
            <p class="text-gray-400 text-md">
              The channel where transcripts will appear
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { ticketlogchannel },
                guild: { channels },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option
                      value="false"
                      selected={ticketlogchannel == "false"}
                    >
                      No logs
                    </option>
                    {channels
                      .filter((c: obj) => c.type == ChannelType.GuildText)
                      .map((c: obj) => {
                        return (
                          <option
                            value={c.id}
                            selected={ticketlogchannel == c.id}
                          >
                            # {c.name}
                          </option>
                        );
                      })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-3">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Access Role
            </h1>
            <p class="text-gray-400 text-md">
              The role that may access tickets
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { supportrole },
                guild: { roles },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={supportrole == "false"}>
                      Only Administrators
                    </option>
                    {roles.map((r: obj) => {
                      return (
                        <option value={r.id} selected={supportrole == r.id}>
                          @ {r.name}
                        </option>
                      );
                    })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6 md:col-span-3">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Mention
            </h1>
            <p class="text-gray-400 text-md">
              Pings the specified role when a ticket is created
            </p>
            <Resource
              value={GuildData}
              onResolved={({
                srvconfig: { supportrole },
                guild: { roles },
              }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="false" selected={supportrole == "false"}>
                      No mention
                    </option>
                    <option
                      value="everyone"
                      selected={supportrole == "everyone"}
                    >
                      @ everyone
                    </option>
                    <option value="here" selected={supportrole == "here"}>
                      @ here
                    </option>
                    {roles.map((r: obj) => {
                      return (
                        <option value={r.id} selected={supportrole == r.id}>
                          @ {r.name}
                        </option>
                      );
                    })}
                  </select>
                );
              }}
            />
          </div>
        </div>
        <h1
          class="font-bold tracking-tight text-white text-4xl"
          id="moderation"
        >
          Moderation
        </h1>
        <div class="grid md:grid-cols-3 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Message Shortener
            </h1>
            <p class="text-gray-400 text-md">
              The amount of lines in a message to shorten into a link. To
              disable, set to 0
            </p>
            <div class="flex w-28 h-9 mt-2.5">
              <button
                data-action="decrement"
                onClick$={(element) => console.log(element)}
                class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-l-lg cursor-pointer"
              >
                -
              </button>
              <Resource
                value={GuildData}
                onResolved={({ srvconfig: { msgshortener } }) => {
                  return (
                    <input
                      type="number"
                      class="text-sm text-center w-full bg-gray-700 placeholder-gray-400 text-white focus:bg-gray-600 focus:ring ring-indigo-600"
                      value={msgshortener}
                    />
                  );
                }}
              />
              <button
                data-action="increment"
                onClick$={(element) => console.log(element)}
                class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-r-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Mute Command
            </h1>
            <p class="text-gray-400 text-md">
              Select a role to give when muting or use Discord's timeout feature
            </p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { mutecmd }, guild: { roles } }) => {
                return (
                  <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                    <option value="timeout" selected={mutecmd == "timeout"}>
                      Use Discord's timeout feature
                    </option>
                    {roles.map((r: obj) => {
                      return (
                        <option value={r.id} selected={mutecmd == r.id}>
                          @ {r.name}
                        </option>
                      );
                    })}
                  </select>
                );
              }}
            />
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              Disabled Commands
            </h1>
            <p class="text-gray-400 text-md">
              Disable certain commands from Cactie separated by commas
            </p>
            <Resource
              value={GuildData}
              onResolved={({ srvconfig: { disabledcmds } }) => {
                return (
                  <input
                    type="text"
                    class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600"
                    placeholder="Specify commands to disable, no spaces"
                    value={disabledcmds == "false" ? "" : disabledcmds}
                  />
                );
              }}
            />
          </div>
        </div>
        <h1
          class="font-bold tracking-tiught text-white text-4xl"
          id="reactionroles"
        >
          Reaction Roles
        </h1>
        <div class="grid xl:grid-cols-2 gap-6 py-10">
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              # channel1
            </h1>
            <div class="bg-gray-700 rounded-2xl p-6 mt-4">
              <h1 class="font-bold tracking-tight text-white text-xl">
                Message # 1018054551116464218
              </h1>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role1
                </h1>
              </div>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role2
                </h1>
              </div>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role3
                </h1>
              </div>
            </div>
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              # channel2
            </h1>
            <div class="bg-gray-700 rounded-2xl p-6 mt-4">
              <h1 class="font-bold tracking-tight text-white text-xl">
                Message # 3263453452344323242
              </h1>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role1
                </h1>
              </div>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role2
                </h1>
              </div>
            </div>
          </div>
          <div class="bg-gray-800 rounded-2xl p-6">
            <h1 class="font-bold tracking-tight text-white text-2xl">
              # channel3
            </h1>
            <div class="bg-gray-700 rounded-2xl p-6 mt-4">
              <h1 class="font-bold tracking-tight text-white text-xl">
                Message # 3463453245253226774
              </h1>
              <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                <h1 class="font-bold tracking-tight text-white text-lg">
                  @ role1
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead<guildData> = ({ data: { guild } }) => {
  return {
    title: "Dashboard",
    meta: [
      {
        name: "description",
        content: `Set the settings of ${guild.name}`,
      },
      {
        property: "og:description",
        content: `Set the settings of ${guild.name}`,
      },
    ],
  };
};
