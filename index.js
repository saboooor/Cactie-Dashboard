const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Main client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	],
});
client.startTimestamp = Date.now();
client.config = require('./config.json');
for (const handler of fs.readdirSync('./handlers').filter(file => file.endsWith('.js'))) require(`./handlers/${handler}`)(client);