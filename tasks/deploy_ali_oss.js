const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const oss = require('ali-oss').Wrapper;

const client = oss({
	accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID,
	accessKeySecret: process.env.ALI_OSS_SECRET_ACCESS_KEY,
	bucket: process.env.ALI_OSS_BUCKET,
	region: process.env.ALI_OSS_REGION
});

const params = {
	localDir: path.join(path.dirname(fs.realpathSync(__filename)), '../dist/cdn'),
	Prefix: process.env.ALI_OSS_PATH_PREFIX
};

console.log('Uploading directory from');
console.log(chalk.cyan(params.localDir));
console.log('to');
console.log(chalk.cyan(params.Prefix));
console.log();

fs.readdir(params.localDir, (readErr, items) => {
	if (readErr) {
		console.error(JSON.stringify(readErr, null, 4));
	}
	items.forEach(file => {
		console.log(chalk.magenta(`[${file}] `) + 'Uploading...');

		client
			.put(`${params.Prefix}/${file}`, `${params.localDir}/${file}`)
			.then(function() {
				console.log(chalk.magenta(`[${file}] `) + 'Upload done.');
			})
			.catch(function(err) {
				console.error(err);
			});
	});
});
