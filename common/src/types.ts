export * from './utils';

export const GIT_OBJECT_TYPE_HEADER = 'Git-Object-Type';

export enum RepoType {
	local = 'local',
	github = 'github'
}

export enum RefType {
	heads = 'heads',
	tags = 'tags'
}

export enum GitObjectType {
	file = 'file',
	directory = 'directory',
	submodule = 'submodule'
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
