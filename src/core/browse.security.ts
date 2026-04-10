import { InfinityPortalAuth, SDKConnectionState } from '../interfaces/infra';
import { SessionManager } from './session.manager';
import { logger } from './debug.logger';
import { Configuration } from '../generated-browse';
import { ApiAccessors } from '../generated-browse';

export class BrowseSecurity extends ApiAccessors {
	private sessionManager: SessionManager;

	constructor() {
		super();
		this.sessionManager = new SessionManager();
		logger(`A new BrowseSecurity instance created, version info: ${BrowseSecurity.info()}`);
	}

	public async connect(auth: InfinityPortalAuth): Promise<void> {
		await this.sessionManager.connect(auth);
	}

	public disconnect(): void {
		this.sessionManager.disconnect();
	}

	public connectionState(): SDKConnectionState {
		return this.sessionManager.connectionState();
	}

	public static info(): string {
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const build = require('../generated-browse/build.json');
			return `sdk_build:"${build.buildJobId}", sdk_version:"${build.sdkVersion}", spec:"${build.spec}", spec_version:"${build.specVersion}", released_on:"${build.releasedOn}"`;
		} catch {
			return 'SDK info not available (run yarn build first)';
		}
	}

	_getConfig(): Configuration { return this.sessionManager.configuration; }
}
