const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const s3 = require('s3');

const keys = require('../aws-keys.json');

http.globalAgent.maxSockets = https.globalAgent.maxSockets = 20;

const client = s3.createClient({
	s3Options: {
		accessKeyId: keys.AWSAccessKeyId,
		secretAccessKey: keys.AWSSecretKey
	},
	maxAsyncS3: 5
});

const params = {
	localDir: path.join(path.dirname(fs.realpathSync(__filename)), '../public'),

	s3Params: {
		Bucket: 'tsresources',
		Prefix: `prod/client/`,
		ACL: 'public-read',
		CacheControl: 'max-age=29030400, public',
		ContentEncoding: 'gzip'
	},
	followSymlinks: false
};

console.log('Uploading directory from');
console.log(chalk.cyan(params.localDir));
console.log('to');
console.log(chalk.cyan(`s3://${params.s3Params.Bucket}/${params.s3Params.Prefix}`));
console.log();
var uploader = client.uploadDir(params);
uploader.on('error', (err) => {
	console.error('S3 uploading ' + chalk.red('failed') + '!');
	console.error(JSON.stringify(err, null, 4));
});
uploader.on('progress', () => {
	if (uploader.progressTotal > 0) {
		const percentage = (uploader.progressAmount / uploader.progressTotal) * 100;
		console.log(chalk.magenta(`${percentage || 0}%`));
	}
});
uploader.on('end', () => {
	console.log('Deployed ' + chalk.green('successfully') + ' to S3!');
});
