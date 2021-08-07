import fs from 'fs';
import path from 'path';
import util from 'util';
import YAML from 'yaml';
import RepoAPI from '../apis/api';
import * as Global from '../globals.js';
import * as common from '@wmanth/git-repo-common';
import GitHubAPI from '../apis/github.js';
import NodegitAPI from '../apis/nodegit.js';

export default interface Config {
	getRepoInventory(): Promise<common.RepoInventory>
	getRepoAPI(repoId: string): Promise<RepoAPI>
}

// https://stackoverflow.com/questions/46867517
const readFile = util.promisify(fs.readFile);

export class DefaultConfig implements Config {

	static instance = new DefaultConfig();

	private async readConfig(): Promise<any> {
		const repoConfigPath = path.join(Global.REPO_HOME, 'repos.yaml');
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
				return new NodegitAPI(repoDesc.config as common.NodegitRepoConfig);
	
			case common.RepoType.github:
				return new GitHubAPI(repoDesc.config as common.GitHubRepoConfig);
	
			default:
				throw new Error(`Could not get repo API for '${repoId}'`);
		}
	}
}
