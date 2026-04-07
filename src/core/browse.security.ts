import { InfinityPortalAuth, SDKConnectionState } from '../interfaces/infra';
import { SessionManager } from './session.manager';
import { Configuration } from '../generated-browse/configuration';
import { BrowseApiAccessors } from '../generated-browse/api.accessors';

export class BrowseSecurity extends BrowseApiAccessors {
	private sessionManager: SessionManager;

	constructor() {
		super();
		this.sessionManager = new SessionManager();
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

	_getConfig(): Configuration {
		// Re-wrap the session's config data into the browse-specific Configuration type
		const src = this.sessionManager.configuration;
		return new Configuration({
			basePath: src.basePath,
			accessToken: src.accessToken,
			baseOptions: {
				headers: {
					'x-api-source': 'js_sdk',
				},
			},
		});
	}
}
