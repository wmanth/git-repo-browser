import fetch, { Headers } from 'node-fetch';
import { log } from '../globals.js';
import { GitHubRepoConfig } from '@wmanth/git-repo-common';
import RepoAPI, { Directory, Submodule, TreeEntry, TreeEntryType } from './api.js';

function githubObjectToItem(content: any): TreeEntry {
	return {
		name: content.name,
		path: content.path,
		type: content.type === 'dir' ? TreeEntryType.eDirectory
			: TreeEntryType.eFile
	};
}

export default class GitHubAPI implements RepoAPI {
	private owner: string;
	private repo: string;
	private token?: string;
	private baseUrl: string;

	constructor(config: GitHubRepoConfig) {
		this.owner = config.owner;
		this.repo = config.repo;
		this.token = config.token;
		this.baseUrl = config.base || 'https://api.github.com';
	}

	getHeaders() {
		const headers = new Headers();
		if (this.token) {
			headers.append('Authorization', `token ${this.token}`);
		}
		return headers;
	}

	async getRefs(): Promise<string[]> {
		const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/matching-refs/`;
		log.info(`Fetching ${url}`);

		const headers = this.getHeaders();
		const response = await fetch(url, { headers });

		if (!response.ok) {
			return Promise.reject(new Error(response.statusText));
		}

		const refList = await response.json();
		return refList.map((refItem: { [key: string]: string | any }) => refItem.ref.slice('refs/'.length));
	}

	async getContent(ref: string, path: string) {
		const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${ref}`;
		log.info(`Fetching ${url}`);

		const headers = this.getHeaders();
		headers.append('Accept', 'application/vnd.github.v3+json');
		const response = await fetch(url, { headers });

		if (!response.ok) {
			return Promise.reject(new Error(response.statusText));
		}

		const json = await response.json();
		if (Array.isArray(json)) {
			return new Directory(json.map(githubObjectToItem));
		}
		else if (json.type === 'file') {
			return Buffer.from(json.content, json.encoding);
		}
		else if (json.type === 'submodule') {
			return new Submodule(json.sha);
		}
		log.info(json);

		return Promise.reject(new Error('unknown error'));
	}
}
