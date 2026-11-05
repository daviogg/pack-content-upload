import type { Category } from './Category';
import type { Description } from './Description';
import type { Language } from './Language';
import type { Provider } from './Provider';
import type { ResourceId } from './ResourceId';
import type { Roles } from './Roles';
import type { StoredFile } from './StoredFile';
import type { Title } from './Title';

export interface ResourceProps {
	id: ResourceId;
	title: Title;
	description: Description;
	category: Category;
	language: Language;
	provider: Provider;
	roles: Roles;
	file: StoredFile;
	uploadedAt: Date;
	viewCount: number;
}

/**
 * Aggregate root: a piece of content uploaded to the library.
 *
 * Every field is a value object that has already enforced its own rules, so
 * the aggregate only has to make sure they travel together and to own the
 * behaviour that changes over time (view counting).
 */
export class Resource {
	private props: ResourceProps;

	private constructor(props: ResourceProps) {
		this.props = { ...props };
	}

	/** Creates a brand-new resource at upload time. */
	static upload(input: Omit<ResourceProps, 'viewCount'>): Resource {
		return new Resource({ ...input, viewCount: 0 });
	}

	/** Rebuilds a resource from persisted data. No business rules re-run here. */
	static reconstitute(props: ResourceProps): Resource {
		return new Resource(props);
	}

	recordView(): void {
		this.props.viewCount += 1;
	}

	get id(): ResourceId {
		return this.props.id;
	}
	get title(): Title {
		return this.props.title;
	}
	get description(): Description {
		return this.props.description;
	}
	get category(): Category {
		return this.props.category;
	}
	get language(): Language {
		return this.props.language;
	}
	get provider(): Provider {
		return this.props.provider;
	}
	get roles(): Roles {
		return this.props.roles;
	}
	get file(): StoredFile {
		return this.props.file;
	}
	get uploadedAt(): Date {
		return this.props.uploadedAt;
	}
	get viewCount(): number {
		return this.props.viewCount;
	}
}
