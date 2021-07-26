export enum TreeEntryType {
	eFile = "file",
	eDirectory = "directory",
	eSubmodule = "submodule"
}

export interface TreeEntry {
	name: string
	path: string
	type: TreeEntryType
}

export class Directory {
	constructor(private entries: TreeEntry[]) {}
	getEntries() { return this.entries; }
}

export class Submodule {
	constructor(private sha: string) { }
	getSha(): string { return this.sha; }
}

export default interface RepoAPI {
	getRefs(): Promise<string[]>;
	getContent(ref: string, path: string): Promise<Buffer | Directory | Submodule>;
}
