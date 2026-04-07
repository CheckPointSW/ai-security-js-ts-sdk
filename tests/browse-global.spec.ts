import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { BrowseSecurity, InfinityPortalAuth } from '../src/index';
import { logger, errorLogger } from '../src/core/debug.logger';

// load environment variable from .env file before all
if (existsSync('.env')) {
	dotenv.config();
}

export const hb = new BrowseSecurity();

before(async () => {
	try {
		const infinityPortalAuth: InfinityPortalAuth = {
			accessKey: process.env.CP_CI_ACCESS_KEY as string,
			clientId: process.env.CP_CI_CLIENT_ID as string,
			gateway: process.env.CP_CI_GATEWAY as string,
		};

		logger(`Connecting to CI (Browse Security) ...`);
		await hb.connect(infinityPortalAuth);
		logger(`Connecting to CI (Browse Security) finished`);
	} catch (error) {
		errorLogger(`Unable to connect (Browse Security) -${JSON.stringify(error)}-, aborting tests.`);
		process.exit(1);
	}
});

after(async () => {
	try {
		logger(`Disconnecting from CI (Browse Security) ...`);
		hb.disconnect();
		logger(`Disconnected (Browse Security)`);
	} catch (error) {
		errorLogger(`Unable to disconnect (Browse Security) -${JSON.stringify(error)}-`);
	}
});
