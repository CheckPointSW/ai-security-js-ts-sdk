import * as dotenv from 'dotenv';
dotenv.config();

import { AISecurity, BrowseSecurity, InfinityPortalAuth } from '../src';

async function main() {
	const auth: InfinityPortalAuth = {
		clientId: process.env.CP_CI_CLIENT_ID!,
		accessKey: process.env.CP_CI_ACCESS_KEY!,
		gateway: process.env.CP_CI_GATEWAY!,
	};

	const ai = new AISecurity();
	const browse = new BrowseSecurity();

	console.log('Connecting...');
	await ai.connect(auth);
	await browse.connect(auth);
	console.log('Connected!');
	console.log('AI Security info:', AISecurity.info());
	console.log('Browse Security info:', BrowseSecurity.info());

	try {
		// ── AI Security APIs ──

		console.log('\n=== AI Security ===');

		console.log('\n--- Chats Policy Rulebase ---');
		const chatsRulebase = await ai.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
		console.log(JSON.stringify(chatsRulebase.data, null, 2));

		await ai.rulebaseApi.setActiveExternalV1RulesSetActivePut({
			commonSetActiveRequest: {
				rule_id: chatsRulebase.data.rules[0].rule_id,
				active: true
			}
		});



		console.log('\n--- Access Policy Rulebase ---');
		const accessRulebase = await ai.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
		console.log(JSON.stringify(accessRulebase.data, null, 2));

		console.log('\n--- Predefined DLP Datatypes ---');
		const datatypes = await ai.dlpDatatypesApi.getPredefinedDatatypesExternalV1DlpDatatypesPredefinedGet();
		console.log(JSON.stringify(datatypes.data, null, 2));

		// ── Browse Security APIs ──

		console.log('\n=== Browse Security ===');

		console.log('\n--- DLP Policy Rulebase ---');
		const dlpRulebase = await browse.dlpPolicyApi.getDlpRulebaseExternalV1DlpRulebaseGet();
		console.log(JSON.stringify(dlpRulebase.data, null, 2));

		console.log('\n--- Web Access Rulebase ---');
		const webAccessRulebase = await browse.webAccessPolicyApi.getWebAccessRulebaseExternalV1WebAccessRulebaseGet();
		console.log(JSON.stringify(webAccessRulebase.data, null, 2));

		console.log('\n--- Secure Browsing Rulebase ---');
		const secureBrowsing = await browse.secureBrowsingPolicyApi.getSecureBrowsingRulebaseExternalV1SecureBrowsingRulebaseGet();
		console.log(JSON.stringify(secureBrowsing.data, null, 2));

		console.log('\n--- File Protection Objects ---');
		const objects = await browse.objectsApi.getFileProtectionObjectsExternalV1ObjectsFileProtectionGet();
		console.log(JSON.stringify(objects.data, null, 2));
	} catch (err) {
		console.error('API call failed:', err);
	} finally {
		ai.disconnect();
		browse.disconnect();
		console.log('\nDisconnected.');
	}
}

main().catch(console.error);
