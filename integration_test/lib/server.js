var server = module.exports;
var portTempFix = 80; // app.address().port and server.address().port no good!

var path = require('path');
var fs = require('fs');
var wrench = require('wrench');

var express = require('express');
var expressLayouts = require('express-ejs-layouts');

var app = express();

var INDEX_PATH = path.join(__dirname, 'pages/index.html.ejs');
var TEST_PAGE_PATH = path.join(__dirname, '../test_pages');

function getPageNameFromPath(p) {
	return path.join(path.dirname(p), path.basename(p).replace('.html.ejs', ''));
}

function getPageUrlFromPath(p) {	
	if (path.extname(p) != '.ejs') {
		throw new Error('Page files must be of ejs extension.');
	}

	return path.join('/pages', getPageNameFromPath(p));
}

function isLayout(p) {
	return path.basename(p) === 'layout.html.ejs';
}

function isHidden(p) {
	return path.basename(p)[0].match(/\.|_/);
}

function getTestFiles() {
	var paths = wrench.readdirSyncRecursive(TEST_PAGE_PATH);

	var filePaths = paths.filter(function(p) {
		var absolutePath = path.join(TEST_PAGE_PATH, p);
		return fs.lstatSync(absolutePath).isFile() && !isLayout(p) && !isHidden(p);
	});

	return filePaths.map(function(p) {
		return {
			href: getPageUrlFromPath(p),
			name: getPageNameFromPath(p)
		};
	});
}

app.get('/', function(req, res) {

	res.render(INDEX_PATH, {
		pages: getTestFiles(),
		layout: false
	});
});

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout.html.ejs');

var spiritualDistDir = path.join(__dirname, '..', '..', 'node_modules/client-spiritual/dist');
var tsDistDir = path.join(__dirname, '..', '..', 'dist');

app.use('/spiritual_dist', express.static(spiritualDistDir));
app.use('/dist', express.static(tsDistDir));
app.use('/ext', express.static(path.join(__dirname, '..', 'ext')));

app.set('views', TEST_PAGE_PATH);

app.get('/pages/:page*', function(req, res) {
	var page = req.originalUrl.replace('/pages/', '');

	var params = {
		page: page,
		isSelenium: server.isSelenium,
		host: getip(),
		port: portTempFix
	};

	if (page[0] === '_') {
		params.layout = false;
	}

	res.render(page + '.html.ejs', params);
});

server.isSelenium = false;

server.listen = function(port, cb) {
	app.listen(port, function() {
		portTempFix = port;
		cb();
	});
};

/**
 * Dig up our network IP.
 * @returns {string}
 */
function getip() {
	var result = null;
	var ifaces = require('os').networkInterfaces();
	Object.keys(ifaces).forEach(function(dev) {
		ifaces[dev].every(function(details){
			if (details.family === 'IPv4') {
				result = details.address;
			}
			return !result;
		});
	});
	if(result === '127.0.0.1') {
		result = 'localhost'; // otherwise not work offline (?)
	}
	return result;
}
