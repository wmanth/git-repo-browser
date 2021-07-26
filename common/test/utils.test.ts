import * as utils from '../src/utils';
import { expect } from  'chai';

const refs = [
	'heads/master',
	'heads/dev/feature-A',
	'heads/dev/feature-B'
];

describe("Splitting a path into ref and file path", () => {
	it("with incomplete ref path", () => {
		const [ref, path] = utils.splitRefFilePath('heads', refs);
		expect(ref).equal('', 'ref path');
		expect(path).equal('heads', 'file path');
	}); 

	it("with complete ref path without file path", () => {
		const [ref, path] = utils.splitRefFilePath('heads/master', refs);
		expect(ref).equal('heads/master', 'ref path');
		expect(path).equal('', 'file path');
	}); 

	it("with complete ref path and file path", () => {
		const [ref, path] = utils.splitRefFilePath('heads/master/folder/file.txt', refs);
		expect(ref).equal('heads/master', 'ref path');
		expect(path).equal('folder/file.txt', 'file path');
	}); 

	it("with wrong ref path", () => {
		const [ref, path] = utils.splitRefFilePath('heads/dev/test/folder/file.txt', refs);
		expect(ref).equal('', 'ref path');
		expect(path).equal('heads/dev/test/folder/file.txt', 'file path');
	}); 
});

describe("Find matching sub-path", () => {
	it ("which is incomplete", function() {
		const ref = 'head';
		const result = utils.findRef(ref, refs);
		expect(result.length).equal(0);
	});
		
	it ("which matches for one segment", function() {
		const ref = 'heads';
		const result = utils.findRef(ref, refs);
		expect(result.length).equal(3);
		expect(result[0]).equals('master');
		expect(result[1]).equals('dev/feature-A');
		expect(result[2]).equals('dev/feature-B');
	});


	it ("which matches for two segments", function() {
		const ref = 'heads/dev';
		const result = utils.findRef(ref, refs);
		expect(result.length).equal(2);
		expect(result[0]).equals('feature-A');
		expect(result[1]).equals('feature-B');
	});
});
