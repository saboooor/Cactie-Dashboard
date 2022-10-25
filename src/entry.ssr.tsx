/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is render outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import { renderToStream, RenderToStreamOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';
import { Client, Partials, GatewayIntentBits } from 'discord.js';

import { readFileSync } from 'fs';
import YAML from 'yaml';
const { con, dashboard } = YAML.parse(readFileSync('./config.yml', 'utf8'));

declare global { var client: any; var dashboardUrl: string; var sessions: any };
global.sessions = {};
global.client = new Client({
	shards: 'auto',
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.User,
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
	],
	allowedMentions: {
		parse: ['users', 'roles', 'everyone'],
	},
});

let domain;

try {
	const domainUrl = new URL(dashboard.domain);
	domain = {
		host: domainUrl.hostname,
		protocol: domainUrl.protocol,
	};
}
catch (e) {
	console.error(e);
	throw new TypeError('Invalid domain specified in config.yml');
}

if (dashboard.usingCustomDomain) client.dashboardDomain = `${domain.protocol}//${domain.host}`;
else client.dashboardDomain = `${domain.protocol}//${domain.host}${dashboard.port == 80 ? '' : `:${dashboard.port}`}`;

client.login(con.token);

client.on('ready', () => console.log(`Bot started, dashboard at ${client.dashboardDomain}`));

export default function (opts: RenderToStreamOptions) {
  // Render the elements
  return renderToStream(<Root />, {
    manifest,
    ...opts,
	containerAttributes: {
		lang: 'en',
	},
    prefetchStrategy: {
      implementation: {
        linkInsert: null,
        workerFetchInsert: null,
        prefetchEvent: 'always',
      },
    },
  });
}
