import React, { Component } from 'react'
import FileNavigator from './FileNavigator'
import CodeViewer from './CodeViewer'
import { GitTree } from '../common/GitTree'
import { SelectionHandler } from '../App'
import { Empty } from 'antd'

interface WorkspaceProps {
	gitTree?: GitTree
	selected?: string
	onSelect: SelectionHandler
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

	async updateSelected() {
		var content: string | undefined = undefined
		if (this.props.selected) {
			content = await this.props.gitTree?.contentAtPath(this.props.selected)
		}
		this.setState({ content: content})
	}

	render() {
		return (
			!this.props.selected
			? <Empty style={{ position: 'absolute', top: '50%', left: '50%', transform: 'scale(1.5)' }} image={ Empty.PRESENTED_IMAGE_SIMPLE } />
			: <React.Fragment>
					<FileNavigator
						gitTree={ this.props.gitTree }
						selected={ this.props.selected }
						onSelect={ this.props.onSelect }
					/>
					<CodeViewer content={ this.state.content } />
			</React.Fragment>
		)
	}
}
