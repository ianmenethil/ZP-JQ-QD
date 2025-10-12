#!/usr/bin/env node

import * as https from 'https';

function fetchHtml(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https
			.get(url, response => {
				let data = '';
				response.on('data', chunk => (data += chunk));
				response.on('end', () => resolve(data));
			})
			.on('error', reject);
	});
}

async function checkCodeSamples(): Promise<void> {
	try {
		const html = await fetchHtml('https://pay.sandbox.travelpay.com.au/demo/');

		// Look for code-related sections
		const codeMatches = html.match(/<div[^>]*class="panel-heading"[^>]*>([^<]*[Cc]ode[^<]*)<\/div>/g);

		if (codeMatches) {
			console.log('Code-related sections found:');
			codeMatches.forEach(match => {
				const title = match.replace(/<[^>]*>/g, '').trim();
				console.log(`  - ${title}`);
			});
		} else {
			console.log('No code-related sections found');
		}

		// Look for any <pre> or <code> tags
		const preMatches = html.match(/<pre[^>]*>[\s\S]*?<\/pre>/g);
		const codeMatches2 = html.match(/<code[^>]*>[\s\S]*?<\/code>/g);

		console.log(`\nFound ${preMatches ? preMatches.length : 0} <pre> blocks`);
		console.log(`Found ${codeMatches2 ? codeMatches2.length : 0} <code> blocks`);

		if (preMatches && preMatches.length > 0) {
			console.log('\nFirst <pre> block:');
			console.log(preMatches[0].substring(0, 200) + '...');
		}
	} catch (error) {
		console.error('Error:', (error as Error).message);
	}
}

checkCodeSamples();
