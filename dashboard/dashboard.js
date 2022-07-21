// import modules.
const url = require('url');
const ejs = require('ejs');
const path = require('path');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const Djs = require('discord.js');
const Strategy = require('passport-discord').Strategy;

// instantiate express app and the session store.
const app = express();
const MemoryStore = require('memorystore')(session);

// export the dashboard as a function which we call in ready event.
module.exports = async (client) => {
	// declare absolute paths.
	const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
	const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

	// Deserializing and serializing users without any additional logic.
	passport.serializeUser((user, done) => done(null, user));
	passport.deserializeUser((obj, done) => done(null, obj));

	// Validating the url by creating a new instance of an Url then assign an object with the host and protocol properties.
	// If a custom domain is used, we take the protocol, then the hostname and then we add the callback route.
	// Ex: Config key: https://localhost/ will have - hostname: localhost, protocol: http

	let domain;
	let callbackUrl;

	try {
		const domainUrl = new URL(client.config.domain);
		domain = {
			host: domainUrl.hostname,
			protocol: domainUrl.protocol,
		};
	}
	catch (e) {
		client.logger.error(e);
		throw new TypeError('Invalid domain specific in the client.config file.');
	}

	if (client.config.usingCustomDomain) {
		callbackUrl = `${domain.protocol}//${domain.host}/callback`;
	}
	else {
		callbackUrl = `${domain.protocol}//${domain.host}${
			client.config.port == 80 ? '' : `:${client.config.port}`
		}/callback`;
	}

	// This line is to inform users where the system will begin redirecting the users.
	// And can be removed.
	client.logger.info(`Callback URL: ${callbackUrl}`);

	// set the passport to use a new discord strategy, we pass in client id, secret, callback url and the scopes.
	/** Scopes:
	 *  - Identify: Avatar's url, username and discriminator.
	 *  - Guilds: A list of partial guilds.
	 */
	passport.use(
		new Strategy(
			{
				clientID: client.user.id,
				clientSecret: client.config.clientSecret,
				callbackURL: callbackUrl,
				scope: ['identify', 'guilds'],
			},
			(accessToken, refreshToken, profile, done) => {
				// On login we pass in profile with no logic.
				process.nextTick(() => done(null, profile));
			},
		),
	);

	// initialize the memorystore middleware with the express app.
	app.use(session({
		store: new MemoryStore({ checkPeriod: 86400000 }),
		secret: client.config.secret,
		resave: false,
		saveUninitialized: false,
	}));

	// initialize passport middleware.
	app.use(passport.initialize());
	app.use(passport.session());

	// bind the domain.
	app.locals.domain = client.config.domain.split('//')[1];

	// set out templating engine.
	app.engine('ejs', ejs.renderFile);
	app.set('view engine', 'ejs');

	// initialize body-parser middleware to be able to read forms.
	app.use(bodyParser.json());
	app.use(
		bodyParser.urlencoded({
			extended: true,
		}),
	);

	// host all of the files in the assets using their name in the root address.
	app.use('/', express.static(path.resolve(`${dataDir}${path.sep}static`), {
		extensions: ['html'],
	}));

	// declare a renderTemplate function to make rendering of a template in a route as easy as possible.
	const renderTemplate = (res, req, template, data = {}) => {
		// Default base data which passed to the ejs template by default.
		const baseData = {
			bot: client,
			path: req.path,
			user: req.isAuthenticated() ? req.user : null,
			Djs,
		};
		// render template using the absolute path of the template and the merged default data with the additional data provided.
		res.render(
			path.resolve(`${templateDir}${path.sep}${template}`),
			Object.assign(baseData, data),
		);
	};

	// declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect them.
	const checkAuth = (req, res, next) => {
		// If authenticated we forward the request further in the route.
		if (req.isAuthenticated()) return next();
		// If not authenticated, we set the url the user is redirected to into the memory.
		req.session.backURL = req.url;
		// redirect user to login endpoint/route.
		res.redirect('/login');
	};

	// Login endpoint.
	app.get('/login', (req, res, next) => {
		// determine the returning url.
		if (req.headers.referer) {
			const parsed = url.parse(req.headers.referer);
			if (parsed.hostname === app.locals.domain) {
				req.session.backURL = parsed.path;
			}
		}
		else {
			req.session.backURL = '/';
		}
		// Forward the request to the passport middleware.
		next();
	}, passport.authenticate('discord'));

	// Callback endpoint.
	app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
		// log when a user logs in
		client.logger.info(`User logged in: ${req.user.username}#${req.user.discriminator}`);
		// If user had set a returning url, we redirect them there, otherwise we redirect them to index.
		res.redirect(req.session.backURL ?? '/');
	});

	// Logout endpoint.
	app.get('/logout', function(req, res) {
		// destroy the session.
		req.session.destroy(() => {
			// logout the user.
			req.logout(() => {
				// redirect user to index.
				res.redirect('/');
			});
		});
	});

	// Index endpoint.
	app.get('/', (req, res) => renderTemplate(res, req, 'index.ejs'));

	app.get('/tos', (req, res) => renderTemplate(res, req, 'terms.ejs'));

	// Invite
	app.get('/invite', (req, res) => renderTemplate(res, req, 'invite.ejs'));
	app.get('/invite/:type', (req, res) => renderTemplate(res, req, `invite/${req.params.type}.ejs`));

	// Dashboard endpoint.
	app.get('/dashboard', checkAuth, (req, res) => renderTemplate(res, req, 'dashboard.ejs', { alert: null }));

	const wsurl = client.config.wsurl;
	app.get('/music', checkAuth, (req, res) => renderTemplate(res, req, 'music.ejs', { wsurl }));

	// Dashboard category endpoint.
	app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild) return res.redirect('/dashboard');

		// Render the dashboard for the server
		renderTemplate(res, req, 'category.ejs', { guild, alert: null });
	});

	// General endpoint.
	app.get('/dashboard/:guildId/:dashboardCategory', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild) return res.redirect('/dashboard');
		const member = await guild.members.fetch(req.user.id).catch(() => { return null; });
		if (!member || !member.permissions.has(Djs.PermissionsBitField.Flags.ManageGuild)) return renderTemplate(res, req, `${req.params.dashboardCategory}.ejs`, guild, { alert: 'You don\'t have the permission to change this server\'s settings!' });

		// retrive the settings stored for this guild.
		const settings = req.params.dashboardCategory == 'reactionroles' ? await client.query(`SELECT * FROM reactionroles WHERE guildId = '${guild.id}'`) : await client.getData('settings', 'guildId', guild.id);
		if (req.params.dashboardCategory == 'reactionroles') {
			for (const reactionrole of settings) {
				const channel = guild.channels.cache.get(reactionrole.channelId);
				if (!channel) continue;
				reactionrole.message = await channel.messages.fetch(reactionrole.messageId);
			}
		}
		renderTemplate(res, req, `${req.params.dashboardCategory}.ejs`, { guild, settings, alert: null });
	});

	// General endpoint.
	app.post('/settings/:guildId', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildId);
		const setting = req.body;
		if (!guild) return res.redirect('/dashboard');
		const member = guild.members.cache.get(req.user.id);
		if (!member || !member.permissions.has(Djs.PermissionsBitField.Flags.ManageGuild)) return renderTemplate(res, req, 'category.ejs', guild, { alert: 'You don\'t have the permission to change this server\'s settings!' });
		for (const key in setting) {
			let value = setting[key];
			if (Array.isArray(value)) value = value.join(',');
			console.log(value);
			await client.setData('settings', 'guildId', guild.id, key, setting[key] == '' ? 'false' : setting[key]);
		}

		// render the template with an alert text which confirms that settings have been saved.
		renderTemplate(res, req, 'category.ejs', {
			guild, alert: 'Your options have been saved.',
		});
	});

	// Reaction Roles endpoint.
	app.post('/reactionroles/:guildId', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildId);
		const setting = req.body;
		if (!guild) return res.redirect('/dashboard');
		const member = guild.members.cache.get(req.user.id);
		if (!member || !member.permissions.has(Djs.PermissionsBitField.Flags.ManageGuild)) return renderTemplate(res, req, 'category.ejs', guild, { alert: 'You don\'t have the permission to change this server\'s settings!' });
		for (const key in setting) {
			let value = setting[key];
			if (Array.isArray(value)) value = value.join(',');
			console.log(value);
			await client.setData('reactionroles', 'guildId', guild.id, key, setting[key] == '' ? 'false' : setting[key]);
		}

		// render the template with an alert text which confirms that settings have been saved.
		renderTemplate(res, req, 'reactionroles.ejs', {
			guild, alert: 'Your reaction roles have been saved.',
		});
	});

	// Reaction Roles deletion endpoint.
	app.post('/reactionroles/:guildId/delete', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild) return res.redirect('/dashboard');
		const member = await guild.members.fetch(req.user.id).catch(() => { return null; });
		if (!member || !member.permissions.has(Djs.PermissionsBitField.Flags.ManageGuild)) return renderTemplate(res, req, 'reactionroles.ejs', guild, { alert: 'You don\'t have the permission to change this server\'s settings!' });

		// delete the reaction role.
		let settings = await client.query(`SELECT * FROM reactionroles WHERE guildId = '${guild.id}'`);
		const rr = settings[req.body.id];
		if (!rr || !rr.messageId || !rr.emojiId) return renderTemplate(res, req, 'reactionroles.ejs', { guild, settings, alert: 'That reaction role doesn\'t exist.' });
		await client.query(`DELETE FROM reactionroles WHERE messageId = '${rr.messageId}' emojiId = '${rr.emojiId}'`);

		// retrive the settings stored for this guild.
		settings = await client.query(`SELECT * FROM reactionroles WHERE guildId = '${guild.id}'`);
		for (const reactionrole of settings) {
			const channel = guild.channels.cache.get(reactionrole.channelId);
			if (!channel) continue;
			reactionrole.message = await channel.messages.fetch(reactionrole.messageId);
		}

		// Response
		renderTemplate(res, req, 'reactionroles.ejs', { guild, settings, alert: 'The reaction role has been deleted.' });
	});

	app.listen(client.config.port, null, null, () => {
		client.logger.info(`Dashboard running on port ${client.config.port}.`);
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Done (${timer}s)! I am running!`);
	});
};
