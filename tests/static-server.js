/*
 * Minimal, dependency-free static file server for the Jasmine spec runner.
 * Serves spec/jasmine/ (the folder `grunt jasmine` populates with ts.js,
 * ts.css, specs.js and index.html) so Playwright can load it in a real
 * browser. Used as Playwright's `webServer` in playwright.config.js.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2]) || 8974;
const ROOT = path.join(__dirname, '..', 'spec', 'jasmine');

const TYPES = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.map': 'application/json',
	'.json': 'application/json'
};

http
	.createServer((req, res) => {
		const urlPath = decodeURIComponent(req.url.split('?')[0]);
		const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
		// Guard against path traversal outside the served root.
		if (!filePath.startsWith(ROOT)) {
			res.writeHead(403).end('Forbidden');
			return;
		}
		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404).end('Not found');
				return;
			}
			res.writeHead(200, {
				'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
				'Cache-Control': 'no-cache'
			});
			res.end(data);
		});
	})
	.listen(PORT, () => {
		console.log(`Serving spec/jasmine on http://localhost:${PORT}`);
	});
