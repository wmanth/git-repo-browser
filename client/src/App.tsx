import React, { Component } from 'react'
import Layout, { Content, Header } from "antd/lib/layout/layout"
import Sider from "antd/lib/layout/Sider"
import TagSelect from "./components/TagSelect"
import FileBrowser from "./components/FileBrowser"
import Workspace from './components/Workspace'
import { GitTree } from './common/GitTree'
import * as RepoFetcher from './utils/RepoFetcher'
import "antd/dist/antd.css"
import "./App.css"

interface AppState {
	repo: string
	tags: string[]
	currentTag: string
	gitTree?: GitTree
	selected?: string
}

export type SelectionHandler = (selectedKey: string) => void
export type UpdateTreeHandler = (path: string) => Promise<void>

export default class App extends Component {
	state: AppState = {
		repo: "",
		tags: [],
		currentTag: "",
	}

	handleTagChanged(tag: string) {
		this.updateCurrentTag(tag);
	}

	async handleSelected(path: string) {
		const node = await this.state.gitTree?.treeNodeAtPath(path)
		if (node?.isFile()) this.setState({ selected: node.getPath() })
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
	}
}
