const Dashboard = require('../dashboard/dashboard.js');
const { ActivityType } = require('discord.js');
module.exports = client => client.once('ready', () => {
	client.user.setPresence({ activities: [{ name: 'Bot down!', type: ActivityType.Playing }] });
	Dashboard(client);
});