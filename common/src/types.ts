export enum RepoType {
	local = 'local',
	github = 'github'
}

export interface RepoInfo {
	name: string
	type: RepoType
}

export interface RepoInventory {
	[id: string]: RepoInfo
}

export interface GitHubRepoConfig {
	owner: string
	repo: string
	base?: string
	token?: string
}

export interface NodegitRepoConfig {
	local: string
	remote: string
}
