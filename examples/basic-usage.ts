import * as dotenv from 'dotenv';
dotenv.config();

import { AISecurity, InfinityPortalAuth } from '../src';

async function main() {
	const sdk = new AISecurity();

	const auth: InfinityPortalAuth = {
		clientId: process.env.CP_CI_CLIENT_ID!,
		accessKey: process.env.CP_CI_ACCESS_KEY!,
		gateway: process.env.CP_CI_GATEWAY!,
	};

	console.log('Connecting...');
	await sdk.connect(auth);
	console.log('Connected!');
	console.log('SDK info:', AISecurity.info());

	try {
		// Get chats policy rulebase
		console.log('\n--- Chats Policy Rulebase ---');
		const chatsRulebase = await sdk.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
		console.log(JSON.stringify(chatsRulebase.data, null, 2));

		// Get access policy rulebase
		console.log('\n--- Access Policy Rulebase ---');
		const accessRulebase = await sdk.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
		console.log(JSON.stringify(accessRulebase.data, null, 2));

		// Get predefined DLP datatypes
		console.log('\n--- Predefined DLP Datatypes ---');
		const datatypes = await sdk.dlpDatatypesApi.getPredefinedDatatypesExternalV1DlpDatatypesPredefinedGet();
		console.log(JSON.stringify(datatypes.data, null, 2));
	} catch (err) {
		console.error('API call failed:', err);
	} finally {
		sdk.disconnect();
		console.log('\nDisconnected.');
	}
}

main().catch(console.error);
