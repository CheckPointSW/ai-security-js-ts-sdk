export enum SDKConnectionState {
	CONNECTED = 'CONNECTED',
	DISCONNECTED = 'DISCONNECTED',
	CONNECTING = 'CONNECTING',
	CONNECTION_ISSUE = 'CONNECTION_ISSUE',
}

export interface InfinityPortalAuth {
	clientId: string;
	accessKey: string;
	/** Gateway URL e.g. https://cloudinfra-gw.portal.checkpoint.com */
	gateway: string;
}

export enum WorkforceAIErrorScope {
	NETWORKING = 'NETWORKING',
	SERVICE = 'SERVICE',
	SESSION = 'SESSION',
	INVALID_PARAMS = 'INVALID_PARAMS',
}

export interface WorkforceAIError {
	scope: WorkforceAIErrorScope;
	message?: string;
	url?: string;
	statusCode?: number;
}
