import React, { Component } from 'react'
import Layout, { Content, Header } from "antd/lib/layout/layout"
import Sider from "antd/lib/layout/Sider"
import TagSelect from "./components/TagSelect"
import FileBrowser from "./components/FileBrowser"
import * as RepoFetcher from './classes/RepoFetcher'
import "antd/dist/antd.css"
import "./App.css"

interface AppState {
	repo: string
	tags: string[]
	currentTag: string
}

export default class App extends Component {
	state: AppState = {
		repo: "",
		tags: [],
		currentTag: ""
	}

	handleTagChanged() {
		console.log("Tag changed");
	}

	handleFileSelected(selectedKeys: any, info: any) {
		console.log('selected', selectedKeys, info);
	}

	componentDidMount() {
		const lastRepo = localStorage.getItem('lastRepo') || ""
		RepoFetcher.fetchRepoIds()
		.then(repos => this.updateRepo(repos.includes(lastRepo) ? lastRepo : repos[0]))
		.catch(err => console.error(err));
	}

	updateRepo(repo: string) {
		RepoFetcher.fetchTags(repo)
		.then(tags => this.updateTags(tags))
		.catch(err => console.error(err));
		this.setState({ repo: repo })
	}

	updateTags(tags: string[]) {
		this.setState({ tags: tags, currentTag: tags[0] })
	}

	render() {
		return (
			<Layout style={{ position: "fixed", width: "100%", height: "100%" }}>
				<Header>
					<span className="title">{ RepoFetcher.getRepoName(this.state.repo) }</span>
					<TagSelect
						onTagChanged={ this.handleTagChanged }
						tags={ this.state.tags }
					/>
				</Header>
				<Layout>
					<Sider>
						<FileBrowser
							onSelect = { this.handleFileSelected }
							repo = { this.state.repo }
							tag = { this.state.currentTag }
						/>
					</Sider>
					<Content>Content</Content>
				</Layout>
			</Layout>
		)
	}
}
