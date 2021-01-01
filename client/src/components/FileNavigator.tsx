import React, { Component } from 'react'
import { Breadcrumb } from 'antd';
import './FileNavigator.css'
import { FileTree } from '../common/Types';
import IndexPath from '../common/IndexPath';

interface FileNavigatorProps {
	fileTree: FileTree
	selected: IndexPath
}

export default class FileNavigator extends Component<FileNavigatorProps> {

	renderTrail() {
		let index: number | undefined
		const indexes = this.props.selected.getIndexes()
		const trailIndexes: number[] = []
		const breadcrumbs: JSX.Element[] = []

		while (undefined !== (index = indexes.shift())) {
			trailIndexes.push(index)
			const trailIndexPath = new IndexPath(trailIndexes)
			const blob = this.props.fileTree.objectAtIndexPath(trailIndexPath)
			breadcrumbs.push(<Breadcrumb.Item key={ trailIndexPath.toString() }>{ blob?.name }</Breadcrumb.Item>)
		}
		return breadcrumbs
	}

	render() {
		return (
			// use &rsaquo; or &#9002; as separator
			<Breadcrumb className="filenavigator" separator="&rsaquo;">
				{ this.renderTrail() }
			</Breadcrumb>
		)
	}
}
