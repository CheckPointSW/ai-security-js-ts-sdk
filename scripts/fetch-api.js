const fs = require('fs');
const path = require('path');

const SPEC_NAME = process.env.SPEC_NAME || 'checkpoint-ai-security';
const API_OWNER = 'Check-Point';
const LOCAL_SPEC_PATH = process.env.LOCAL_GENERATED_API_PATH;
const SWAGGERHUB_API_KEY = process.env.SWAGGERHUB_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'generated', 'specs');

async function fetchSpec() {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	if (LOCAL_SPEC_PATH) {
		console.log(`[fetch-api] Using local spec from: ${LOCAL_SPEC_PATH}`);
		fs.copyFileSync(LOCAL_SPEC_PATH, path.join(OUTPUT_DIR, 'swagger.json'));
		fs.writeFileSync(path.join(OUTPUT_DIR, 'spec'), SPEC_NAME);
		return;
	}

	const headers = { 'Content-Type': 'application/json' };
	if (SWAGGERHUB_API_KEY) headers['Authorization'] = `Bearer ${SWAGGERHUB_API_KEY}`;

	console.log(`[fetch-api] Fetching spec for ${API_OWNER}/${SPEC_NAME}...`);
	const nodeFetch = require('node-fetch');
	const fetch = nodeFetch.default || nodeFetch;

	const listRes = await fetch(`https://api.swaggerhub.com/apis/${API_OWNER}/${SPEC_NAME}`, { headers });
	const listData = await listRes.json();
	const latest = listData.apis[listData.apis.length - 1];
	const swaggerUrl = latest.properties.find(p => p.type === 'Swagger')?.url;

	console.log(`[fetch-api] Downloading from: ${swaggerUrl}`);
	const specRes = await fetch(swaggerUrl, { headers });
	const specData = await specRes.json();

	fs.writeFileSync(path.join(OUTPUT_DIR, 'swagger.json'), JSON.stringify(specData, null, 2));
	fs.writeFileSync(path.join(OUTPUT_DIR, 'spec'), SPEC_NAME);
	console.log('[fetch-api] Spec ready.');
}

fetchSpec().catch(e => { console.error(e); process.exit(1); });
