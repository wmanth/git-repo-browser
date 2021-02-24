import fs from 'fs'
import path from 'path'
import * as Global from '../globals.js'

interface Dictionary<T> {
	[key: string]: T;
}

export enum RepoType {
	LOCAL = "local",
	GITHUB = "github"
}

export interface RepoDesc {
	name: string
	type: RepoType
}

export interface NodegitRepoDesc extends RepoDesc {
	local: string
	remote: string
}

export interface GitHubRepoDesc extends RepoDesc {
	owner: string
	repo: string
	token: string | undefined
}

export default class Inventory {
	private entries: Dictionary<RepoDesc>
	private static instance: Inventory

	private constructor() {
		// check if the REPO_HOME environment variable is set
		if (Global.REPO_HOME === undefined) {
			throw new Error("REPO_HOME environment variable not set.")
		}
		// read the repository inventory file
		const inventoryPath = path.join(Global.REPO_HOME, 'repos.json')
		const data = fs.readFileSync(inventoryPath, 'utf8')
		this.entries = JSON.parse(data)
	}

	static getInstance(): Inventory {
		if (!Inventory.instance) {
			Inventory.instance = new Inventory()
		}
		return Inventory.instance
	}

	getRepoDesc(key: string): RepoDesc {
		return this.entries[key]
	}

	allRepoDescs(): Dictionary<RepoDesc> {
		return this.entries
	}
}
