#!/usr/bin/env node

/**
 * ZenPay Data Extractor
 * Extracts all parameter data, error codes, and code samples from ZenPay demo page
 */

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

const ZENPAY_DEMO_URL = 'https://payuat.travelpay.com.au/demo/';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');

// Type definitions
interface InputParameter {
	name: string;
	type: string;
	conditional: string;
	remarks: string;
}

interface OutputParameter {
	parameter: string;
	value: string;
}

interface ErrorCode {
	code: string;
	description: string;
}

interface CodeSample {
	index: number;
	language: string;
	code: string;
}

interface ReturnParameters {
	mode02: OutputParameter[];
	mode1: OutputParameter[];
	combined: OutputParameter[];
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch HTML content from URL
 */
function fetchHtml(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const options = {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		};

		https
			.get(url, options, response => {
				let data = '';

				response.on('data', chunk => {
					data += chunk;
				});

				response.on('end', () => {
					resolve(data);
				});
			})
			.on('error', error => {
				reject(error);
			});
	});
}

/**
 * Extract table data from HTML
 */
function extractTableData(html: string, tableTitle: string): InputParameter[] | OutputParameter[] | ErrorCode[] {
	const results: any[] = [];

	// Find the section with the table title
	const sectionMatch = html.match(
		new RegExp(
			`<div[^>]*class="panel-heading"[^>]*>${tableTitle}</div>[\\s\\S]*?<table[^>]*>([\\s\\S]*?)</table>`,
			'i'
		)
	);

	if (!sectionMatch) {
		console.log(`❌ Could not find table for: ${tableTitle}`);
		return results;
	}

	const tableHtml = sectionMatch[1];

	// Extract table rows
	const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);

	if (!rowMatches) {
		console.log(`❌ No rows found in table: ${tableTitle}`);
		return results;
	}

	// Process each row
	rowMatches.forEach((rowHtml, index) => {
		// Skip header row
		if (index === 0) return;

		// Extract cells from row
		const cellMatches = rowHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g);

		if (!cellMatches || cellMatches.length < 2) return;

		// Clean and extract cell content
		const cells = cellMatches.map(cell => {
			return cell
				.replace(/<[^>]*>/g, '')
				.replace(/\s+/g, ' ')
				.trim();
		});

		// Create parameter object based on table type
		if (tableTitle.includes('Input Parameters')) {
			if (cells.length >= 4) {
				results.push({
					name: cells[0],
					type: cells[1],
					conditional: cells[2],
					remarks: cells[3],
				});
			}
		} else if (tableTitle.includes('Return Parameters')) {
			if (cells.length >= 2) {
				results.push({
					parameter: cells[0],
					value: cells[1],
				});
			}
		} else if (tableTitle.includes('Error Codes')) {
			if (cells.length >= 2) {
				results.push({
					code: cells[0],
					description: cells[1],
				});
			}
		}
	});

	console.log(`✅ Extracted ${results.length} entries from ${tableTitle}`);
	return results;
}

/**
 * Extract all return parameters (handles multiple tables)
 */
function extractAllReturnParameters(html: string): ReturnParameters {
	const results: ReturnParameters = {
		mode02: [],
		mode1: [],
		combined: [],
	};

	// Find all sections with "Return Parameters" in the heading
	const returnSections = html.match(
		/<div[^>]*class="panel-heading"[^>]*>Return Parameters<\/div>[\s\S]*?<div[^>]*class="panel-body"[\s\S]*?<\/div>/gi
	);

	if (!returnSections) {
		console.log('❌ Could not find Return Parameters sections');
		return results;
	}

	console.log(`Found ${returnSections.length} Return Parameters sections`);

	// Process each section
	returnSections.forEach((section, index) => {
		const sectionResults: OutputParameter[] = [];

		// Extract table from this section
		const tableMatch = section.match(/<table[^>]*>([\s\S]*?)<\/table>/);

		if (tableMatch) {
			const tableHtml = tableMatch[1];
			const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);

			if (rowMatches) {
				rowMatches.forEach((rowHtml, rowIndex) => {
					// Skip header row
					if (rowIndex === 0) return;

					const cellMatches = rowHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g);

					if (cellMatches && cellMatches.length >= 2) {
						const cells = cellMatches.map(cell => {
							return cell
								.replace(/<[^>]*>/g, '')
								.replace(/\s+/g, ' ')
								.trim();
						});

						sectionResults.push({
							parameter: cells[0],
							value: cells[1],
						});
					}
				});
			}
		}

		// Assign to appropriate mode based on section content
		if (index === 0) {
			results.mode02 = sectionResults;
		} else if (index === 1) {
			results.mode1 = sectionResults;
		}
	});

	results.combined = [...results.mode02, ...results.mode1];
	console.log(`✅ Extracted ${results.mode02.length} Mode 0&2 parameters, ${results.mode1.length} Mode 1 parameters`);
	return results;
}

