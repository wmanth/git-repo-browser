export default class IndexPath {
	private indexes: number[]

	static empty: IndexPath = new IndexPath([])

	constructor(indexes: number[]) {
		this.indexes = indexes.map(value => value)
	}

	static fromString(str: string): IndexPath {
		return new IndexPath(str.split('-').map(index => parseInt(index)))
	}

	indexPathAppendingIndex(index: number) {
		const indexes = this.indexes.map(value => value);
		indexes.push(index)
		return new IndexPath(indexes)
	}

	getIndexes(): number[] {
		return this.indexes.map(value => value);
	}

	toString(): string {
		return this.indexes.join('-')
	}

	isEmpty(): boolean {
		return this.indexes.length === 0
	}
}
