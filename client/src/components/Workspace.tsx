import React, { Component } from 'react'
import FileNavigator from './FileNavigator'
import CodeViewer from './CodeViewer'
import IndexPath from '../common/IndexPath'
import { FileTree } from '../common/Types'
import { fetchContent } from '../utils/RepoFetcher'
import { selectionHandler } from '../App'

interface WorkspaceProps {
	repo: string
	fileTree: FileTree
	selected: IndexPath
	onSelect: selectionHandler
}

interface WorkspaceState {
	content?: string
}

export default class Workspace extends Component<WorkspaceProps, WorkspaceState> {
	state = { content: "Hello Yulie!" }

	componentDidUpdate(prevProps: WorkspaceProps) {
		if (prevProps.selected !== this.props.selected) {
			this.updateSelected()
		}
	}

	updateSelected() {
		const blob = this.props.fileTree.objectAtIndexPath(this.props.selected)
		if (blob) {
			fetchContent(this.props.repo, blob.sha)
			.then(content => this.setState({ content: content}))
			.catch(err => console.error(err));
		}
	}

	render() {
		return (
			<React.Fragment>
					<FileNavigator
						fileTree={ this.props.fileTree }
						selected={ this.props.selected }
						onSelect={ this.props.onSelect }
					/>
					<CodeViewer content={ this.state.content } />
			</React.Fragment>
		)
	}
}
