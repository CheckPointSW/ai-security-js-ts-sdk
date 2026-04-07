const fs = require('fs');
const path = require('path');

const PRODUCTS = [
	{
		label: 'ai-security',
		generatedDir: path.join(__dirname, '..', 'src', 'generated'),
		specDir: path.join(__dirname, '..', 'src', 'generated', 'specs'),
		accessorsClass: 'ApiAccessors',
		specNameEnv: 'SPEC_NAME',
		specNameDefault: 'checkpoint-ai-security',
	},
	{
		label: 'browse-security',
		generatedDir: path.join(__dirname, '..', 'src', 'generated-browse'),
		specDir: path.join(__dirname, '..', 'src', 'generated-browse', 'specs'),
		accessorsClass: 'BrowseApiAccessors',
		specNameEnv: 'BROWSE_SPEC_NAME',
		specNameDefault: 'checkpoint-browse-security',
	},
];

function pascalToCamel(name) {
	return name.replace(/^[A-Z]+/, (match) => {
		if (match.length === 1) return match.toLowerCase();
		return match.slice(0, -1).toLowerCase() + match.slice(-1);
	});
}

function discoverApis(generatedDir) {
	const apiFile = path.join(generatedDir, 'api.ts');
	const content = fs.readFileSync(apiFile, 'utf-8');
	const regex = /export class (\w+Api) extends BaseAPI/g;
	const apis = [];
	let match;
	while ((match = regex.exec(content)) !== null) {
		apis.push(match[1]);
	}
	return apis.sort();
}

function generateApiAccessors(product, apis) {
	const imports = apis.map(name => `\t${name},`).join('\n');
	const getters = apis.map(name => {
		const prop = pascalToCamel(name);
		return `\tget ${prop}(): ${name} { return new ${name}(this._getConfig()); }`;
	}).join('\n');

	const content = `/**
 * Auto-generated API accessors — do not edit manually.
 *
 * Provides a mixin class with getter properties for all generated API classes.
 * Extend ${product.accessorsClass} in your SDK class and implement _getConfig().
 */
import { Configuration } from './configuration';
import {
${imports}
} from './api';

export abstract class ${product.accessorsClass} {
\tabstract _getConfig(): Configuration;

${getters}
}
`;

	fs.writeFileSync(path.join(product.generatedDir, 'api.accessors.ts'), content);
	console.log(`[post-generate:${product.label}] api.accessors.ts generated with ${apis.length} APIs`);
}

function prepareBuildManifest(product) {
	let specName = process.env[product.specNameEnv] || product.specNameDefault;
	let specVersion = '1.0.0';

	try {
		const swagger = JSON.parse(fs.readFileSync(path.join(product.specDir, 'swagger.json'), 'utf-8'));
		specVersion = swagger.info?.version || specVersion;
		if (fs.existsSync(path.join(product.specDir, 'spec'))) {
			specName = fs.readFileSync(path.join(product.specDir, 'spec'), 'utf-8').trim();
		}
	} catch (e) {
		console.warn(`[post-generate:${product.label}] Could not read spec info:`, e.message);
	}

	const buildManifest = {
		spec: specName,
		specVersion,
		buildJobId: process.env.BUILD_JOB_ID || '',
		sdkVersion: process.env.BUILD_VERSION || '1.0.0',
		releasedOn: new Date().toISOString(),
	};

	fs.mkdirSync(product.generatedDir, { recursive: true });
	fs.writeFileSync(path.join(product.generatedDir, 'build.json'), JSON.stringify(buildManifest, null, 2));
	console.log(`[post-generate:${product.label}] build.json written`);
}

function injectApiSourceHeader(product) {
	// Inject x-api-source default header into the generated configuration.ts
	const configPath = path.join(product.generatedDir, 'configuration.ts');
	if (!fs.existsSync(configPath)) return;

	let content = fs.readFileSync(configPath, 'utf-8');
	const needle = `...param.baseOptions?.headers,`;
	if (content.includes(needle) && !content.includes('x-api-source')) {
		content = content.replace(
			needle,
			`'x-api-source': 'js_sdk',\n                ${needle}`,
		);
		fs.writeFileSync(configPath, content);
		console.log(`[post-generate:${product.label}] Injected x-api-source header into configuration.ts`);
	}
}

for (const product of PRODUCTS) {
	prepareBuildManifest(product);
	injectApiSourceHeader(product);
	const apis = discoverApis(product.generatedDir);
	console.log(`[post-generate:${product.label}] Found APIs: ${apis.join(', ')}`);
	generateApiAccessors(product, apis);
}

console.log('[post-generate] Done.');
