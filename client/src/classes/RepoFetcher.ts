interface Dictionary<T> {
    [key: string]: T;
}

interface InventoryEntry {
    name: string
    local: string
    remote: string
}

var repos: Dictionary<InventoryEntry>

export const fetchRepoIds = async () => {
	const response = await fetch('/repos/list')
	repos = await response.json()
	return Object.keys(repos)
}

export const fetchTags = async (repo: string) => {
	const response = await fetch(`/repos/${repo}/tags`)
	const tags = await response.json()
	return tags as string[]
}

export function getRepoName(id: string) {
	if (repos === undefined) return ""
	return repos[id].name
}
