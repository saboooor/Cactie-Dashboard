import { Resource, component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { useEndpoint } from "@builder.io/qwik-city";
import getAuth from '../../../auth';

interface guildData {
  id: string,
  name: string,
  icon: string
};
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
  return GuildData.find((g: guildData) => g.id == params.guildId);
};

export default component$(() => {
    const GuildData = useEndpoint<guildData>();
    return (
        <section class="grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 mx-auto max-w-7xl sm:px-6 pt-12" style="height: calc(100vh - 64px);">
            <aside class="w-full align-middle" aria-label="Sidebar">
                <p class="flex items-center p-6 text-base font-bold sm:rounded-2xl sm:mb-6 bg-gray-800 text-white">
                    <Resource
                        value={GuildData}
                        onPending={() => <span class="flex-1 ml-3 whitespace-nowrap">Loading...</span>}
                        onRejected={() => <span class="flex-1 ml-3 whitespace-nowrap">Error</span>}
                        onResolved={(guild) => {
                            return (
                                <>
                                    <img class="w-10 h-10 rounded-full" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`}></img>
                                    <span class="flex-1 ml-3 whitespace-nowrap text-lg">{guild.name}</span>
                                </>
                            )
                        }}
                    />
                </p>
                <div class="overflow-y-auto py-4 px-3 sm:rounded-2xl bg-gray-800">
                    <ul class="space-y-2">
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">General Settings</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Suggestions / Polls</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Fun Commands</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Logging</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Ticket System</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Moderation</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-2 text-base font-normal rounded-xl text-white hover:bg-gray-700">
                                <span class="flex-1 whitespace-nowrap">Reaction Roles</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
            <div class="sm:col-span-2 lg:col-span-3">
                <h1 class="font-bold tracking-tight text-white text-4xl">General</h1>
                <div class="grid md:grid-cols-3 gap-6 py-10">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Prefix</h1>
                        <p class="text-gray-400 text-md">Cactie's text command prefix</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Reactions</h1>
                        <p class="text-gray-400 text-md">Reacts with various reactions on some words</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Language</h1>
                        <p class="text-gray-400 text-md">The language Cactie will use</p>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl">Suggestions / Polls</h1>
                <div class="grid md:grid-cols-3 gap-6 py-10">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Suggestion Channel</h1>
                        <p class="text-gray-400 text-md">This is where suggestions are made</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Suggestion Threads</h1>
                        <p class="text-gray-400 text-md">Creates a thread for discussing a suggestion</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Poll Channel</h1>
                        <p class="text-gray-400 text-md">This is where polls are made</p>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl">Fun Commands</h1>
                <div class="grid gap-6 py-10">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Max PP Size</h1>
                        <p class="text-gray-400 text-md">The maximum pp size for the boner commands</p>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl">Logging</h1>
                <div class="grid md:grid-cols-2 gap-6 py-10">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Join Message</h1>
                        <p class="text-gray-400 text-md">The message when someone joins the server</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Leave Message</h1>
                        <p class="text-gray-400 text-md">The message when someone leaves the server</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Audit Logs</h1>
                        <p class="text-gray-400 text-md">Logs certain activities in the server</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Log Channel</h1>
                        <p class="text-gray-400 text-md">This is where Audit Logs will be posted</p>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl">Tickets</h1>
                <div class="grid md:grid-cols-3 gap-6 pt-10 pb-3">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Toggle</h1>
                        <p class="text-gray-400 text-md">Enables the ticket system</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Category</h1>
                        <p class="text-gray-400 text-md">The category where tickets will appear</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Log Channel</h1>
                        <p class="text-gray-400 text-md">The channel where ticket transcripts will appear</p>
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-6 pt-3 pb-10">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Access Role</h1>
                        <p class="text-gray-400 text-md">The role that may access tickets</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Mention</h1>
                        <p class="text-gray-400 text-md">Pings the specified role when a ticket is created</p>
                    </div>
                </div>
                <h1 class="font-bold tracking-tight text-white text-4xl">Moderation</h1>
                <div class="grid md:grid-cols-2 gap-6 pt-10 pb-3">
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Message Shortener</h1>
                        <p class="text-gray-400 text-md">The amount of lines in a message to delete and shorten to an external link. To disable, set to 0</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Mute Command</h1>
                        <p class="text-gray-400 text-md">Specify how Cactie will mute people</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">Disabled Commands</h1>
                        <p class="text-gray-400 text-md">Disable certain commands from Cactie</p>
                    </div>
                    <div class="bg-gray-800 sm:rounded-2xl p-6">
                        <h1 class="font-bold tracking-tight text-white text-2xl">DJ Role</h1>
                        <p class="text-gray-400 text-md">Limit the music control commands to a role when the voice chat has more than 1 user</p>
                    </div>
                </div>
            </div>
        </section>
    );
});

export const head: DocumentHead = {
  title: 'Dashboard',
};