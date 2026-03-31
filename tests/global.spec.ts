import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { AISecurity, InfinityPortalAuth } from '../src/index';
import { logger, errorLogger } from '../src/core/debug.logger';

// load environment variable from .env file before all
if (existsSync('.env')) {
	dotenv.config();
}

export const ha = new AISecurity();

before(async () => {
	try {
		const infinityPortalAuth: InfinityPortalAuth = {
			accessKey: process.env.CP_CI_ACCESS_KEY as string,
			clientId: process.env.CP_CI_CLIENT_ID as string,
			gateway: process.env.CP_CI_GATEWAY as string,
		};

		logger(`Connecting to CI ...`);
		await ha.connect(infinityPortalAuth);
		logger(`Connecting to CI finished`);
	} catch (error) {
		errorLogger(`Unable to connecting ci -${JSON.stringify(error)}-, aborting tests.`);
		process.exit(1);
	}
});

after(async () => {
	try {
		logger(`Disconnecting from CI ...`);
		ha.disconnect();
		logger(`Disconnected`);
	} catch (error) {
		errorLogger(`Unable to disconnected -${JSON.stringify(error)}-`);
	}
});
