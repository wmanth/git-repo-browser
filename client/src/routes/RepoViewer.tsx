import { createContext, useCallback, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import SplitView from '../components/SplitView'
import { GitTree, GitTreeNode } from '../common/GitTree'
import GitRepo, { GitRef } from '../common/GitRepo'
import RepoSelector from '../components/RepoSelector'
import RefSelector from '../components/RefSelector'
import FileNavigator from '../components/FileNavigator'
import GitTreeView from '../components/GitTreeView'
import ContentView from '../components/ContentView'
import NotFound from '../components/NotFound'
import './RepoViewer.css'

export type SelectionHandler = (node: GitTreeNode) => void
export type UpdateTreeHandler = (path: string) => Promise<void>

export const RepoViewerRoute = '/repo'

interface RepoViewerContextType {
	selectNode: (node: GitTreeNode) => void
}

export const RepoViewerContext = createContext<RepoViewerContextType>({
	selectNode: () => {}
})

export default function RepoViewer(props: RouteComponentProps) {
	const [gitTree, setGitTree] = useState<GitTree | undefined>()
	const [selectedNode, setSelectedNode] = useState<GitTreeNode | undefined>()
	const [isValid, setValid] = useState(true)

	useEffect(() => {
		const decodeRouterPath = async (routerPath: string) => {
			const regex = new RegExp(`^${RepoViewerRoute}/?([\\w.-]*)/?(.*)?$`, 'g')
			const match = regex.exec(routerPath)
			const repoId = match ? match[1] : undefined
			const refPath = match ? match[2] : undefined
			if (!repoId) {
				const newRepoId = await getDefaultRepoId()
				return newRepoId ? `${RepoViewerRoute}/${newRepoId}` : undefined
			}
			const repo = await getRepo(repoId)
			if (refPath) {
				await validateRefPath(repo, refPath)
			}
			else {
				const branch = await repo.defaultBranch()
				return `${RepoViewerRoute}/${repoId}/${branch.refName}`
			}
			return undefined
		}

		decodeRouterPath(props.location.pathname)
		.then(replace => {
			if (replace) props.history.replace(replace)
			else setValid(true)
		})
		.catch(err => {
			console.error(err)
			setValid(false)
		})
	}, [props])

	useEffect(() => {
		const repoName = gitTree ? `${gitTree.getRepo().getInfo().name} (${gitTree.getRef().name})` : "Git Repo Browser"
		const nodeName = selectedNode ? `${selectedNode.getName()} - ` : ""
		document.title = nodeName + repoName
	}, [gitTree, selectedNode])

	const getRepo = async (repoId: string) => {
		const inventory = await GitRepo.fetchInventory()
		const inventoryKeys = Object.keys(inventory)
		return inventoryKeys.includes(repoId) ?
			new GitRepo(repoId, inventory[repoId]) :
			Promise.reject(new Error(`Repository id '${repoId}' does not exist in repository inventory!`))
	}

	const getDefaultRepoId = async () => {
		const lastRepoId = localStorage.getItem('repo')
		const inventory = await GitRepo.fetchInventory()
		const inventoryKeys = Object.keys(inventory)
		return lastRepoId && inventoryKeys.includes(lastRepoId) ? lastRepoId : inventoryKeys[0]
	}

	const validateRefPath = async (repo: GitRepo, refPath: string) => {
		// validate git ref
		const refs = await repo.fetchRefs()
		let nodePath: string | undefined
		const foundRef = refs.find(ref => {
			const regex = new RegExp(`^${ref.refName}(?:/(.*))?$`, 'g')
			const match = regex.exec(refPath)
			nodePath = match ? match[1] : undefined
			return match
		})
		if (!foundRef) return Promise.reject(new Error(`No matching branch on repository '${repo.getId()}' found!`))

		// validate node path
		const gitTree = new GitTree(repo, foundRef)
		setGitTree(prevTree => prevTree?.equals(gitTree) ? prevTree : gitTree)
		if (nodePath) {
			const node = await gitTree.treeNodeAtPath(nodePath)
			setSelectedNode(node)
		}
		else setSelectedNode(undefined)
	}

	const handleRefSelected = (ref: GitRef) => {
		if (gitTree) {
			props.history.push(`${RepoViewerRoute}/${gitTree.getRepo().getId()}/${ref.refName}`)
		}
	}

	const handleSelectNode = useCallback( (node: GitTreeNode) => {
		console.log(`selected node '${node.getPath()}'`)
		props.history.push(`${RepoViewerRoute}/${node.getTree().getRepo().getId()}/${node.getTree().getRef().refName}/${node.getPath()}`)
	}, [props.history])

	const handleSelectRepo = useCallback( (repo: GitRepo) => {
		console.log(`selected repo '${repo.getId()}'`)
		props.history.push(`${RepoViewerRoute}/${repo.getId()}`)
	}, [props.history])

	const Separator = () => <div className="separator">&rsaquo;</div>

	return isValid ?
		<RepoViewerContext.Provider value={ {selectNode: handleSelectNode} }>
			<header>
				<RepoSelector gitTree={ gitTree } onSelect={ handleSelectRepo }/>
				<Separator />
				<RefSelector gitTree={ gitTree } onSelect={ handleRefSelected }/>
				<FileNavigator node={ selectedNode }/>
			</header>
			<section>
				<SplitView
					sidebar={ <GitTreeView gitTree={ gitTree } /> }
					content={ <ContentView node={ selectedNode } /> } />
			</section>
			<footer>
				<div>Footer</div>
			</footer>
		</RepoViewerContext.Provider> :
		<NotFound />
}
