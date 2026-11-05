import { DomainError } from '../shared/DomainError';

/** Coarse classification used by the list filters and the in-platform viewer. */
export type FileKind = 'pdf' | 'video' | 'text' | 'slides' | 'image';

/** Mime types the platform accepts, each mapped to its kind. Extend to allow more. */
const KIND_BY_MIME: Record<string, FileKind> = {
	'application/pdf': 'pdf',
	'text/plain': 'text',
	'text/markdown': 'text',
	'video/mp4': 'video',
	'video/webm': 'video',
	'video/quicktime': 'video',
	'application/vnd.ms-powerpoint': 'slides',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slides',
	'application/vnd.apple.keynote': 'slides',
	'image/png': 'image',
	'image/jpeg': 'image',
	'image/webp': 'image'
};

export interface StoredFileProps {
	/** Location inside the FileStorage (e.g. "resources/<id>/guide.pdf"). */
	key: string;
	/** File name as chosen by the uploader, for display and download. */
	originalName: string;
	mimeType: string;
	sizeBytes: number;
}

/**
 * Value object: metadata of an uploaded file. The bytes live in a FileStorage;
 * this object is the domain's "receipt" for them.
 *
 * Invariants: accepted mime type, 0 < size <= MAX_SIZE_BYTES, non-empty key and name.
 * Validation happens here, before any byte is written to storage.
 */
export class StoredFile {
	static readonly MAX_SIZE_BYTES = 200 * 1024 * 1024;

	readonly key: string;
	readonly originalName: string;
	readonly mimeType: string;
	readonly sizeBytes: number;
	readonly kind: FileKind;

	private constructor(props: StoredFileProps, kind: FileKind) {
		this.key = props.key;
		this.originalName = props.originalName;
		this.mimeType = props.mimeType;
		this.sizeBytes = props.sizeBytes;
		this.kind = kind;
	}

	static create(props: StoredFileProps): StoredFile {
		if (props.key.trim().length === 0 || props.originalName.trim().length === 0) {
			throw new DomainError('FILE_MISSING', 'A file is required', 'file');
		}
		const kind = KIND_BY_MIME[props.mimeType];
		if (!kind) {
			throw new DomainError(
				'FILE_TYPE_NOT_ALLOWED',
				`File type "${props.mimeType}" is not allowed`,
				'file'
			);
		}
		if (!Number.isInteger(props.sizeBytes) || props.sizeBytes <= 0) {
			throw new DomainError('FILE_EMPTY', 'The file is empty', 'file');
		}
		if (props.sizeBytes > StoredFile.MAX_SIZE_BYTES) {
			throw new DomainError(
				'FILE_TOO_LARGE',
				`File must be at most ${StoredFile.MAX_SIZE_BYTES / (1024 * 1024)} MB`,
				'file'
			);
		}
		return new StoredFile(props, kind);
	}

	static isMimeTypeAllowed(mimeType: string): boolean {
		return mimeType in KIND_BY_MIME;
	}

	/** Accepted mime types, e.g. for the file input's `accept` attribute. */
	static allowedMimeTypes(): string[] {
		return Object.keys(KIND_BY_MIME);
	}

	equals(other: StoredFile): boolean {
		return this.key === other.key;
	}
}
