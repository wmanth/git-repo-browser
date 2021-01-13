export interface RepoInfo {
    name: string
    local: string
    remote: string
}

interface Dictionary<T> {
	[key: string]: T
}

export type RepoInventory = Dictionary<RepoInfo>
