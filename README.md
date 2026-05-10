# Check Point - AI Security JS/TS SDK (Workforce AI + Browse Security)

[![License](https://img.shields.io/github/license/CheckPointSW/ai-security-js-ts-sdk.svg?style=plastic)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/blob/release/LICENSE) [![Latest Release](https://img.shields.io/github/v/release/CheckPointSW/ai-security-js-ts-sdk?style=plastic)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/releases) [![npm version](https://img.shields.io/npm/v/@chkp/ai-security-sdk.svg?style=plastic)](https://www.npmjs.com/package/@chkp/ai-security-sdk)

[![Build SDK Package](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/build.yml/badge.svg)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/build.yml) [![Publish SDK to npm](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/release.yml/badge.svg)](https://github.com/CheckPointSW/ai-security-js-ts-sdk/actions/workflows/release.yml)

This is the official Check Point AI Security SDK for JavaScript/TypeScript, covering both **Workforce AI** and **Browse Security** products.

The SDK is based on the public [AI Security OpenAPI](https://app.swaggerhub.com/apis/Check-Point/checkpoint-ai-security) and [Browse Security OpenAPI](https://app.swaggerhub.com/apis/Check-Point/checkpoint-browse-security) specifications.

With the SDK, you do not have to manage log in, send keep alive requests, or worry about session expiration.

> The SDK supports simultaneous instances with different tenants, and both products can be used independently or together.

## SDK installation

```bash
npm install @chkp/ai-security-sdk
```

## Getting started

Import the SDK classes for the product(s) you need:

```typescript
import { AISecurity, BrowseSecurity } from '@chkp/ai-security-sdk';
```

- **`AISecurity`** — Workforce AI Security (Chats policy, Access policy, Agents policy, etc.)
- **`BrowseSecurity`** — Browse Security (Secure Browsing policy, DLP policy, web access policy, etc.)

Each class manages its own session independently. Create an instance and provide CloudInfra API credentials to connect.

### Obtaining API credentials

1. Go to the [Infinity Portal API Keys page](https://portal.checkpoint.com/dashboard/settings/api-keys).
2. Click **New** > **New Account API Key**.
3. In the **Service** dropdown select:
   - **Workforce AI Security** for `AISecurity`
   - **Browser Security** for `BrowseSecurity`
4. Copy the **Client ID**, **Secret Key**, and **Authentication URL** (gateway).

For more information, see [Infinity Portal Administration Guide](https://sc1.checkpoint.com/documents/Infinity_Portal/WebAdminGuides/EN/Infinity-Portal-Admin-Guide/Content/Topics-Infinity-Portal/API-Keys.htm?tocpath=Global%20Settings%7C_____7#API_Keys).

### Available gateways

| Region | Gateway URL |
|---|---|
| Europe | `https://cloudinfra-gw.portal.checkpoint.com` |
| United States | `https://cloudinfra-gw-us.portal.checkpoint.com` |

Once the Client ID, Secret Key, and Authentication URL are obtained, the SDK can be used.

All API operations can be explored on SwaggerHub:
- [Workforce AI Security APIs](https://app.swaggerhub.com/apis/Check-Point/checkpoint-ai-security)
- [Browse Security APIs](https://app.swaggerhub.com/apis/Check-Point/checkpoint-browse-security)

### Workforce AI Security example

```typescript
import { AISecurity } from '@chkp/ai-security-sdk';

const ai = new AISecurity();
await ai.connect({
    clientId: 'your-client-id',
    accessKey: 'your-secret-key',
    gateway: 'https://cloudinfra-gw-us.portal.checkpoint.com',
});

const rulebase = await ai.ChatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
console.log(rulebase.data);

ai.disconnect();
```

### Browse Security example

```typescript
import { BrowseSecurity } from '@chkp/ai-security-sdk';

const browse = new BrowseSecurity();
await browse.connect({
    clientId: 'your-client-id',
    accessKey: 'your-secret-key',
    gateway: 'https://cloudinfra-gw-us.portal.checkpoint.com',
});

const rulebase = await browse.DLPPolicyApi.getDlpRulebaseExternalV1DlpRulebaseGet();
console.log(rulebase.data);

browse.disconnect();
```

### Using both products together

```typescript
import { AISecurity, BrowseSecurity } from '@chkp/ai-security-sdk';

const auth = {
    clientId: 'your-client-id',
    accessKey: 'your-secret-key',
    gateway: 'https://cloudinfra-gw-us.portal.checkpoint.com',
};

const ai = new AISecurity();
const browse = new BrowseSecurity();

await ai.connect(auth);
await browse.connect(auth);

// Workforce AI
const chats = await ai.ChatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();

// Browse Security
const dlp = await browse.DLPPolicyApi.getDlpRulebaseExternalV1DlpRulebaseGet();

ai.disconnect();
browse.disconnect();
```

## Troubleshooting and logging

The full version and build info of the SDK is available via the `info()` static method on each class:
```typescript
console.log(AISecurity.info());       // Workforce AI build info
console.log(BrowseSecurity.info());   // Browse Security build info
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

## Report Bug

In case of an issue or a bug found in the SDK, please open an [issue](https://github.com/CheckPointSW/ai-security-js-ts-sdk/issues).

## Contributors
- Haim Kastner - [haimk@checkpoint.com](mailto:haimk@checkpoint.com)
