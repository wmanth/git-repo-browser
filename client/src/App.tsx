import React, { Component } from 'react'
import Layout, { Content, Header } from "antd/lib/layout/layout"
import Sider from "antd/lib/layout/Sider"
import TagSelect from "./components/TagSelect"
import FileBrowser from "./components/FileBrowser"
import FileTreeNode from './common/FileTreeNode'
import Workspace from './components/Workspace'
import * as RepoFetcher from './utils/RepoFetcher'
import "antd/dist/antd.css"
import "./App.css"

interface AppState {
	repo: string
	tags: string[]
	currentTag: string
	fileTree?: FileTreeNode[]
	selected?: string
}

export default class App extends Component {
	state: AppState = {
		repo: "",
		tags: [],
		currentTag: "",
	}

	handleTagChanged(tag: string) {
		this.updateCurrentTag(tag);
	}

	handleFileSelected(selectedKeys: string[]) {
		this.setState({ selected: selectedKeys[0] })
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
		this.setState({ currentTag: tag })
		RepoFetcher.fetchFileTree(this.state.repo, tag)
		.then(fileTree => this.updateFileTree(fileTree))
		.catch(err => console.error(err));
	}

	updateFileTree(fileTree: FileTreeNode[]) {
		this.setState({ fileTree: fileTree })
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
							onSelect={ this.handleFileSelected.bind(this) }
							fileTree={ this.state.fileTree }
						/>
					</Sider>
					<Content>
						<Workspace
							fileTree={ this.state.fileTree }
							repo={ this.state.repo }
							selected={ this.state.selected }
						/>
					</Content>
				</Layout>
			</Layout>
		)
	}
}
