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

const routeToRepo = (repo: GitRepo) => `${RepoViewerRoute}/${repo.id}`
const routeToRef = (repo: GitRepo, ref: GitRef) => `${routeToRepo(repo)}/${ref.refName}`
const routeToNode = (node: GitTreeNode) => `${routeToRef(node.tree.repo, node.tree.ref)}/${node.path}`

interface RepoViewerContextType {
	selectNode: (node: GitTreeNode) => void
}

export const RepoViewerContext = createContext<RepoViewerContextType>({
	selectNode: () => {}
})

interface RepoViewerState {
	gitTree?: GitTree
	selectedNode?: GitTreeNode
	error?: Error
}

export default function RepoViewer(props: RouteComponentProps) {
	const [gitTree, setGitTree] = useState<GitTree | undefined>()
	const [selectedNode, setSelectedNode] = useState<GitTreeNode | undefined>()
	const [error, setError] = useState<Error | undefined>()
    const [config, setConfig] = useState<any>(() => {
        fetch('/config')
        .then(response => response.json())
        .then(config => setConfig(config))
    })

	const setState = (state: RepoViewerState) => {
		setGitTree(state.gitTree)
		setSelectedNode(state.selectedNode)
		setError(state.error)
		if (state.error) console.log(state.error)
	}

	const validateTree = useCallback( (gitTree: GitTree, route: string) => {
		const match = new RegExp(`^${routeToRef(gitTree.repo, gitTree.ref)}/?(.*)$`).exec(route)
		const nodePath = match ? match[1] : undefined
		if (nodePath === undefined) setState({ error: new Error(`Invalid route '${route}'`) })
		else {
			gitTree.treeNodeAtPath(nodePath)
			.then(node => setState({ gitTree: gitTree, selectedNode: node }))
			.catch(err => setState({ error: err }))
		}
	}, [])

	const validateRepo = useCallback( (repo: GitRepo, route: string) => {
		const match = new RegExp(`^${routeToRepo(repo)}/?(.*)$`).exec(route)
		const refPath = match ? match[1] : undefined
		if (refPath === undefined) setState({ error: new Error(`Invalid route '${route}'`) })
		else if (!refPath.length) {
			repo.defaultBranch()
			.then(ref => props.history.replace(routeToRef(repo, ref)))
			.catch(err => setState({ error: err }))
		}
		else {
			repo.findRef(refPath)
			.then(ref => validateTree(new GitTree(repo, ref), route))
			.catch(err => setState({ error: err }))
		}
	}, [props, validateTree])

	const validateRoute = useCallback( (route: string) => {
		const match = new RegExp(`^${RepoViewerRoute}/?([\\w.-]*)/?.*$`, 'g').exec(route)
		const repoId = match ? match[1] : undefined
		if (repoId === undefined) setState({ error: new Error(`Invalid route '${route}'`) })
		else if (!repoId.length) {
			GitRepo.defaultRepo()
			.then(repo => props.history.replace(routeToRepo(repo)))
			.catch(err => setState({ error: err }))
		}
		else {
			GitRepo.getRepo(repoId)
			.then(repo => validateRepo(repo, route))
			.catch(err => setState({ error: err }))
		}
	}, [props, validateRepo])

	useEffect(() => {
		if (selectedNode && props.location.pathname === routeToNode(selectedNode)) return
		else if (gitTree && props.location.pathname.startsWith(routeToRef(gitTree.repo, gitTree.ref))) {
			validateTree(gitTree, props.location.pathname)
		}
		else if (gitTree && props.location.pathname.startsWith(routeToRepo(gitTree.repo))) {
			validateRepo(gitTree.repo, props.location.pathname)
		}
		else {
			validateRoute(props.location.pathname)
		}
	}, [props, gitTree, selectedNode, validateTree, validateRepo, validateRoute])

	useEffect(() => {
		const repoName = gitTree ? `${gitTree.repo.info.name} (${gitTree.ref.name})` : "Git Repo Browser"
		const nodeName = selectedNode ? `${selectedNode.getName()} - ` : ""
		document.title = nodeName + repoName
	}, [gitTree, selectedNode])

	const handleRefSelected = (ref: GitRef) => {
		if (gitTree) {
			props.history.push(`${RepoViewerRoute}/${gitTree.repo.id}/${ref.refName}`)
		}
	}

	const handleSelectNode = useCallback( (node: GitTreeNode) => {
		console.log(`selected node '${node.path}'`)
		props.history.push(`${RepoViewerRoute}/${node.tree.repo.id}/${node.tree.ref.refName}/${node.path}`)
	}, [props.history])

	const handleSelectRepo = useCallback( (repo: GitRepo) => {
		console.log(`selected repo '${repo.id}'`)
		props.history.push(`${RepoViewerRoute}/${repo.id}`)
	}, [props.history])

	const Separator = () => <div className="separator">&rsaquo;</div>

	return error ?
		<NotFound message={ error.message }/> :
		<RepoViewerContext.Provider value={ {selectNode: handleSelectNode} }>
			<header>
				<section className="navbar fix-row">
					<span className="title">{ config?.title }</span>
				</section>
				<section className="navigator fix-row">
					<RepoSelector gitTree={ gitTree } onSelect={ handleSelectRepo }/>
					<Separator />
					<RefSelector gitTree={ gitTree } onSelect={ handleRefSelected }/>
					<FileNavigator node={ selectedNode }/>
				</section>
			</header>
			<section className="flex-row">
				<SplitView
					sidebar={ <GitTreeView gitTree={ gitTree } /> }
					content={ <ContentView node={ selectedNode } /> } />
			</section>
			<footer className="fix-row">
				<div>Footer</div>
			</footer>
		</RepoViewerContext.Provider>
}
