import express from "express";
import morgan from "morgan";
import path from "path";
import log from "./log";
import Config from "./classes/Config";
import { admin } from "./routes/admin";
import { repos } from "./routes/repos";

class ServerLogger implements morgan.StreamOptions {
	write(str: string): void { log.info(str); }
}

export default class Server {

	readonly server = express();

	private logger = new ServerLogger();

	constructor(config: Config) {
		this.server.locals.config = config;

		// log HTTP requests
		this.server.use(morgan('tiny', { stream: this.logger }));

		// host static react client resources
		this.server.use(express.static(path.resolve('public')));

		// define a route handle for the server configuration
		this.server.use('/admin', admin);

		// define a route handler for the repository inspection routines
		this.server.use('/api/repos', repos);

		// forward all other routes to the react client app
		this.server.get('*', (_, res) => {
			res.sendFile(path.resolve('public', 'index.html'));
		});
	}

	// start the server
	listen() {
		const port = process.env.PORT || 8080;
		this.server.listen( port, () => {
			log.info(`listening on port ${port}`);
		});
	}
}
