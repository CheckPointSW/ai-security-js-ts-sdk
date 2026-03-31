const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '..', 'src', 'generated');
const SPEC_DIR = path.join(GENERATED_DIR, 'specs');

function pascalToCamel(name) {
	return name.replace(/^[A-Z]+/, (match) => {
		if (match.length === 1) return match.toLowerCase();
		return match.slice(0, -1).toLowerCase() + match.slice(-1);
	});
}

function discoverApis() {
	const apiFile = path.join(GENERATED_DIR, 'api.ts');
	const content = fs.readFileSync(apiFile, 'utf-8');
	const regex = /export class (\w+Api) extends BaseAPI/g;
	const apis = [];
	let match;
	while ((match = regex.exec(content)) !== null) {
		apis.push(match[1]);
	}
	return apis.sort();
}

function generateApiAccessors(apis) {
	const imports = apis.map(name => `\t${name},`).join('\n');
	const getters = apis.map(name => {
		const prop = pascalToCamel(name);
		return `\tget ${prop}(): ${name} { return new ${name}(this._getConfig()); }`;
	}).join('\n');

	const content = `/**
 * Auto-generated API accessors — do not edit manually.
 *
 * Provides a mixin class with getter properties for all generated API classes.
 * Extend ApiAccessors in your SDK class and implement _getConfig().
 */
import { Configuration } from './configuration';
import {
${imports}
} from './api';

export abstract class ApiAccessors {
\tabstract _getConfig(): Configuration;

${getters}
}
`;

	fs.writeFileSync(path.join(GENERATED_DIR, 'api.accessors.ts'), content);
	console.log(`[post-generate] api.accessors.ts generated with ${apis.length} APIs`);
}

function prepareBuildManifest() {
	let specName = process.env.SPEC_NAME || 'checkpoint-ai-security';
	let specVersion = '1.0.0';

	try {
		const swagger = JSON.parse(fs.readFileSync(path.join(SPEC_DIR, 'swagger.json'), 'utf-8'));
		specVersion = swagger.info?.version || specVersion;
		if (fs.existsSync(path.join(SPEC_DIR, 'spec'))) {
			specName = fs.readFileSync(path.join(SPEC_DIR, 'spec'), 'utf-8').trim();
		}
	} catch (e) {
		console.warn('[post-generate] Could not read spec info:', e.message);
	}

	const buildManifest = {
		spec: specName,
		specVersion,
		buildJobId: process.env.BUILD_JOB_ID || '',
		sdkVersion: process.env.BUILD_VERSION || '1.0.0',
		releasedOn: new Date().toISOString(),
	};

	fs.mkdirSync(GENERATED_DIR, { recursive: true });
	fs.writeFileSync(path.join(GENERATED_DIR, 'build.json'), JSON.stringify(buildManifest, null, 2));
	console.log('[post-generate] build.json written');
}

prepareBuildManifest();
const apis = discoverApis();
console.log(`[post-generate] Found APIs: ${apis.join(', ')}`);
generateApiAccessors(apis);
console.log('[post-generate] Done.');
