/**
 * Auto-generated API accessors — do not edit manually.
 *
 * Provides a mixin class with getter properties for all generated API classes.
 * Extend BrowseApiAccessors in your SDK class and implement _getConfig().
 */
import { Configuration } from './configuration';
import {
	AppsCatalogApi,
	DLPDatatypesApi,
	DLPPolicyApi,
	DeploymentStatusApi,
	ObjectsApi,
	RulebaseApi,
	SecureBrowsingPolicyApi,
	UsersApi,
	WebAccessPolicyApi,
} from './api';

export abstract class BrowseApiAccessors {
	abstract _getConfig(): Configuration;

	get appsCatalogApi(): AppsCatalogApi { return new AppsCatalogApi(this._getConfig()); }
	get dlpDatatypesApi(): DLPDatatypesApi { return new DLPDatatypesApi(this._getConfig()); }
	get dlpPolicyApi(): DLPPolicyApi { return new DLPPolicyApi(this._getConfig()); }
	get deploymentStatusApi(): DeploymentStatusApi { return new DeploymentStatusApi(this._getConfig()); }
	get objectsApi(): ObjectsApi { return new ObjectsApi(this._getConfig()); }
	get rulebaseApi(): RulebaseApi { return new RulebaseApi(this._getConfig()); }
	get secureBrowsingPolicyApi(): SecureBrowsingPolicyApi { return new SecureBrowsingPolicyApi(this._getConfig()); }
	get usersApi(): UsersApi { return new UsersApi(this._getConfig()); }
	get webAccessPolicyApi(): WebAccessPolicyApi { return new WebAccessPolicyApi(this._getConfig()); }
}
