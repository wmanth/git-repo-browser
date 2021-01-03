import React, { Component } from 'react'
import FileNavigator from './FileNavigator'
import CodeViewer from './CodeViewer'
import IndexPath from '../common/IndexPath'
import { FileTree } from '../common/Types'
import { fetchContent } from '../utils/RepoFetcher'
import { selectionHandler } from '../App'
import { Empty } from 'antd'

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
	state: WorkspaceState = {}

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
			this.props.selected.isEmpty()
			? <Empty style={{ position: 'absolute', top: '50%', left: '50%', transform: 'scale(1.5)' }} image={ Empty.PRESENTED_IMAGE_SIMPLE } />
			: <React.Fragment>
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
