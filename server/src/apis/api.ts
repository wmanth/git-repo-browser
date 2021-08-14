import * as common from '@wmanth/git-repo-common';

export class Directory {
	constructor(private entries: common.GitTreeEntry[]) {}
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
