import fs from 'fs';
import path from 'path';
import util from 'util';
import YAML from 'yaml';
import RepoAPI from '../apis/api';
import * as common from '@wmanth/git-repo-common';
import GitHubAPI from '../apis/github';
import NodegitAPI from '../apis/nodegit';

export default interface Config {
	getRepoInventory(): Promise<common.RepoInventory>
	getRepoAPI(repoId: string): Promise<RepoAPI>
}

// https://stackoverflow.com/questions/46867517
const readFile = util.promisify(fs.readFile);

export class DefaultConfig implements Config {

	static instance = new DefaultConfig();

	readonly home: string;

	constructor() {
		if (!process.env.REPO_HOME) {
			throw new Error("REPO_HOME environment variable not set.");
		}
		this.home = process.env.REPO_HOME;
	}


	private async readConfig(): Promise<any> {
		const repoConfigPath = path.join(this.home, 'repos.yaml');
		const repoConfigData = await readFile(repoConfigPath, 'utf8');
		return YAML.parse(repoConfigData);
	}

	async getRepoInventory(): Promise<common.RepoInventory> {
		const config = await this.readConfig();
		const inventory: common.RepoInventory = {};
		Object.keys(config).forEach(key => {
			inventory[key] = {
				name: config[key].name,
				type: config[key].type,
			};
		});
		return inventory;
	}

	async getRepoAPI(repoId: string): Promise<RepoAPI> {
		const config = await this.readConfig();
		const repoDesc = config[repoId];
		switch (repoDesc.type) {
			case common.RepoType.local:
				return new NodegitAPI(this.home, repoDesc.config as common.NodegitRepoConfig);

			case common.RepoType.github:
				return new GitHubAPI(repoDesc.config as common.GitHubRepoConfig);

			default:
				throw new Error(`Could not get repo API for '${repoId}'`);
		}
	}
}
