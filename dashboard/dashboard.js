// import modules.
const url = require('url');
const ejs = require('ejs');
const path = require('path');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const { PermissionsBitField } = require('discord.js');
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

	// initialize the memorystore middleware with our express app.
	app.use(
		session({
			store: new MemoryStore({ checkPeriod: 86400000 }),
			secret: client.config.secret,
			resave: false,
			saveUninitialized: false,
		}),
	);

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
		};
		// render template using the absolute path of the template and the merged default data with the additional data provided.
		res.render(
			path.resolve(`${templateDir}${path.sep}${template}`),
			Object.assign(baseData, data),
		);
	};

	// declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
	const checkAuth = (req, res, next) => {
		// If authenticated we forward the request further in the route.
		if (req.isAuthenticated()) return next();
		// If not authenticated, we set the url the user is redirected to into the memory.
		req.session.backURL = req.url;
		// redirect user to login endpoint/route.
		res.redirect('/login');
	};

	// Login endpoint.
	app.get(
		'/login',
		(req, res, next) => {
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
		},
		passport.authenticate('discord'),
	);

	// Callback endpoint.
	app.get(
		'/callback',
		passport.authenticate('discord', { failureRedirect: '/' }),
		(
			req,
			res,
		) => {
			// log when a user logs in
			client.logger.info(`User logged in: ${req.user.username}#${req.user.discriminator}`);
			// If user had set a returning url, we redirect him there, otherwise we redirect him to index.
			if (req.session.backURL) {
				const backURL = req.session.backURL;
				req.session.backURL = null;
				res.redirect(backURL);
			}
			else {
				res.redirect('/');
			}
		},
	);

	// Logout endpoint.
	app.get('/logout', function(req, res) {
		// destroy the session.
		req.session.destroy(() => {
			// logout the user.
			req.logout();
			// redirect user to index.
			res.redirect('/');
		});
	});

	// Index endpoint.
	app.get('/', (req, res) => renderTemplate(res, req, 'index.ejs'));

	app.get('/tos', (req, res) => renderTemplate(res, req, 'terms.ejs'));

	// Invite
	app.get('/invite', (req, res) => renderTemplate(res, req, 'invite.ejs'));
	app.get('/invite/discord', (req, res) => renderTemplate(res, req, 'invite/discord.ejs'));
	app.get('/invite/guilded', (req, res) => renderTemplate(res, req, 'invite/guilded.ejs'));

	// Dashboard endpoint.
	app.get('/dashboard', checkAuth, (req, res) => renderTemplate(res, req, 'dashboard.ejs', { perms: PermissionsBitField }));

	const wsurl = client.config.wsurl;
	app.get('/music', checkAuth, (req, res) => renderTemplate(res, req, 'music.ejs', { wsurl, perms: PermissionsBitField }));

	// Settings endpoint.
	app.get('/dashboard/:guildID', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildID);
		if (!guild) return res.redirect('/dashboard');
		let member = guild.members.cache.get(req.user.id);
		if (!member) {
			try {
				await guild.members.fetch();
				member = guild.members.cache.get(req.user.id);
			}
			catch (err) {
				client.logger.error(`Couldn't fetch the members of ${guild.id}: ${err}`);
			}
		}
		if (!member) return res.redirect('/dashboard');
		if (member.id != '249638347306303499' && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return res.redirect('/dashboard');
		}

		// retrive the settings stored for this guild.
		const storedSettings = await client.getData('settings', 'guildId', req.params.guildID);

		renderTemplate(res, req, 'settings.ejs', {
			guild,
			settings: storedSettings,
			alert: null,
		});
	});

	// Settings endpoint.
	app.post('/dashboard/:guildID', checkAuth, async (req, res) => {
		// validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
		const guild = client.guilds.cache.get(req.params.guildID);
		const setting = req.body;
		if (!guild) return res.redirect('/dashboard');
		const member = guild.members.cache.get(req.user.id);
		if (!member) return res.redirect('/dashboard');
		if (!member.permissions.has('MANAGE_GUILD')) {
			return res.redirect('/dashboard');
		}

		// save the settings.
		await client.query(`UPDATE settings SET 
    prefix="${setting.prefix ? setting.prefix : '-'}",
    leavemessage="${setting.leavemessage ? setting.leavemessage : 'false'}",
    joinmessage="${setting.joinmessage ? setting.joinmessage : 'false'}",
    maxppsize="${setting.maxppsize ? setting.maxppsize : '35'}",
    tickets="${setting.tickets ? setting.tickets : 'buttons'}",
    bonercmd="${setting.bonercmd ? setting.bonercmd : 'true'}",
    suggestionchannel="${setting.suggestionchannel ? setting.suggestionchannel : 'false'}",
    suggestthreads="${setting.suggestthreads ? setting.suggestthreads : 'true'}",
    pollchannel="${setting.pollchannel ? setting.pollchannel : 'false'}",
    logchannel="${setting.logchannel ? setting.logchannel : 'false'}",
    ticketcategory="${setting.ticketcategory ? setting.ticketcategory : 'false'}",
    supportrole="${setting.supportrole ? setting.supportrole : 'false'}",
    ticketmention="${setting.ticketmention ? setting.ticketmention : 'here'}",
    mutecmd="${setting.mutecmd ? setting.mutecmd : 'timeout'}",
    reactions="${setting.reactions ? setting.reactions : 'true'}",
    adminrole="${setting.adminrole ? setting.adminrole : 'permission'}",
    msgshortener="${setting.msgshortener ? setting.msgshortener : '30'}",
    djrole="${setting.djrole ? setting.djrole : 'false'}"
    WHERE guildId = "${req.params.guildID}"`).catch((e) => client.logger.error(e));

		// retrive the settings stored for this guild.
		const storedSettings = await client.getData('settings', 'guildId', req.params.guildID);

		// render the template with an alert text which confirms that settings have been saved.
		renderTemplate(res, req, 'settings.ejs', {
			guild,
			settings: storedSettings,
			alert: 'Your settings have been saved.',
		});
	});

	app.listen(client.config.port, null, null, () => {
		client.logger.info(`Dashboard running on port ${client.config.port}.`);
		const timer = (Date.now() - client.startTimestamp) / 1000;
		client.logger.info(`Done (${timer}s)! I am running!`);
	});
};