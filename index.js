const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Main client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	],
});
client.type = { color: '\u001b[33m', name: 'main' };
client.startTimestamp = Date.now();
client.config = require('./config.json');
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(client);

// Dev client
const devclient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	],
});
devclient.type = { color: '\u001b[34m', name: 'dev' };
devclient.startTimestamp = Date.now();
devclient.config = { ...client.config, ...client.config.dev };
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(devclient);