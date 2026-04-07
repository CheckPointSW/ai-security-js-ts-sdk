import { describe, it, before, after } from 'mocha';
import * as assert from 'assert';
import { ha } from '../global.spec';
import {
	DLPEventType,
	LoggingStatus,
	SelectionMode,
	AssignmentType,
	MCPServersMode,
	MatchToolsMode,
} from '../../src/generated/api';
import { SDKConnectionState } from '../../src/interfaces/infra';

// Helper: delete all rules from a rulebase
async function cleanupRulebase(getRulebase: () => Promise<any>) {
	try {
		const rb = await getRulebase();
		for (const rule of rb.data.rules || []) {
			try {
				await ha.rulebaseApi.deleteRuleExternalV1RulesRuleIdDelete({ ruleId: rule.rule_id });
			} catch { /* ignore */ }
		}
	} catch { /* ignore */ }
}

describe('# AI Security API', () => {

	// ── Cleanup before all tests ──
	before(async function () {
		this.timeout(30000);
		await cleanupRulebase(() => ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet());
		await cleanupRulebase(() => ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet());
		await cleanupRulebase(() => ha.agentsPolicyApi.getAgentsRulebaseExternalV1AgentsRulebaseGet());
		// Wait for API to propagate deletes
		await new Promise(r => setTimeout(r, 2000));
	});

	// ── Cleanup after all tests ──
	after(async function () {
		this.timeout(30000);
		await cleanupRulebase(() => ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet());
		await cleanupRulebase(() => ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet());
		await cleanupRulebase(() => ha.agentsPolicyApi.getAgentsRulebaseExternalV1AgentsRulebaseGet());
	});

	// ── GenAI Chats Rule CRUD ──

	describe('GenAI Chats Rule CRUD', function () {
		this.timeout(30000);
		let ruleId: string;

		it('should create a chats rule', async () => {
			const result = await ha.chatsPolicyApi.addChatsRuleExternalV1ChatsRulePost({
				addChatsRuleRequest: {
					name: 'Test DLP Rule',
					description: 'Integration test',
					order: 0,
					policy: {
						event_type: DLPEventType.FileUpload,
						action: 'prevent',
						logging: LoggingStatus.Enabled,
						services_and_application: { mode: SelectionMode.All },
						data_types: [{
							id: 'cf0523c1-537e-4a4b-8bb8-084b7b9e0b45',
							name: 'Credit Card Number',
							type: 'PRE_DEFINED',
						}],
					},
					source: [{
						assignment_id: 'entire-org',
						display_name: 'Entire Organization',
						assignment_type: AssignmentType.AssignmentTypeEntireOrg,
					}],
				},
			});
			ruleId = result.data.rule_id;
			assert.ok(ruleId, 'rule_id should be returned');
		});

		it('should read the chats rule back', async () => {
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.ok(rule, 'rule should exist in rulebase');
			assert.strictEqual(rule.name, 'Test DLP Rule');
			assert.strictEqual(rule.active, true);
		});

		it('should update rule info', async () => {
			await ha.rulebaseApi.setRuleInfoExternalV1RulesSetInfoPut({
				commonSetInfoRequest: {
					rule_id: ruleId,
					name: 'Test DLP Rule Updated',
					description: 'Updated',
				},
			});
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.name, 'Test DLP Rule Updated');
			assert.strictEqual(rule.description, 'Updated');
		});

		it('should patch chats policy', async () => {
			await ha.chatsPolicyApi.patchChatsPolicyExternalV1ChatsRulePatchPolicyPatch({
				patchChatsPolicyRequest: {
					rule_id: ruleId,
					policy: {
						action: 'detect',
						data_types: [{
							id: 'cf0523c1-537e-4a4b-8bb8-084b7b9e0b45',
							name: 'Credit Card Number',
							type: 'PRE_DEFINED',
						}],
					},
				},
			});
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.policy.action, 'detect');
		});

		it('should disable the rule', async () => {
			await ha.rulebaseApi.setActiveExternalV1RulesSetActivePut({
				commonSetActiveRequest: { rule_id: ruleId, active: false },
			});
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.active, false);
		});

		it('should delete the rule', async () => {
			await ha.rulebaseApi.deleteRuleExternalV1RulesRuleIdDelete({ ruleId });
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.ok(!rule, 'rule should not exist after delete');
		});
	});

	// ── AI Access Rule CRUD ──

	describe('AI Access Rule CRUD', function () {
		this.timeout(30000);
		let ruleId: string;

		it('should create an access rule', async () => {
			const result = await ha.aiAccessPolicyApi.addAiAccessRuleExternalV1AiAccessRulePost({
				addAccessRuleRequest: {
					name: 'Test Access Rule',
					description: 'Integration test',
					order: 0,
					policy: {
						action: 'block',
						logging: LoggingStatus.Enabled,
						services_and_application: {
							mode: SelectionMode.Selected,
							genai_application: [{ id: 1, mode: 'all' }],
						},
					},
					source: [{
						assignment_id: 'entire-org',
						display_name: 'Entire Organization',
						assignment_type: AssignmentType.AssignmentTypeEntireOrg,
					}],
				},
			});
			ruleId = result.data.rule_id;
			assert.ok(ruleId, 'rule_id should be returned');
		});

		it('should read the access rule back', async () => {
			const rb = await ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.ok(rule, 'rule should exist in rulebase');
			assert.strictEqual(rule.name, 'Test Access Rule');
		});

		it('should update rule info', async () => {
			await ha.rulebaseApi.setRuleInfoExternalV1RulesSetInfoPut({
				commonSetInfoRequest: {
					rule_id: ruleId,
					name: 'Test Access Rule v2',
					description: 'v2',
				},
			});
			const rb = await ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.name, 'Test Access Rule v2');
		});

		it('should delete the access rule', async () => {
			await ha.rulebaseApi.deleteRuleExternalV1RulesRuleIdDelete({ ruleId });
			const rb = await ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.ok(!rule, 'rule should not exist after delete');
		});
	});

	// ── GenAI Agents Rule CRUD ──

	describe('GenAI Agents Rule CRUD', function () {
		this.timeout(30000);
		let ruleId: string;

		it('should create an agents rule', async () => {
			const result = await ha.agentsPolicyApi.addAgentsRuleExternalV1AgentsRulePost({
				addMCPServerRuleRequest: {
					name: 'Test Agents Rule',
					description: 'Integration test',
					order: 0,
					policy: {
						action: 'allow',
						logging: LoggingStatus.Enabled,
						clients: { mode: SelectionMode.All },
						servers: { mcp_servers_mode: MCPServersMode.All },
						tooling: { match_mode: MatchToolsMode.ToolsInclude },
					},
					source: [{
						assignment_id: 'entire-org',
						display_name: 'Entire Organization',
						assignment_type: AssignmentType.AssignmentTypeEntireOrg,
					}],
				},
			});
			ruleId = result.data.rule_id;
			assert.ok(ruleId, 'rule_id should be returned');
		});

		it('should read the agents rule back', async () => {
			const rb = await ha.agentsPolicyApi.getAgentsRulebaseExternalV1AgentsRulebaseGet();
			const rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.ok(rule, 'rule should exist in rulebase');
			assert.strictEqual(rule.name, 'Test Agents Rule');
		});

		it('should delete the agents rule', async () => {
			await ha.rulebaseApi.deleteRuleExternalV1RulesRuleIdDelete({ ruleId });
		});
	});

	// ── Rulebase Read Tests ──

	describe('Rulebase Read', function () {
		this.timeout(15000);

		it('should get chats rulebase', async () => {
			const rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			assert.ok(Array.isArray(rb.data.rules), 'rules should be an array');
			assert.strictEqual(typeof rb.data.rulebase_version, 'number');
		});

		it('should get access rulebase', async () => {
			const rb = await ha.aiAccessPolicyApi.getAiAccessRulebaseExternalV1AiAccessRulebaseGet();
			assert.ok(Array.isArray(rb.data.rules), 'rules should be an array');
		});

		it('should get agents rulebase', async () => {
			const rb = await ha.agentsPolicyApi.getAgentsRulebaseExternalV1AgentsRulebaseGet();
			assert.ok(Array.isArray(rb.data.rules), 'rules should be an array');
		});
	});

	// ── DLP Datatypes ──

	describe('DLP Datatypes', function () {
		this.timeout(15000);

		it('should get predefined DLP datatypes', async () => {
			const result = await ha.dlpDatatypesApi.getPredefinedDatatypesExternalV1DlpDatatypesPredefinedGet();
			assert.ok(result.data, 'data should be returned');
		});

		it('should get all DLP datatypes', async () => {
			const result = await ha.dlpDatatypesApi.getAllDatatypesExternalV1DlpDatatypesAllGet();
			assert.ok(result.data, 'data should be returned');
		});
	});

	// ── SetActive Toggle ──

	describe('SetActive Toggle', function () {
		this.timeout(30000);
		let ruleId: string;

		before(async () => {
			const result = await ha.chatsPolicyApi.addChatsRuleExternalV1ChatsRulePost({
				addChatsRuleRequest: {
					name: 'Toggle Test Rule',
					order: 0,
					policy: {
						event_type: DLPEventType.Prompt,
						action: 'detect',
						logging: LoggingStatus.Enabled,
						services_and_application: { mode: SelectionMode.All },
						data_types: [{
							id: 'cf0523c1-537e-4a4b-8bb8-084b7b9e0b45',
							name: 'Credit Card Number',
							type: 'PRE_DEFINED',
						}],
					},
				},
			});
			ruleId = result.data.rule_id;
		});

		after(async () => {
			try {
				await ha.rulebaseApi.deleteRuleExternalV1RulesRuleIdDelete({ ruleId });
			} catch { /* ignore */ }
		});

		it('should disable and re-enable a rule', async () => {
			// Disable
			await ha.rulebaseApi.setActiveExternalV1RulesSetActivePut({
				commonSetActiveRequest: { rule_id: ruleId, active: false },
			});
			let rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			let rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.active, false, 'rule should be inactive');

			// Re-enable
			await ha.rulebaseApi.setActiveExternalV1RulesSetActivePut({
				commonSetActiveRequest: { rule_id: ruleId, active: true },
			});
			rb = await ha.chatsPolicyApi.getChatsRulebaseExternalV1ChatsRulebaseGet();
			rule = rb.data.rules.find((r: any) => r.rule_id === ruleId);
			assert.strictEqual(rule.active, true, 'rule should be active again');
		});
	});

	// ── Connection State ──

	describe('Connection State', () => {
		it('should report connected state', () => {
			const state = ha.connectionState();
			assert.strictEqual(state, SDKConnectionState.CONNECTED);
		});
	});
});
