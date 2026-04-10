import fetch from 'node-fetch';
import { Guid } from 'guid-typescript';
import { InfinityPortalAuth, SDKConnectionState, WorkforceAIError, WorkforceAIErrorScope } from '../interfaces/infra';
import { logger, errorLogger } from './debug.logger';
import { KEEP_ALIVE_GRACE_SECONDS } from './sdk.platform';
import { Configuration } from '../generated';

const CI_AUTH_PATH = '/auth/external';

export class SessionManager {
	private jwtToken: string = '';
	private tokenExpiresIn: number = 0; // seconds, from auth response
	private refreshTimer: ReturnType<typeof setTimeout> | undefined;
	private gateway: string = '';
	private auth: InfinityPortalAuth | undefined;
	private connectionStats: SDKConnectionState = SDKConnectionState.DISCONNECTED;
	private sessionId: string = Guid.create().toString();

	public connectionState(): SDKConnectionState {
		return this.connectionStats;
	}

	public get configuration(): Configuration {
		if (this.connectionStats === SDKConnectionState.DISCONNECTED) {
			throw { scope: WorkforceAIErrorScope.SESSION, message: 'No session configured, connect first' } as WorkforceAIError;
		}
		return new Configuration({
			basePath: this.gateway,
			accessToken: this.jwtToken,
			clientId: this.auth?.clientId,
		});
	}

	public async connect(auth: InfinityPortalAuth): Promise<void> {
		this.validateParams(auth);
		this.connectionStats = SDKConnectionState.CONNECTING;
		this.auth = auth;
		this.gateway = this.normalizeGateway(auth.gateway);
		logger(`New session ${this.sessionId} connecting to ${this.gateway}`);
		await this.performCiLogin();
		this.scheduleRefresh();
	}

	public disconnect(): void {
		logger(`Disconnecting session ${this.sessionId}`);
		this.connectionStats = SDKConnectionState.DISCONNECTED;
		this.jwtToken = '';
		this.tokenExpiresIn = 0;
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = undefined;
		}
		this.sessionId = Guid.create().toString();
	}

	private normalizeGateway(gateway: string): string {
		try {
			const url = new URL(gateway);
			return `${url.protocol}//${url.host}`;
		} catch {
			return gateway;
		}
	}

	private validateParams(auth: InfinityPortalAuth): void {
		if (!auth.gateway) throw { scope: WorkforceAIErrorScope.INVALID_PARAMS, message: 'gateway is required' } as WorkforceAIError;
		if (!auth.clientId) throw { scope: WorkforceAIErrorScope.INVALID_PARAMS, message: 'clientId is required' } as WorkforceAIError;
		if (!auth.accessKey) throw { scope: WorkforceAIErrorScope.INVALID_PARAMS, message: 'accessKey is required' } as WorkforceAIError;
		if (!auth.gateway.startsWith('https://')) {
			throw { scope: WorkforceAIErrorScope.INVALID_PARAMS, message: `Gateway must use https: ${auth.gateway}` } as WorkforceAIError;
		}
	}

	private async performCiLogin(): Promise<void> {
		const authUrl = `${this.gateway}${CI_AUTH_PATH}`;
		logger(`Performing CI login for session ${this.sessionId} at ${authUrl}`);
		try {
			const response = await fetch(authUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: this.auth!.clientId, accessKey: this.auth!.accessKey }),
			});
			const body = await response.json() as any;
			if (!response.ok || !body.success) {
				this.connectionStats = SDKConnectionState.CONNECTION_ISSUE;
				throw { scope: WorkforceAIErrorScope.SERVICE, message: `CI login failed: ${JSON.stringify(body)}`, url: authUrl, statusCode: response.status } as WorkforceAIError;
			}
			this.jwtToken = body.data.token;
			this.tokenExpiresIn = body.data.expiresIn ?? 1800;
			this.connectionStats = SDKConnectionState.CONNECTED;
			logger(`CI login succeeded for session ${this.sessionId}, token expires in ${this.tokenExpiresIn}s`);
		} catch (err: any) {
			this.connectionStats = SDKConnectionState.CONNECTION_ISSUE;
			if (err.scope) throw err;
			throw { scope: WorkforceAIErrorScope.NETWORKING, message: `CI login network error: ${err.message}` } as WorkforceAIError;
		}
	}

	private scheduleRefresh(): void {
		const delaySeconds = Math.max(this.tokenExpiresIn - KEEP_ALIVE_GRACE_SECONDS, 1);
		logger(`Next token refresh for session ${this.sessionId} in ${delaySeconds}s`);
		this.refreshTimer = setTimeout(async () => {
			try {
				logger(`Refreshing CI token for session ${this.sessionId}`);
				await this.performCiLogin();
				this.scheduleRefresh(); // Schedule next refresh based on new expiresIn
			} catch (err) {
				errorLogger(`Token refresh failed for session ${this.sessionId}: ${err}`);
				this.connectionStats = SDKConnectionState.CONNECTION_ISSUE;
			}
		}, delaySeconds * 1000);
	}
}
