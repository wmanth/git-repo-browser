export interface RepoInfo {
	name: string
	type: string
	url: string
}

export interface GitHubRepoInfo extends RepoInfo {
	owner: string
	repo: string
	base?: string
	token?: string
}

export interface NodegitRepoInfo extends RepoInfo {
	local: string
	remote: string
}

export interface RepoInventory {
	[id: string]: RepoInfo
}
