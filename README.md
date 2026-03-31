# Check Point - AI Security JS/TS SDK

[![Build](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/build.yml/badge.svg)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/build.yml) [![Tests](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/test.yml/badge.svg)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/test.yml) [![License](https://img.shields.io/github/license/CheckPointSW/ai-security-js-ts-sdk.svg?style=plastic)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/blob/release/LICENSE) [![npm version](https://img.shields.io/npm/v/@chkp/ai-security-sdk.svg?style=plastic)](https://www.npmjs.com/package/@chkp/ai-security-sdk)

This is the AI Security SDK for JavaScript/TypeScript ecosystem.

The SDK is based on the public [AI Security OpenAPI](https://app.swaggerhub.com/apis/Check-Point/checkpoint-ai-security) specifications.

With the SDK, you do not have to manage log in, send keep alive requests, or worry about session expiration.

> The AI Security SDK supports simultaneous instances with different tenants.

## SDK installation

```bash
npm install @chkp/ai-security-sdk
```

## Getting started

First, import the `AISecurity` object from the package.

```typescript
import { AISecurity } from '@chkp/ai-security-sdk';
```

Then, create a new instance of `AISecurity`, which provides CloudInfra API credentials and a gateway to connect to.

### Obtaining API credentials

1. Go to the [Infinity Portal API Keys page](https://portal.checkpoint.com/dashboard/settings/api-keys).
2. Click **New** > **New Account API Key**.
3. In the **Service** dropdown select **Workforce AI Security** and create the key.
4. Copy the **Client ID**, **Secret Key**, and **Authentication URL** (gateway).

For more information, see [Infinity Portal Administration Guide](https://sc1.checkpoint.com/documents/Infinity_Portal/WebAdminGuides/EN/Infinity-Portal-Admin-Guide/Content/Topics-Infinity-Portal/API-Keys.htm?tocpath=Global%20Settings%7C_____7#API_Keys).

### Available gateways

| Region | Gateway URL |
|---|---|
| Europe | `https://cloudinfra-gw.portal.checkpoint.com` |
| United States | `https://cloudinfra-gw-us.portal.checkpoint.com` |

Once the Client ID, Secret Key, and Authentication URL are obtained, AI Security SDK can be used.

All API operations can be explored with the `AISecurity` instance, notice to the documentation on each API operation, what and where are the arguments it requires.

All APIs can be also explored in [SwaggerHub](https://app.swaggerhub.com/apis/Check-Point/checkpoint-ai-security)

A complete example:

```typescript
import { AISecurity } from '@chkp/ai-security-sdk';

// Create a new instance of AISecurity (we do support multiple instances in parallel)
const ai = new AISecurity();

// Connect to AI Security service using CloudInfra API credentials
await ai.connect({
    clientId: 'place here your CI client-id',     // The "Client ID"
    accessKey: 'place here your CI access-key',   // The "Secret Key"
    gateway: 'https://cloudinfra-gw-us.portal.checkpoint.com', // The "Authentication URL" (without /auth/external)
});

// Query the API operations
const rulebase = await ai.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
console.log(rulebase.data);

// Once finish, disconnect to stop all background session management.
ai.disconnect();
```

## Troubleshooting and logging

The full version and build info of the SDK is available by `AISecurity.info()` see example:
```typescript
console.log(AISecurity.info());
// sdk_build:"9728283", sdk_version:"1.0.0", spec:"checkpoint-ai-security", spec_version:"1.0.0", released_on:"2024-01-01T00:00:00"
```

AI Security JS/TS SDK uses the [debug](https://www.npmjs.com/package/debug) package for logging.

There are 3 loggers, for general info, errors and to inspect network.

As default they will be disabled, in order to enable logging, set the `DEBUG` environment variable before running:
```bash
DEBUG="chkp_ai_security_sdk:*"
```

And for a specific/s logger set the logger name followed by a comma as following:
```bash
DEBUG="chkp_ai_security_sdk:info,chkp_ai_security_sdk:error,chkp_ai_security_sdk:network"
```

## All Check Point AI Security API tools

| Tool | Package |
|---|---|
| Python SDK | [`chkp-ai-security-sdk`](https://pypi.org/project/chkp-ai-security-sdk/) |
| JS/TS SDK | [`@chkp/ai-security-sdk`](https://www.npmjs.com/package/@chkp/ai-security-sdk) |
| OpenAPI Spec | [SwaggerHub](https://app.swaggerhub.com/apis/Check-Point/checkpoint-ai-security) |

## Report Bug

In case of an issue or a bug found in the SDK, please open an [issue](https://github.com/CheckPointSW/ai-security-js-ts-sdk/issues).

## Contributors
- Haim Kastner - [haimk@checkpoint.com](mailto:haimk@checkpoint.com)
