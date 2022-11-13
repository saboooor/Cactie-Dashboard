/* eslint-disable no-var */
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

import fs from 'fs';
import YAML from 'yaml';
const { con, dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

import type { Connection } from 'mariadb/types';
import mysql from './mysql';

declare global {
	var client: Client;
	var bot: {
		id: string;
		username: string;
		webp: string;
	};
	var dashboardUrl: string;
	var sessions: any;
	var sleep: { (ms: number): Promise<undefined> };
	var db: {
		con: Connection;
		createData(table: string, body: any): Promise<any>;
		delData(table: string, where: any): Promise<any>;
		getData(table: string, where: any, options?: any): Promise<any>;
		setData(table: string, where: any, body: any): Promise<any>;
	};
}

if (dashboard.debug && !fs.existsSync('./sessions.json')) fs.writeFileSync('./sessions.json', '{}');

global.sessions = dashboard.debug ? JSON.parse(`${fs.readFileSync('./sessions.json')}`) : {};

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

global.sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


await client.login(con.token);
global.bot = {
	id: client.user!.id,
	username: client.user!.username,
	webp: `/assets/images/${client.user!.username.replace(/ /g, '')}.webp`,
}

await mysql(client);

client.on('ready', () => {
	console.log(`Bot started, dashboard at ${dashboard.domain}`);
});
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