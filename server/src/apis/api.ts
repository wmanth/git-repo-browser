import { RepoInfo } from '@wmanth/git-repo-types';

export enum ApiType {
	eLocal = "local",
	eGitHub = "github"
}

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

export default abstract class RepoAPI {

	constructor(readonly desc: RepoInfo) {}

	abstract fetchRefs(): Promise<string[]>;
	abstract fetchContent(ref: string, path: string): Promise<Buffer | Directory | Submodule>;

	async fetchTreeEntry(path: string): Promise<Buffer|Directory|Submodule> {
		const refs = await this.fetchRefs();

		// split the wildcard path into a ref-path and file-path
		const refPathElements: string[] = [];
		const filePathElements = path.split('/');
		let refPath = "";
		let filePath = filePathElements.join('/');
		while (true) {
			const nextPathElement = filePathElements.shift();
			if (!nextPathElement) { break; }
			refPathElements.push(nextPathElement);
			refPath = refPathElements.join('/');
			filePath = filePathElements.join('/');
			if (refs.includes(refPath)) { break; }
		}
		return this.fetchContent(refPath, filePath);
	}
}
