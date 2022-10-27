import { Resource, component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { useEndpoint } from "@builder.io/qwik-city";
import getAuth from '../../../auth';

type EndpointData = guildData | null;
interface guildData {
  id: string,
  name: string,
  icon: string
}

export const onGet: RequestHandler<guildData[]> = async ({ url, params, request, response }) => {
  const auth = getAuth(request);
  if (!auth) {
    response.headers.set('Set-Cookie', `redirect.url=${url.href}`);
    throw response.redirect('/login');
  }
  const res = await fetch(`https://discord.com/api/users/@me/guilds`, {
    headers: {
      authorization: `${auth.token_type} ${auth.access_token}`,
    },
  })
  const GuildData = await res.json();
  if (GuildData.message) {
    if (!GuildData.retry_after) throw response.redirect('/dashboard');
    console.log(`Guild data rate limit retrying after ${GuildData.retry_after}ms`)
    await sleep(GuildData.retry_after);
    throw response.redirect(url.href);
  }
  return GuildData.find((g: guildData) => g.id == params.guildId);
};

export default component$(() => {
    const GuildData = useEndpoint<guildData>();
    return (
        <section class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-auto max-w-screen-2xl px-4 sm:px-6 pt-12" style="height: calc(100vh - 64px);">
            <aside class="w-full sm:h-1 align-middle sm:sticky sm:top-28" aria-label="Sidebar">
                <p class="flex items-center p-6 text-base font-bold rounded-2xl mb-6 bg-gray-800 text-white">
                    <Resource
                        value={GuildData}
                        onPending={() => <span class="flex-1 ml-3">Loading...</span>}
                        onRejected={() => <span class="flex-1 ml-3">Error</span>}
                        onResolved={(guild) => {
                            return (
                                <>
                                    <img class="w-10 h-10 rounded-full" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`} alt={guild.name} ></img>
                                    <span class="flex-1 ml-3 text-lg">{guild.name}</span>
                                </>
                            )
                        }}
                    />
                </p>
                <div class="overflow-y-auto py-4 px-3 rounded-2xl bg-gray-800">
                    <ul class="space-y-2">
                        <li>
                            <a href="#general" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">General Settings</span>
                            </a>
                        </li>
                        <li>
                            <a href="#suggestpolls" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Suggestions / Polls</span>
                            </a>
                        </li>
                        <li>
                            <a href="#misc" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Miscellaneous</span>
                            </a>
                        </li>
                        <li>
                            <a href="#logging" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Audit Logs</span>
                            </a>
                        </li>
                        <li>
                            <a href="#tickets" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Ticket System</span>
                            </a>
                        </li>
                        <li>
                            <a href="#moderation" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Moderation</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1">Reaction Roles</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
            <div class="sm:col-span-2 lg:col-span-3 2xl:col-span-4">
                <h1 class="font-bold tracking-tight text-white text-4xl" id="general">General Settings</h1>
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Prefix</h1>
                        <p class="text-gray-400 text-md">Cactie's text command prefix</p>
                        <input type="text" class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600" placeholder="The bot's prefix" />
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <div class="sm:flex">
                            <div>
                                <label for="reactions" class="inline-flex relative items-center cursor-pointer mr-4">
                                    <input type="checkbox" value="" id="reactions" class="sr-only peer"/>
                                    <div class="w-12 h-7 peer-focus:ring ring-indigo-600 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <h1 class="font-bold tracking-tight text-white text-2xl">Reactions</h1>
                        </div>
                        <p class="text-gray-400 text-md mt-2.5">Reacts with various reactions on messages with some words</p>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 col-span-2 lg:col-span-1">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Language</h1>
                        <p class="text-gray-400 text-md">The language Cactie will use</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">Use the server default</option>
                            <option value="English">English</option>
                            <option value="Portuguese">Portuguese</option>
                            <option value="Lispuwu">Lisp UwU</option>
                            <option value="Uwu">UwU</option>
                        </select>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl" id="suggestpolls">Suggestions / Polls</h1>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Suggestion Channel</h1>
                        <p class="text-gray-400 text-md">This is where suggestions are made</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <div class="sm:flex">
                            <div>
                                <label for="suggestthreads" class="inline-flex relative items-center cursor-pointer mr-4">
                                    <input type="checkbox" value="" id="suggestthreads" class="sr-only peer"/>
                                    <div class="w-12 h-7 peer-focus:ring ring-indigo-600 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            <h1 class="font-bold tracking-tight text-white text-2xl">Suggestion Threads</h1>
                        </div>
                        <p class="text-gray-400 text-md mt-2.5">Creates a thread for discussing a suggestion</p>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2 lg:col-span-1">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Poll Channel</h1>
                        <p class="text-gray-400 text-md">This is where polls are made</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl" id="misc">Miscellaneous</h1>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Join Message</h1>
                        <p class="text-gray-400 text-md">The message when someone joins the server</p>
                        <textarea class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600" placeholder="The content of the message sent when someone joins" />
                        <p class="text-gray-400 text-md">Variables: {'{USER MENTION} {USER TAG}'}</p>
                        <p class="font-bold text-white text-lg pt-2.5">The channel to post in</p>
                        <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Leave Message</h1>
                        <p class="text-gray-400 text-md">The message when someone leaves the server</p>
                        <textarea class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600" placeholder="The content of the message sent when someone leaves" />
                        <p class="text-gray-400 text-md">Variables: {'{USER MENTION} {USER TAG}'}</p>
                        <p class="font-bold text-white text-lg pt-2.5">The channel to post in</p>
                        <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2 lg:col-span-1">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Max PP Size</h1>
                        <p class="text-gray-400 text-md">The maximum pp size for the boner commands</p>
                        <div class="flex w-28 h-9 mt-2.5">
                            <button data-action="decrement" onClick$={(element) => console.log(element)} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-l-lg cursor-pointer">
                                -
                            </button>
                            <input type="number" class="text-sm text-center w-full bg-gray-700 placeholder-gray-400 text-white focus:bg-gray-600 focus:ring ring-indigo-600" value="0" />
                            <button data-action="increment" onClick$={(element) => console.log(element)} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-r-lg cursor-pointer">
                                +
                            </button>
                        </div>
                    </div>
                </div>
                <h1 class="font-bold tracking-tiught text-white text-4xl" id="logging">Audit Logs</h1>
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6 col-span-2 lg:col-span-3 xl:col-span-4">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Default Log Channel</h1>
                        <p class="text-gray-400 text-md">This is where audit logs without a channel specified will be posted</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">[Log Name]</h1>
                        <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">Use Default Channel</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <select class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mb-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="all">All Logs</option>
                            <option value="member">All Member-Related Logs</option>
                            <option value="memberjoin">Member Joined</option>
                            <option value="memberleave">Member Left</option>
                            <option value="message">All Message-Related Logs</option>
                            <option value="messagedelete">Message Deleted</option>
                            <option value="messagedeletebulk">Messages Bulk-Deleted</option>
                            <option value="messageupdate">Message Edited</option>
                            <option value="channel">All Channel-Related Logs</option>
                            <option value="channelcreate">Channel Created</option>
                            <option value="channeldelete">Channel Deleted</option>
                            <option value="channelupdate">Channel Updated</option>
                            <option value="voice">All Voice-Related Logs</option>
                            <option value="voicejoin">Joined Voice Channel</option>
                            <option value="voiceleave">Left Voice Channel</option>
                            <option value="voicemove">Moved Voice Channels</option>
                            <option value="voicedeafen">Voice Deafened</option>
                            <option value="voicemute">Voice Muted</option>
                        </select>
                        <div class="rounded-md shadow">
                            <a href="/invite" class="flex w-full items-center justify-center rounded-lg border border-transparent bg-lime-600 p-2.5 text-sm font-bold text-gray-200 hover:bg-lime-500">
                                Add Audit Log
                            </a>
                        </div>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl" id="tickets">Ticket System</h1>
                <div class="grid md:grid-cols-6 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Mode</h1>
                        <p class="text-gray-400 text-md">This is how the bot will handle tickets</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">Disable Tickets</option>
                            <option value="buttons">Use buttons</option>
                            <option value="reactions">Use reactions</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Category</h1>
                        <p class="text-gray-400 text-md">The category where tickets will appear</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH CATEGORY CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-2">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Log Channel</h1>
                        <p class="text-gray-400 text-md">The channel where ticket transcripts will appear</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH TEXT CHANNELS</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-3">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Access Role</h1>
                        <p class="text-gray-400 text-md">The role that may access tickets</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH ROLES</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6 md:col-span-3">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Mention</h1>
                        <p class="text-gray-400 text-md">Pings the specified role when a ticket is created</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH ROLES</option>
                        </select>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl" id="moderation">Moderation</h1>
                <div class="grid md:grid-cols-2 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Message Shortener</h1>
                        <p class="text-gray-400 text-md">The amount of lines in a message to shorten into a link. To disable, set to 0</p>
                        <div class="flex w-28 h-9 mt-2.5">
                            <button data-action="decrement" onClick$={(element) => console.log(element)} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-l-lg cursor-pointer">
                                -
                            </button>
                            <input type="number" class="text-sm text-center w-full bg-gray-700 placeholder-gray-400 text-white focus:bg-gray-600 focus:ring ring-indigo-600" value="0" />
                            <button data-action="increment" onClick$={(element) => console.log(element)} class="bg-gray-600 text-white text-2xl hover:bg-gray-500 h-full w-20 rounded-r-lg cursor-pointer">
                                +
                            </button>
                        </div>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Mute Command</h1>
                        <p class="text-gray-400 text-md">Select a role to give when muting or use Discord's timeout feature</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="timeout">Use Discord's timeout feature</option>
                            <option value="false">FILL WITH ROLES</option>
                        </select>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Disabled Commands</h1>
                        <p class="text-gray-400 text-md">Disable certain commands from Cactie separated by commas</p>
                        <input type="text" class="text-sm rounded-lg w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600" placeholder="Specify commands to disable, no spaces" />
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">DJ Role</h1>
                        <p class="text-gray-400 text-md">Limit music control commands to a role when the VC has more than 1 user</p>
                        <select class="text-sm rounded-lg max-w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white mt-2.5 focus:bg-gray-600 focus:ring ring-indigo-600">
                            <option value="false">FILL WITH ROLES</option>
                        </select>
                    </div>
                </div>
                <h1 class="font-bold tracking-tiught text-white text-4xl" id="reactionroles">Reaction Roles</h1>
                <div class="grid xl:grid-cols-2 gap-6 py-10">
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl"># channel1</h1>
                        <div class="bg-gray-700 rounded-2xl p-6 mt-4">
                            <h1 class="font-bold tracking-tight text-white text-xl">Message # 1018054551116464218</h1>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role1</h1>
                            </div>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role2</h1>
                            </div>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role3</h1>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl"># channel2</h1>
                        <div class="bg-gray-700 rounded-2xl p-6 mt-4">
                            <h1 class="font-bold tracking-tight text-white text-xl">Message # 3263453452344323242</h1>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role1</h1>
                            </div>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role2</h1>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-800 rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl"># channel3</h1>
                        <div class="bg-gray-700 rounded-2xl p-6 mt-4">
                            <h1 class="font-bold tracking-tight text-white text-xl">Message # 3463453245253226774</h1>
                            <div class="bg-gray-600 rounded-2xl p-6 mt-4">
                                <h1 class="font-bold tracking-tight text-white text-lg">@ role1</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export const head: DocumentHead<EndpointData> = ({ data }) => {
    return {
        title: 'Dashboard',
        meta: [
            {
                name: 'description',
                property: 'og:description',
                content: `Set the settings of ${data?.name}`
            }
        ]
    }
}