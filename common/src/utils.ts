// split a path into a ref-path and file-path
export function splitRefFilePath(path: string, refNames: string[]) : [string, string] {
	const refPathElements: string[] = [];
	const filePathElements = path.split('/');
	let refPath = '';
	let refPathFound = false;
	while (!refPathFound) {
		const pathElement = filePathElements.shift();
		if (!pathElement) { break; }
		refPathElements.push(pathElement);
		refPath = refPathElements.join('/');
		refPathFound = refNames.includes(refPath);
	}
	return [
		refPathFound ? refPath : '',
		refPathFound ? filePathElements.join('/') : path
	];
}

export function findRef(ref: string, refs: string[]): string[] {
	const refSegs = ref.split('/');
	const result: string[] = [];
	refs.forEach(ref => {
		const segs = ref.split('/');
		const left = segs.slice(0, refSegs.length);
		const right = segs.slice(refSegs.length);
		if (refSegs.join() === left.join()) {
			result.push(right.join('/'));
		}
	});
	return result;
}
