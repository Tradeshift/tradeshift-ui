#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const S3 = require('aws-sdk/clients/s3');
const lookupType = require('mime-types').lookup;

function walk(dir) {
	let results = [];
	fs.readdirSync(dir).forEach(file => {
		file = dir + '/' + file;
		const stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			results = results.concat(walk(file));
		} else {
			results.push(file);
		}
	});
	return results;
}

class S3Deployer {
	constructor() {
		this.BUCKET = 'tsresources';
		this.BASE_PATH = 'prod/client';
		this.LOCAL_DIR = path.join(path.dirname(fs.realpathSync(__filename)), '../dist/cdn');

		this.client = new S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
		});
	}

	/** Upload files to s3 */
	uploadToS3() {
		const errorHandler = err => {
			console.error('Something went wrong...');
			console.error(JSON.stringify(err, null, 4));
			process.exit(3);
		};
		const tasks = walk(this.LOCAL_DIR).map(file => {
			const relativeName = file.substring(this.LOCAL_DIR.length + 1);
			console.log(
				`Uploading file from ${file} to s3://${this.BUCKET}/${this.BASE_PATH}/${relativeName} ...`
			);
			const fileData = fs.createReadStream(file);
			const mimeType = lookupType(file) || 'application/octet-stream';
			const params = {
				Bucket: this.BUCKET,
				Key: `${this.BASE_PATH}/${relativeName}`,
				ACL: 'public-read',
				ContentType: mimeType,
				Body: fileData,
				CacheControl: 'max-age=29030400, public'
			};

			return this.client
				.putObject(params)
				.promise()
				.then(() => {
					console.log(`${file} Upload done.`);
				})
				.catch(errorHandler);
		});

		Promise.all(tasks)
			.then(() => {
				console.log('All files uploaded.');
				console.log('Deployed successfully to S3!');
				process.exit(0);
			})
			.catch(errorHandler);
	}
}

const deployer = new S3Deployer();
deployer.uploadToS3();