/**
 * Extract code samples from HTML
 */
function extractCodeSamples(html: string): CodeSample[] {
	const results: CodeSample[] = [];

	// Look for Code Sample section
	const codeSectionMatch = html.match(
		/<div[^>]*class="panel-heading"[^>]*>Code Sample<\/div>[\s\S]*?<div[^>]*class="panel-body"[\s\S]*?<\/div>/i
	);

	if (!codeSectionMatch) {
		console.log('❌ Could not find Code Sample section');
		return results;
	}

	const codeSectionHtml = codeSectionMatch[0];

	// Extract all <pre> blocks
	const preMatches = codeSectionHtml.match(/<pre[^>]*>([\s\S]*?)<\/pre>/g);

	if (preMatches) {
		preMatches.forEach((preBlock, index) => {
			const cleanCode = preBlock
				.replace(/<[^>]*>/g, '')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.trim();

			if (cleanCode.length > 10) {
				results.push({
					index: index + 1,
					language: 'javascript',
					code: cleanCode,
				});
			}
		});
	}

	console.log(`✅ Extracted ${results.length} code samples`);
	return results;
}

/**
 * Save JSON data to file
 */
function saveJsonFile(filename: string, data: any): void {
	const filepath = path.join(OUTPUT_DIR, filename);
	const jsonString = JSON.stringify(data, null, 2);

	fs.writeFileSync(filepath, jsonString);
	console.log(`💾 Saved ${filename} (${data.length} entries)`);
}

/**
 * Clean up temporary files
 */
function cleanupFiles(): void {
	const filesToRemove = [path.join(OUTPUT_DIR, 'zenpay-demo.html'), path.join(OUTPUT_DIR, 'raw-extracted-data.json')];

	filesToRemove.forEach(filepath => {
		if (fs.existsSync(filepath)) {
			fs.unlinkSync(filepath);
			console.log(`🗑️  Removed ${path.basename(filepath)}`);
		}
	});
}

/**
 * Main extraction function
 */
async function extractZenPayData(): Promise<void> {
	try {
		console.log('🔍 Fetching ZenPay demo page...');
		const html = await fetchHtml(ZENPAY_DEMO_URL);

		console.log('📄 HTML content fetched, extracting data...');
		console.log(`📊 HTML size: ${html.length} characters`);

		// Extract input parameters
		console.log('\n📋 Extracting Input Parameters...');
		const inputParameters = extractTableData(html, 'Input Parameters') as InputParameter[];
		if (inputParameters.length > 0) {
			saveJsonFile('jq-input-parameters.json', inputParameters);
		}

		// Extract return parameters (output) - handles both Mode 0&2 and Mode 1
		console.log('\n📋 Extracting Return Parameters...');
		const allReturnParameters = extractAllReturnParameters(html);

		if (allReturnParameters.combined.length > 0) {
			saveJsonFile('jq-output-parameters.json', allReturnParameters);
		}

		// Extract error codes
		console.log('\n📋 Extracting Error Codes...');
		const errorCodes = extractTableData(html, 'Error Codes') as ErrorCode[];
		if (errorCodes.length > 0) {
			saveJsonFile('jq-error-codes.json', errorCodes);
		} else {
			console.log('ℹ️  No Error Codes section found');
		}

		// Extract code samples
		console.log('\n📋 Extracting Code Samples...');
		const codeSamples = extractCodeSamples(html);
		if (codeSamples.length > 0) {
			saveJsonFile('jq-code-samples.json', codeSamples);
		} else {
			console.log('ℹ️  No Code Samples section found');
		}

		// Clean up temporary files
		console.log('\n🧹 Cleaning up temporary files...');
		cleanupFiles();

		console.log('\n✅ Data extraction complete!');
		console.log(`📁 Files saved to: ${OUTPUT_DIR}`);

		// Show final file list
		const finalFiles = fs.readdirSync(OUTPUT_DIR);
		console.log('\n📄 Final files:');
		finalFiles.forEach(file => {
			const filepath = path.join(OUTPUT_DIR, file);
			const stats = fs.statSync(filepath);
			console.log(`  - ${file} (${stats.size} bytes)`);
		});
	} catch (error) {
		console.error('❌ Error extracting data:', (error as Error).message);
		process.exit(1);
	}
}

// Run the extraction
extractZenPayData();
