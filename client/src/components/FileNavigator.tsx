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
	render() {
		return (
			// use &rsaquo; or &#9002; as separator
			<Breadcrumb className="filenavigator" separator="&rsaquo;">
				<Breadcrumb.Item>First</Breadcrumb.Item>
				<Breadcrumb.Item>Second</Breadcrumb.Item>
			</Breadcrumb>
		)
	}
}
