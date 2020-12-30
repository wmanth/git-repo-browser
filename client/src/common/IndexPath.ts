export default class IndexPath {
	indexes: number[]

	static empty: IndexPath = new IndexPath([])

	constructor(indexes: number[]) {
		this.indexes = indexes
	}

	static fromString(str: string): IndexPath {
		return new IndexPath(str.split('-').map(index => parseInt(index)))
	}

	toString(): string {
		return this.indexes.join('-')
	}
}
