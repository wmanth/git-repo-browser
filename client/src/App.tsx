import { Component } from 'react'
import SplitView from './components/SplitView'
import { GitTree, GitTreeNode } from './common/GitTree'
import GitRepo, { GitRef } from './common/GitRepo'
import RepoSelector from './components/RepoSelector'
import RefSelector from './components/RefSelector'
import GitTreeView from './components/GitTreeView'
import ContentView from './components/ContentView'
import "./App.css"

interface AppState {
	repo?: GitRepo
	tags?: GitRef[]
	currentTag?: GitRef
	gitTree?: GitTree
	selectedNode?: GitTreeNode
}

export type SelectionHandler = (node: GitTreeNode) => void
export type UpdateTreeHandler = (path: string) => Promise<void>

export default class App extends Component {
	state: AppState = {}

	handleTagChanged(tag: GitRef) {
		this.updateCurrentTag(tag);
	}

	handleSelected = (node: GitTreeNode) => {
		console.log(`selected '${node.getPath()}'`)
		this.setState({ selectedNode: node })
	}

	handleUpdateTree(path: string): Promise<void> {
		console.log("want to update ", path)
		return new Promise(resolve => resolve() )
	}

	componentDidMount() {
		const lastRepo = localStorage.getItem('lastRepo') || ""
		GitRepo.fetchInventory()
		.then(inventory => {
			const repoIds = Object.keys(inventory)
			const repo = new GitRepo(repoIds.includes(lastRepo) ? lastRepo : repoIds[0])
			this.updateRepo(repo) })
		.catch(err => console.error(err));
	}

	updateRepo(repo: GitRepo) {
		this.setState({ repo: repo })
		repo.fetchTags()
		.then(tags => this.updateTags(tags))
		.catch(err => console.error(err));
	}

	updateTags(tags: GitRef[]) {
		this.setState({ tags: tags })
		this.updateCurrentTag(tags[0])
	}

	updateCurrentTag(tag: GitRef) {
		if (tag.refName === this.state.currentTag?.refName) return
		this.setState({
			currentTag: tag,
			gitTree: this.state.repo ? new GitTree(this.state.repo, tag) : undefined,
			selected: undefined
		})
	}

	handleRepoSelect = () => {
	}

	separator = () => <div style={ {fontSize: "large", color: "gray"} }>&rsaquo;</div>

	render() {
		return (
			<section className="column">
				<header>
					<RepoSelector onSelect={ this.handleRepoSelect }/>
					<this.separator />
					<RefSelector />
					<this.separator />
				</header>
				<SplitView
					sidebar={ <GitTreeView gitTree={ this.state.gitTree } onSelect={ this.handleSelected } /> }
					content={ <ContentView  /> } />
				<footer>
					<div>Footer</div>
				</footer>
			</section>
		)
	}
}
