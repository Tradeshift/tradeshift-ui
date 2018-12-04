const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mime = require('mime');
const s3 = require('s3');

http.globalAgent.maxSockets = https.globalAgent.maxSockets = 20;

const client = s3.createClient({
	s3Options: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	},
	maxAsyncS3: 5
});

const params = {
	localDir: path.join(path.dirname(fs.realpathSync(__filename)), '../public'),

	s3Params: {
		Bucket: 'tsresources',
		Prefix: 'prod/client/',
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

fs.readdir(params.localDir, (readErr, items) => {
	if (readErr) {
		console.error(JSON.stringify(readErr, null, 4));
	}
	items.forEach(file => {
		const fileParams = Object.assign({}, params, {
			localFile: `${params.localDir}/${file}`,
			s3Params: Object.assign({}, params.s3Params, {
				ContentType: mime.lookup(file),
				Key: `${params.s3Params.Prefix}${file}`
			})
		});
		delete fileParams.localDir;
		delete fileParams.s3Params.Prefix;
		const uploader = client.uploadFile(fileParams);

		console.log(chalk.magenta(`[${file}] `) + 'Uploading...');
		uploader.on('error', uploadErr => {
			console.error(
				chalk.magenta(`[${file}] `) +
					'S3 uploading ' +
					chalk.red('failed') +
					'\n' +
					JSON.stringify(uploadErr, null, 4)
			);
		});
		uploader.on('progress', () => {
			if (uploader.progressTotal > 0) {
				const percentage = (uploader.progressAmount / uploader.progressTotal) * 100;
				console.log(chalk.magenta(`[${file}] `) + chalk.magenta(`${percentage || 0}%`));
			}
		});
		uploader.on('end', () => {
			console.log(
				chalk.magenta(`[${file}] `) + `Uploaded ` + chalk.green('successfully') + ' to S3!'
			);
		});
	});
});
