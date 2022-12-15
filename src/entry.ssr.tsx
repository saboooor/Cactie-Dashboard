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

import fs from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

import type { Connection } from 'mariadb/types';
import mysql from './mysql';

declare global {
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

global.sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

global.bot = {
	id: '765287593762881616',
	username: 'Cactie Dev',
	webp: `/assets/images/${'Cactie Dev'.replace(/ /g, '')}.webp`,
}

await mysql();

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