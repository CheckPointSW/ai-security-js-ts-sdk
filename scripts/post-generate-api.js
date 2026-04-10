const fs = require('fs');
const path = require('path');

/**
 * Post-generation script — only creates build.json manifests.
 *
 */

const PRODUCTS = [
	{
		label: 'ai-security',
		generatedDir: path.join(__dirname, '..', 'src', 'generated'),
		specDir: path.join(__dirname, '..', 'src', 'generated', 'specs'),
		specNameEnv: 'SPEC_NAME',
		specNameDefault: 'checkpoint-ai-security',
	},
	{
		label: 'browse-security',
		generatedDir: path.join(__dirname, '..', 'src', 'generated-browse'),
		specDir: path.join(__dirname, '..', 'src', 'generated-browse', 'specs'),
		specNameEnv: 'BROWSE_SPEC_NAME',
		specNameDefault: 'checkpoint-browse-security',
	},
];

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

for (const product of PRODUCTS) {
	prepareBuildManifest(product);
}

console.log('[post-generate] Done.');
