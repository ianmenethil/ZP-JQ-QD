#!/usr/bin/env node
// @ts-ignore
/* eslint-disable */

/**
 * TypeScript-based code usage analyzer
 * Uses the actual TypeScript compiler API for accurate analysis
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Configuration
const SRC_DIR = 'src';
const TSCONFIG_PATH = 'tsconfig.json';
const OUTPUT_MD = './scripts/output/code-usage-report.md';
const OUTPUT_JSON = './scripts/output/code-usage-report.json';

/**
 * Load TypeScript configuration
 */
function loadTsConfig() {
	const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
	const configParseResult = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		path.dirname(TSCONFIG_PATH)
	);
	return configParseResult;
}

/**
 * Create TypeScript program
 */
function createProgram() {
	console.log('📝 Loading TypeScript configuration...');
	const tsConfig = loadTsConfig();

	console.log('🔧 Creating TypeScript program...');
	const program = ts.createProgram(tsConfig.fileNames, tsConfig.options);

	return program;
}

/**
 * Extract all declarations (both public and private) from a source file
 */
function extractAllDeclarations(sourceFile: { fileName: any }, checker: any) {
	const declarations: { name: any; kind: string; file: any; node: any; isExported: boolean }[] = [];

	function visit(node: { fileName?: any; modifiers?: any; name?: any; declarationList?: any }) {
		let name = null;
		let kind = 'unknown';
		let isExported = false;

		// Check if node is exported
		if (node.modifiers) {
			isExported = node.modifiers.some((m: { kind: any }) => m.kind === ts.SyntaxKind.ExportKeyword);
		}

		// Extract function declarations (both public and private)
		if (ts.isFunctionDeclaration(node) && node.name) {
			name = node.name.text;
			kind = 'function';
		} else if (ts.isClassDeclaration(node) && node.name) {
			name = node.name.text;
			kind = 'class';
		} else if (ts.isInterfaceDeclaration(node)) {
			name = node.name.text;
			kind = 'interface';
		} else if (ts.isTypeAliasDeclaration(node)) {
			name = node.name.text;
			kind = 'type';
		} else if (ts.isEnumDeclaration(node)) {
			name = node.name.text;
			kind = 'enum';
		} else if (ts.isVariableStatement(node)) {
			// Handle: const x = ... (both exported and private)
			node.declarationList.declarations.forEach((decl: { name: { text: any } }) => {
				if (ts.isIdentifier(decl.name)) {
					declarations.push({
						name: decl.name.text,
						kind: 'variable',
						file: sourceFile.fileName,
						node: decl,
						isExported,
					});
				}
			});
		}

		if (name) {
			declarations.push({
				name,
				kind,
				file: sourceFile.fileName,
				node,
				isExported,
			});
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return declarations;
}

/**
 * Create a cached language service for reference lookups
 */
function createCachedLanguageService(program: {
	getSourceFiles: () => any[];
	getSourceFile: (arg0: any) => any;
	getCompilerOptions: () => any;
}) {
	return ts.createLanguageService({
		getScriptFileNames: () => program.getSourceFiles().map((sf: { fileName: any }) => sf.fileName),
		getScriptVersion: () => '0',
		getScriptSnapshot: (fileName: any) => {
			const sourceFile = program.getSourceFile(fileName);
			if (!sourceFile) return undefined;
			return ts.ScriptSnapshot.fromString(sourceFile.getFullText());
		},
		getCurrentDirectory: () => process.cwd(),
		getCompilationSettings: () => program.getCompilerOptions(),
		getDefaultLibFileName: (options: any) => ts.getDefaultLibFilePath(options),
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		readDirectory: ts.sys.readDirectory,
	});
}

/**
 * Find all references to a symbol across the program (using cached language service)
 */
function findReferences(languageService: any, sourceFile: { fileName: any }, position: any) {
	const references = languageService.findReferences(sourceFile.fileName, position);
	return references || [];
}

/**
 * Get position of a node in its source file
 */
function getNodePosition(node: { getStart: () => any }) {
	return node.getStart();
}

/**
 * Analyze all declarations (both public and private)
 */
function analyzeExports() {
	console.log('🚀 Starting TypeScript-based code usage analysis (ALL declarations)...\n');

	const program = createProgram();
	const checker = program.getTypeChecker();
	const allDeclarations = [];

	console.log('📊 Extracting all declarations (public + private)...');

	// Extract declarations from all source files
	const sourceFiles = program
		.getSourceFiles()
		.filter(
			(sf: { fileName: string | string[] }) =>
				!sf.fileName.includes('node_modules') &&
				!sf.fileName.includes('src\\public') &&
				!sf.fileName.includes('src/public') &&
				sf.fileName.includes(SRC_DIR)
		);

	for (const sourceFile of sourceFiles) {
		const fileDeclarations = extractAllDeclarations(sourceFile, checker);
		allDeclarations.push(...fileDeclarations);
	}

	console.log(`✅ Found ${allDeclarations.length} declarations\n`);

	console.log('⚡ Creating cached language service (performance optimization)...');
	const languageService = createCachedLanguageService(program);
	console.log('✅ Language service ready\n');

	console.log('🔍 Finding references for each declaration...\n');

	const results = [];
	let processed = 0;

	for (const declaration of allDeclarations) {
		processed++;
		if (processed % 10 === 0 || processed === allDeclarations.length) {
			process.stdout.write(
				`\r   Progress: ${processed}/${allDeclarations.length} (${Math.round((processed / allDeclarations.length) * 100)}%)`
			);
		}

		const sourceFile = program.getSourceFile(declaration.file);
		if (!sourceFile) continue;

		const position = getNodePosition(declaration.node);
		const references = findReferences(languageService, sourceFile, position);

		// Quick check: count total references (excluding definition)
		let totalReferences = 0;
		references.forEach((refGroup: { references: any[] }) => {
			if (!refGroup || !refGroup.references) return;
			refGroup.references.forEach((ref: { isDefinition: any }) => {
				if (!ref.isDefinition) totalReferences++;
			});
		});

		// OPTIMIZATION: Skip detailed analysis for private declarations that are clearly used
		// We only care about UNUSED code, so skip private declarations with references
		if (!declaration.isExported && totalReferences > 0) {
			// This is a private declaration that's being used - skip detailed analysis
			results.push({
				name: declaration.name,
				kind: declaration.kind,
				file: declaration.file,
				references: totalReferences,
				usages: [], // Don't waste time calculating usage details
				category: 'private-used',
				isExported: false,
			});
			continue;
		}

		// For exports or unused private declarations, do full analysis
		const usages: {
			[x: string]: any;
			file: any;
		}[] = [];

		references.forEach((refGroup: { references: any[] }) => {
			if (!refGroup || !refGroup.references) return;

			refGroup.references.forEach((ref: { isDefinition: any; fileName: any }) => {
				// Skip the definition itself
				if (ref.isDefinition) return;

				const refSourceFile = program.getSourceFile(ref.fileName);
				if (refSourceFile) {
					const existingUsage = usages.find((u) => u.file === ref.fileName);
					if (existingUsage) {
						existingUsage.count++;
					} else {
						usages.push({
							file: ref.fileName,
							count: 1,
						});
					}
				}
			});
		});

		// Determine category based on export status and usage
		let category = 'unused';
		if (totalReferences > 0) {
			if (usages.length === 1 && usages[0].file === declaration.file) {
				category = 'same-file-only-export'; // We know it's exported (private-used was handled above)
			} else if (usages.length > 0) {
				category = 'cross-file';
			}
		} else {
			category = declaration.isExported ? 'unused-export' : 'unused-private';
		}

		results.push({
			name: declaration.name,
			kind: declaration.kind,
			file: declaration.file,
			references: totalReferences,
			usages,
			category,
			isExported: declaration.isExported,
		});
	}

	console.log('\n\n✅ Analysis complete!\n');

	return results;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results: any[]) {
	const timestamp = new Date().toISOString();

	const unusedExports = results.filter((r: { category: string }) => r.category === 'unused-export');
	const unusedPrivate = results.filter((r: { category: string }) => r.category === 'unused-private');
	const sameFileOnlyExport = results.filter((r: { category: string }) => r.category === 'same-file-only-export');
	const privateUsed = results.filter((r: { category: string }) => r.category === 'private-used');
	const crossFile = results.filter((r: { category: string }) => r.category === 'cross-file');

	let markdown = `# Code Usage Report (TypeScript Compiler - ALL Declarations)\n\n`;
	markdown += `**Generated:** ${timestamp}\n`;
	markdown += `**Analysis Method:** TypeScript Compiler API (accurate like VS Code)\n`;
	markdown += `**Scope:** Public exports AND private declarations\n`;
	markdown += `**Total declarations analyzed:** ${results.length}\n\n`;

	markdown += `## Summary\n\n`;
	markdown += `| Category | Count | Percentage |\n`;
	markdown += `|----------|-------|------------|\n`;
	markdown += `| Total declarations | ${results.length} | 100% |\n`;
	markdown += `| ❌ Unused exports | ${unusedExports.length} | ${Math.round((unusedExports.length / results.length) * 100)}% |\n`;
	markdown += `| ❌ Unused private | ${unusedPrivate.length} | ${Math.round((unusedPrivate.length / results.length) * 100)}% |\n`;
	markdown += `| 📁 Exported same-file-only | ${sameFileOnlyExport.length} | ${Math.round((sameFileOnlyExport.length / results.length) * 100)}% |\n`;
	markdown += `| 🔒 Private (used internally) | ${privateUsed.length} | ${Math.round((privateUsed.length / results.length) * 100)}% |\n`;
	markdown += `| ✅ Used across files | ${crossFile.length} | ${Math.round((crossFile.length / results.length) * 100)}% |\n\n`;

	// Unused Exports
	if (unusedExports.length > 0) {
		markdown += `## ❌ Unused Exports (${unusedExports.length})\n\n`;
		markdown += `These **exported** declarations have no references anywhere:\n\n`;
		unusedExports.forEach((result: { name: any; kind: any; file: any }, index: number) => {
			markdown += `${index + 1}. **\`${result.name}\`** (${result.kind}): ✅ Exported - Refs: 0 - **Safe to delete**\n`;
			markdown += `   - File: \`${result.file}\`\n\n`;
		});
	}

	// Unused Private
	if (unusedPrivate.length > 0) {
		markdown += `## ❌ Unused Private Declarations (${unusedPrivate.length})\n\n`;
		markdown += `These **private** (non-exported) declarations have no references anywhere:\n\n`;
		unusedPrivate.forEach((result: { name: any; kind: any; file: any }, index: number) => {
			markdown += `${index + 1}. **\`${result.name}\`** (${result.kind}): ❌ Private - Refs: 0 - **Safe to delete**\n`;
			markdown += `   - File: \`${result.file}\`\n\n`;
		});
	}

	// Same file only exports
	if (sameFileOnlyExport.length > 0) {
		markdown += `## 📁 Exported But Used in Same File Only (${sameFileOnlyExport.length})\n\n`;
		markdown += `These exports are only referenced within their own file:\n\n`;
		sameFileOnlyExport.forEach(
			(result: { name: any; kind: any; file: any; references: any }, index: number) => {
				markdown += `${index + 1}. **\`${result.name}\`** (${result.kind}): ✅ Exported - Refs: ${result.references} (same file) - **Consider removing \`export\`**\n`;
				markdown += `   - File: \`${result.file}\`\n\n`;
			}
		);
	}

	// Private used internally - SKIP detailed listing (too verbose, not actionable)
	// Only show count in summary, don't list all 615 declarations

	// Cross-file
	if (crossFile.length > 0) {
		markdown += `## ✅ Used Across Files (${crossFile.length})\n\n`;
		markdown += `These declarations are referenced by other files (public API):\n\n`;
		crossFile.forEach(
			(
				result: { name: any; kind: any; file: any; references: any; usages: any[]; isExported: any },
				index: number
			) => {
				const exportStatus = result.isExported ? '✅ Exported' : '❌ Private';
				markdown += `${index + 1}. **\`${result.name}\`** (${result.kind}): ${exportStatus} - Refs: ${result.references} - Used in ${result.usages.length} files\n`;
				markdown += `   - File: \`${result.file}\`\n`;
				result.usages.forEach((usage: { file: any; count: any }) => {
					markdown += `     - \`${usage.file}\` (${usage.count} times)\n`;
				});
				markdown += `\n`;
			}
		);
	}

	markdown += `## 💡 Recommendations\n\n`;
	markdown += `- **❌ Unused exports**: Safe to delete (not part of active API)\n`;
	markdown += `- **❌ Unused private**: Safe to delete (dead code)\n`;
	markdown += `- **📁 Same-file-only exports**: Remove \`export\` keyword (make private)\n`;
	markdown += `- **🔒 Private used**: Keep as-is (internal implementation)\n`;
	markdown += `- **✅ Cross-file**: Keep these (actively used public API)\n\n`;
	markdown += `---\n\n`;
	markdown += `*This analysis uses the TypeScript Compiler API for accuracy comparable to VS Code's "Find All References" feature.*\n`;
	markdown += `*Now includes BOTH public exports AND private declarations for complete dead code detection.*\n`;

	return markdown;
}

/**
 * Generate JSON report
 */
function generateJsonReport(results: any[]) {
	const timestamp = new Date().toISOString();

	const unusedExports = results.filter((r: { category: string }) => r.category === 'unused-export');
	const unusedPrivate = results.filter((r: { category: string }) => r.category === 'unused-private');
	const sameFileOnlyExport = results.filter((r: { category: string }) => r.category === 'same-file-only-export');
	const privateUsed = results.filter((r: { category: string }) => r.category === 'private-used');
	const crossFile = results.filter((r: { category: string }) => r.category === 'cross-file');

	return {
		generated: timestamp,
		method: 'TypeScript Compiler API',
		scope: 'Public exports AND private declarations',
		summary: {
			total: results.length,
			unusedExports: unusedExports.length,
			unusedPrivate: unusedPrivate.length,
			sameFileOnlyExport: sameFileOnlyExport.length,
			privateUsed: privateUsed.length,
			crossFile: crossFile.length,
		},
		categories: {
			unusedExports,
			unusedPrivate,
			sameFileOnlyExport,
			// privateUsed: EXCLUDED (too verbose, not actionable - 615 working declarations)
			crossFile,
		},
		// allResults: Filter out private-used to reduce verbosity
		allResults: results.filter((r: { category: string }) => r.category !== 'private-used'),
	};
}

/**
 * Main execution
 */
function main() {
	try {
		const results = analyzeExports();

		console.log('📄 Generating reports...');
		const markdownReport = generateMarkdownReport(results);
		const jsonReport = generateJsonReport(results);

		fs.writeFileSync(OUTPUT_MD, markdownReport);
		fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonReport, null, 2));

		console.log(`✅ Reports saved:`);
		console.log(`   - ${OUTPUT_MD}`);
		console.log(`   - ${OUTPUT_JSON}\n`);

		console.log('📊 Summary:');
		console.log(`   - Total declarations: ${results.length}`);
		console.log(`   - ❌ Unused exports: ${jsonReport.summary.unusedExports}`);
		console.log(`   - ❌ Unused private: ${jsonReport.summary.unusedPrivate}`);
		console.log(`   - 📁 Same-file-only exports: ${jsonReport.summary.sameFileOnlyExport}`);
		console.log(`   - 🔒 Private (used internally): ${jsonReport.summary.privateUsed}`);
		console.log(`   - ✅ Cross-file: ${jsonReport.summary.crossFile}\n`);
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run
if (require.main === module) {
	main();
}

module.exports = { main };
