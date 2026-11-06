import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FileStorage, SignedUrlOptions } from '../../application/ports/FileStorage';
import { contentDisposition } from '../http/contentDisposition';

export interface S3Config {
	bucket: string;
	region: string;
	endpoint: string;
	accessKeyId: string;
	secretAccessKey: string;
	/** How long a signed URL stays valid. */
	signedUrlTtlSeconds?: number;
}

/**
 * Adapter: FileStorage on any S3-compatible bucket (Cloudflare R2 in production).
 * The bucket stays private: the browser gets a short-lived signed URL that also
 * fixes the Content-Type and Content-Disposition, so viewing and downloading
 * behave exactly like the streamed fallback.
 */
export class S3FileStorage implements FileStorage {
	private readonly client: S3Client;
	private readonly bucket: string;
	private readonly ttl: number;

	constructor(config: S3Config) {
		this.bucket = config.bucket;
		this.ttl = config.signedUrlTtlSeconds ?? 15 * 60;
		this.client = new S3Client({
			region: config.region,
			endpoint: config.endpoint,
			// https://<endpoint>/<bucket>/<key>, the form Cloudflare documents for R2.
			forcePathStyle: true,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey
			},
			// R2 does not implement the newer AWS checksum headers: only send them when S3 requires them.
			requestChecksumCalculation: 'WHEN_REQUIRED',
			responseChecksumValidation: 'WHEN_REQUIRED'
		});
	}

	async put(key: string, file: Blob): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				// The multipart parser already holds the file in memory (≤ 200 MB), so a buffer costs nothing extra.
				Body: new Uint8Array(await file.arrayBuffer()),
				ContentLength: file.size,
				ContentType: file.type || 'application/octet-stream'
			})
		);
	}

	async open(key: string): Promise<ReadableStream<Uint8Array>> {
		const object = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
		if (!object.Body) throw new Error(`Object "${key}" has no body`);
		return object.Body.transformToWebStream();
	}

	async getSignedUrl(key: string, options: SignedUrlOptions): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucket,
			Key: key,
			ResponseContentType: options.mimeType,
			ResponseContentDisposition: contentDisposition(options.disposition, options.fileName)
		});
		return getSignedUrl(this.client, command, { expiresIn: this.ttl });
	}

	async delete(key: string): Promise<void> {
		await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
	}
}
