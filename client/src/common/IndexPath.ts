export default class IndexPath {
	private indexes: number[]

	static empty: IndexPath = new IndexPath([])

	constructor(indexes: number[]) {
		this.indexes = indexes
	}

	static fromString(str: string): IndexPath {
		return new IndexPath(str.split('-').map(index => parseInt(index)))
	}

	getIndexes(): number[] {
		return Object.assign([], this.indexes);
	}

	toString(): string {
		return this.indexes.join('-')
	}
}
