import React, { Component } from 'react'
//import TagSelect from "./components/TagSelect"
import FileBrowser from "./components/FileBrowser"
// import Workspace from './components/Workspace'
import SplitView from './components/SplitView'
import { GitTree, GitTreeNode } from './common/GitTree'
import * as RepoFetcher from './utils/RepoFetcher'
import "antd/dist/antd.css"
import "./App.css"
import RepoSelector from './components/RepoSelector'
import RefSelector from './components/RefSelector'
import GitTreeView from './components/GitTreeView'

interface AppState {
	repo: string
	tags: string[]
	currentTag: string
	gitTree?: GitTree
	selected?: string
	sidebarWidth: number
	sidebarShiftOn: boolean
	sidebarShifting: boolean
}

export type SelectionHandler = (node: GitTreeNode) => void
export type UpdateTreeHandler = (path: string) => Promise<void>

export default class App extends Component {
	state: AppState = {
		repo: "",
		tags: [],
		currentTag: "",
		sidebarWidth: 200,
		sidebarShiftOn: false,
		sidebarShifting: false
	}

	handleTagChanged(tag: string) {
		this.updateCurrentTag(tag);
	}

	handleSelected = (node: GitTreeNode) => {
		console.log(node.getPath())
	}

	handleUpdateTree(path: string): Promise<void> {
		console.log("want to update ", path)
		return new Promise(resolve => resolve() )
	}

	componentDidMount() {
		const lastRepo = localStorage.getItem('lastRepo') || ""
		RepoFetcher.fetchRepoIds()
		.then(repos => this.updateRepo(repos.includes(lastRepo) ? lastRepo : repos[0]))
		.catch(err => console.error(err));
	}

	updateRepo(repo: string) {
		this.setState({ repo: repo })
		RepoFetcher.fetchTags(repo)
		.then(tags => this.updateTags(tags))
		.catch(err => console.error(err));
	}

	updateTags(tags: string[]) {
		this.setState({ tags: tags })
		this.updateCurrentTag(tags[0])
	}

	updateCurrentTag(tag: string) {
		if (tag === this.state.currentTag) return
		this.setState({
			currentTag: tag,
			gitTree: new GitTree(this.state.repo, `tags/${tag}`),
			selected: undefined
		})
	}

	handleMouseMove = (event: any) => {
		if (this.state.sidebarShifting) {
			this.setState({ sidebarWidth: this.state.sidebarWidth + event.nativeEvent.movementX})
		}
		else {
			this.setState({ sidebarShiftOn: (Math.abs(event.nativeEvent.clientX - this.state.sidebarWidth) < 3) })
		}
	}

	handleMouseDown = () => {
		this.setState({ sidebarShifting: this.state.sidebarShiftOn })
	}

	handleMouseUp = () => {
		this.setState({ sidebarShifting: false })
	}

	handleRepoSelect = () => {

	}

	sidebar = () => {
		return (
			<FileBrowser
				onSelect={ this.handleSelected.bind(this) }
				gitTree={ this.state.gitTree }
				onUpdateTree={ this.handleUpdateTree }/>
		)
	}
	content = <div>Content</div>

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
					content={ this.content } />
				<footer>
					<div>Footer</div>
				</footer>
			</section>
		)
	}

	/*
	render() {
		return (
			<Layout style={{ position: "fixed", width: "100%", height: "100%" }}>
				<Header className="titleBar">
					<span className="title">{ RepoFetcher.getRepoName(this.state.repo) }</span>
					<TagSelect
						onTagChanged={ this.handleTagChanged.bind(this) }
						tags={ this.state.tags }
					/>
				</Header>
				<Layout>
					<Sider>
						<FileBrowser
							onSelect={ this.handleSelected.bind(this) }
							gitTree={ this.state.gitTree }
							onUpdateTree={ this.handleUpdateTree }
						/>
					</Sider>
					<Content>
						<Workspace
							gitTree={ this.state.gitTree }
							selected={ this.state.selected }
							onSelect={ this.handleSelected.bind(this) }
						/>
					</Content>
				</Layout>
			</Layout>
		)
	} */
}
