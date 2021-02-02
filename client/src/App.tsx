import { Fragment, useState } from 'react'
import SplitView from './components/SplitView'
import { GitTree, GitTreeNode } from './common/GitTree'
import GitRepo, { GitRef } from './common/GitRepo'
import RepoSelector from './components/RepoSelector'
import RefSelector from './components/RefSelector'
import GitTreeView from './components/GitTreeView'
import ContentView from './components/ContentView'
import "./App.css"

export type SelectionHandler = (node: GitTreeNode) => void
export type UpdateTreeHandler = (path: string) => Promise<void>

export default function App() {
	const initializeGitTree = () => {
		const lastRepo = localStorage.getItem('lastRepo') || ""
		GitRepo.fetchInventory()
		.then(inventory => {
			const repoIds = Object.keys(inventory)
			const repo = new GitRepo(repoIds.includes(lastRepo) ? lastRepo : repoIds[0])
			handleRepoChanged(repo)
		})
		.catch(err => console.error(err));
	}

	const [gitTree, setGitTree] = useState<GitTree | undefined>(() => { initializeGitTree(); return undefined })
	const [selectedNode, setSelectedNode] = useState<GitTreeNode | undefined>(undefined)

	const handleRefChanged = (ref: GitRef) => {
		if (gitTree) {
			setGitTree(new GitTree(gitTree.getRepo(), ref))
			setSelectedNode(undefined)
		}
	}

	const handleSelected = (node: GitTreeNode) => {
		console.log(`selected '${node.getPath()}'`)
		setSelectedNode(node)
	}

	const handleRepoChanged = (repo: GitRepo) => {
		GitTree.master(repo)
		.then(gitTree => setGitTree(gitTree))
		.catch(err => console.error(err));
	}

	const Separator = () => <div className="separator">&rsaquo;</div>

	return (
		<Fragment>
			<header>
				<RepoSelector gitTree={ gitTree } onSelect={ handleRepoChanged }/>
				<Separator />
				<RefSelector gitTree={ gitTree } onSelect={ handleRefChanged }/>
				<Separator />
			</header>
			<section>
				<SplitView
					sidebar={ <GitTreeView gitTree={ gitTree } onSelect={ handleSelected } /> }
					content={ <ContentView  /> } />
			</section>
			<footer>
				<div>Footer</div>
			</footer>
		</Fragment>
	)
}
