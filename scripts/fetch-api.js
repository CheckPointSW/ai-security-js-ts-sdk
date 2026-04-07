const fs = require('fs');
const path = require('path');

const API_OWNER = 'Check-Point';
const SWAGGERHUB_API_KEY = process.env.SWAGGERHUB_API_KEY;

const SPECS = [
	{
		name: process.env.SPEC_NAME || 'checkpoint-ai-security',
		localPathEnv: 'LOCAL_GENERATED_API_PATH',
		outputDir: path.join(__dirname, '..', 'src', 'generated', 'specs'),
	},
	{
		name: process.env.BROWSE_SPEC_NAME || 'checkpoint-browse-security',
		localPathEnv: 'LOCAL_BROWSE_SPEC_PATH',
		outputDir: path.join(__dirname, '..', 'src', 'generated-browse', 'specs'),
	},
];

async function downloadSpec(specName, headers) {
	const nodeFetch = require('node-fetch');
	const fetch = nodeFetch.default || nodeFetch;

	console.log(`[fetch-api] Fetching spec for ${API_OWNER}/${specName}...`);
	const listRes = await fetch(`https://api.swaggerhub.com/apis/${API_OWNER}/${specName}`, { headers });
	const listData = await listRes.json();
	const latest = listData.apis[listData.apis.length - 1];
	const swaggerUrl = latest.properties.find(p => p.type === 'Swagger')?.url;

	console.log(`[fetch-api] Downloading from: ${swaggerUrl}`);
	const specRes = await fetch(swaggerUrl, { headers });
	return await specRes.json();
}

async function fetchAllSpecs() {
	const headers = { 'Content-Type': 'application/json' };
	if (SWAGGERHUB_API_KEY) headers['Authorization'] = `Bearer ${SWAGGERHUB_API_KEY}`;

	for (const spec of SPECS) {
		fs.mkdirSync(spec.outputDir, { recursive: true });
		const localPath = process.env[spec.localPathEnv];

		console.log(`[fetch-api] Processing spec: ${spec.name}`);
		if (localPath) {
			console.log(`[fetch-api] Using local spec from: ${localPath}`);
			fs.copyFileSync(localPath, path.join(spec.outputDir, 'swagger.json'));
		} else {
			const specData = await downloadSpec(spec.name, headers);
			fs.writeFileSync(path.join(spec.outputDir, 'swagger.json'), JSON.stringify(specData, null, 2));
		}
		fs.writeFileSync(path.join(spec.outputDir, 'spec'), spec.name);
		console.log(`[fetch-api] Spec "${spec.name}" ready.`);
	}
}

fetchAllSpecs().catch(e => { console.error(e); process.exit(1); });
