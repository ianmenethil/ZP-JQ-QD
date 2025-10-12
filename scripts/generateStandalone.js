#!/usr/bin/env node
/**
 * Generate Standalone ZenPay Demo File
 * Creates a single-file HTML with all assets inlined
 * Usage: node scripts/generateStandalone.js --merchant=ABC123 --apiKey=xyz --username=user --password=pass
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
	const [key, value] = arg.replace('--', '').split('=');
	acc[key] = value;
	return acc;
}, {});

// Default credentials
const config = {
	merchantCode: args.merchant || args.merchantCode || 'DEMO',
	apiKey: args.apiKey || '',
	username: args.username || '',
	password: args.password || '',
};

console.log('🚀 Generating standalone ZenPay demo file...');
console.log(`📦 Merchant Code: ${config.merchantCode}`);

// Paths
const buildDir = path.join(__dirname, '..', 'build');
const htmlPath = path.join(buildDir, 'index.html');
const cssPath = path.join(buildDir, 'css', 'bundle.min.css');
const jsPath = path.join(buildDir, 'js', 'bundle.min.js');
const outputPath = path.join(__dirname, '..', `ZenPay-Singlefile-${config.merchantCode}.html`);

// Check if build files exist
if (!fs.existsSync(htmlPath)) {
	console.error('❌ Error: build/index.html not found. Run "npm run build" first.');
	process.exit(1);
}

if (!fs.existsSync(cssPath)) {
	console.error('❌ Error: build/css/bundle.min.css not found. Run "npm run build" first.');
	process.exit(1);
}

if (!fs.existsSync(jsPath)) {
	console.error('❌ Error: build/js/bundle.min.js not found. Run "npm run build" first.');
	process.exit(1);
}

// Read files
console.log('📖 Reading build files...');
let html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// Read data files
const inputParamsPath = path.join(buildDir, 'public', 'jq-input-parameters.json');
const outputParamsPath = path.join(buildDir, 'public', 'jq-output-parameters.json');
const errorCodesPath = path.join(buildDir, 'public', 'jq-error-codes.json');

const inputParams = fs.existsSync(inputParamsPath) ? fs.readFileSync(inputParamsPath, 'utf8') : '[]';
const outputParams = fs.existsSync(outputParamsPath) ? fs.readFileSync(outputParamsPath, 'utf8') : '{}';
const errorCodes = fs.existsSync(errorCodesPath) ? fs.readFileSync(errorCodesPath, 'utf8') : '[]';

// Remove dev mode scripts and references
console.log('🧹 Cleaning HTML...');
html = html.replace(/<script[^>]*src="[^"]*\/@vite\/client[^"]*"[^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*src="[^"]*\/src\/ts\/index\.ts[^"]*"[^>]*><\/script>/gi, '');
html = html.replace(/<link[^>]*href="[^"]*\/css\/bundle(?:\.min)?\.css"[^>]*>/gi, '');
html = html.replace(/<script[^>]*src="[^"]*\/js\/bundle(?:\.min)?\.js"[^>]*><\/script>/gi, '');
html = html.replace(/<link[^>]*href="[^"]*favicon[^"]*"[^>]*>/gi, '');
html = html.replace(/<!--\s*Custom CSS is imported via TypeScript[^>]*-->/gi, '');
html = html.replace(/^\s*[\r\n]/gm, '');

// Inline CSS
console.log('💅 Inlining CSS...');
const headCloseIndex = html.indexOf('</head>');
if (headCloseIndex !== -1) {
	html = html.substring(0, headCloseIndex) + `\n<style>\n${css}\n</style>\n` + html.substring(headCloseIndex);
}

// Generate initialization script with inlined data
const initScript = `
<script>
// Inline data files to avoid fetch errors
window.__ZENPAY_DATA__ = {
  inputParameters: ${inputParams},
  outputParameters: ${outputParams},
  errorCodes: ${errorCodes}
};

// Intercept fetch calls to return inlined data
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url === '/public/jq-input-parameters.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.inputParameters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  if (url === '/public/jq-output-parameters.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.outputParameters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  if (url === '/public/jq-error-codes.json') {
    return Promise.resolve(new Response(JSON.stringify(window.__ZENPAY_DATA__.errorCodes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  return originalFetch.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded', function() {
  // Pre-fill credentials
  const apiKeyField = document.getElementById('apiKeyInput');
  if (apiKeyField) apiKeyField.value = "${config.apiKey}";

  const usernameField = document.getElementById('usernameInput');
  if (usernameField) usernameField.value = "${config.username}";

  const passwordField = document.getElementById('passwordInput');
  if (passwordField) passwordField.value = "${config.password}";

  const merchantCodeField = document.getElementById('merchantCodeInput');
  if (merchantCodeField) merchantCodeField.value = "${config.merchantCode}";

  console.log('ZenPay standalone configuration loaded successfully');
});
</script>`;

// Inline JS and inject initialization
console.log('⚙️  Inlining JavaScript...');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (bodyCloseIndex === -1) {
	console.error('❌ Error: Could not find </body> tag in HTML');
	process.exit(1);
}

html =
	html.substring(0, bodyCloseIndex) +
	`\n<script>\n${js}\n</script>\n` +
	initScript +
	'\n' +
	html.substring(bodyCloseIndex);

// Write output file
console.log(`💾 Writing to: ${outputPath}`);
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✅ Standalone file generated successfully!');
console.log(`📄 File: ${path.basename(outputPath)}`);
console.log(`📏 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
console.log('\n💡 Open the file in your browser to test');
