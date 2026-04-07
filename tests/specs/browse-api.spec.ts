import { describe, it } from 'mocha';
import * as assert from 'assert';
import { hb } from '../browse-global.spec';
import { SDKConnectionState } from '../../src/interfaces/infra';

describe('# Browse Security API', () => {

	// ── DLP Policy Rulebase ──

	describe('DLP Policy Rulebase', function () {
		this.timeout(15000);

		it('should get DLP rulebase', async () => {
			const rb = await hb.dlpPolicyApi.getDlpRulebaseExternalV1DlpRulebaseGet();
			assert.ok(rb.data, 'data should be returned');
		});
	});

	// ── Web Access Rulebase ──

	describe('Web Access Rulebase', function () {
		this.timeout(15000);

		it('should get web access rulebase', async () => {
			const rb = await hb.webAccessPolicyApi.getWebAccessRulebaseExternalV1WebAccessRulebaseGet();
			assert.ok(rb.data, 'data should be returned');
		});
	});

	// ── Secure Browsing Rulebase ──

	describe('Secure Browsing Rulebase', function () {
		this.timeout(15000);

		it('should get secure browsing rulebase', async () => {
			const rb = await hb.secureBrowsingPolicyApi.getSecureBrowsingRulebaseExternalV1SecureBrowsingRulebaseGet();
			assert.ok(rb.data, 'data should be returned');
		});
	});

	// ── DLP Datatypes ──

	describe('DLP Datatypes', function () {
		this.timeout(15000);

		it('should get predefined DLP datatypes', async () => {
			const result = await hb.dlpDatatypesApi.getPredefinedDatatypesExternalV1DlpDatatypesPredefinedGet();
			assert.ok(result.data, 'data should be returned');
		});

		it('should get all DLP datatypes', async () => {
			const result = await hb.dlpDatatypesApi.getAllDatatypesExternalV1DlpDatatypesAllGet();
			assert.ok(result.data, 'data should be returned');
		});
	});

	// ── Objects ──

	describe('Objects', function () {
		this.timeout(15000);

		it('should get file protection objects', async () => {
			const result = await hb.objectsApi.getFileProtectionObjectsExternalV1ObjectsFileProtectionGet();
			assert.ok(result.data, 'data should be returned');
		});

		it('should get domains objects', async () => {
			const result = await hb.objectsApi.getDomainsObjectsExternalV1ObjectsDomainsGet();
			assert.ok(result.data, 'data should be returned');
		});
	});

	// ── Connection State ──

	describe('Connection State', () => {
		it('should report connected state', () => {
			const state = hb.connectionState();
			assert.strictEqual(state, SDKConnectionState.CONNECTED);
		});
	});
});
