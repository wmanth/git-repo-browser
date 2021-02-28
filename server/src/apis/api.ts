import { RepoDesc } from '../routes/repos.js'

export enum TreeEntryType {
	File = "file",
	Directory = "directory",
	Submodule = "submodule"
}

export interface TreeEntry {
	name: string
	path: string
	type: TreeEntryType
}

export class Directory {
	constructor(private entries: TreeEntry[]) {}
	getEntries() { return this.entries }
}

export class Submodule {
	constructor(private sha: string) { }
	getSha(): string { return this.sha }
}

export default abstract class RepoAPI {

	constructor(desc: RepoDesc) {}

	abstract fetchRefs(): Promise<string[]>
	abstract fetchContent(ref: string, path: string): Promise<Buffer | Directory | Submodule>

	async fetchTreeEntry(path: string): Promise<Buffer|Directory|Submodule> {
		const refs = await this.fetchRefs()

		// split the wildcard path into a ref-path and file-path
		const refPathElements: string[] = []
		const filePathElements = path.split('/')
		let refPath: string
		let filePath: string
		while (filePathElements.length) {
			refPathElements.push(filePathElements.shift())
			refPath = refPathElements.join('/')
			filePath = filePathElements.join('/')
			if (refs.includes(refPath)) break
		}
		return this.fetchContent(refPath, filePath)
	}
}
