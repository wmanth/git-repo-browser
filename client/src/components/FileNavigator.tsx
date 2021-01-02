import React, { Component } from 'react'
import { Breadcrumb, Menu } from 'antd';
import './FileNavigator.css'
import { FileTree } from '../common/Types';
import IndexPath from '../common/IndexPath';
import SubMenu from 'antd/lib/menu/SubMenu';
import { selectionHandler } from '../App';

interface FileNavigatorProps {
	fileTree: FileTree
	selected: IndexPath
	onSelect: selectionHandler
}

export default class FileNavigator extends Component<FileNavigatorProps> {

	handleClick(menuInfo: any) {
		this.props.onSelect(menuInfo.key)
	}

	renderMenu(indexPath: IndexPath) {
		const menuNodes = this.props.fileTree.childsAtIndexPath(indexPath)
		return (
			<Menu onClick={ this.handleClick.bind(this) }>
				{ menuNodes?.map((node, index) => this.renderMenuItem(indexPath.indexPathAppendingIndex(index))) }
			</Menu>
		)
	}

	renderMenuItem(indexPath: IndexPath) {
		if (this.props.fileTree.childsAtIndexPath(indexPath)) {
			return this.renderSubMenu(indexPath)
		}

		const blob = this.props.fileTree.objectAtIndexPath(indexPath)
		return (
			<Menu.Item
				key={ indexPath.toString() }>
					{ blob?.name }
			</Menu.Item>
		)
	}

	renderSubMenu(indexPath: IndexPath) {
		const blob = this.props.fileTree.objectAtIndexPath(indexPath)
		const childNodes = this.props.fileTree.childsAtIndexPath(indexPath)
		const menuItems = childNodes?.map((node, index) => this.renderMenuItem(indexPath.indexPathAppendingIndex(index)))
		return (
			<SubMenu
				key={ indexPath.toString() }
				title={ blob?.name }>
					{ menuItems }
			</SubMenu>
		)
	}

	renderTrail() {
		let index: number | undefined
		const indexes = this.props.selected.getIndexes()
		const trailIndexes: number[] = []
		const breadcrumbs: JSX.Element[] = []

		while (undefined !== (index = indexes.shift())) {
			const menuIndexPath = new IndexPath(trailIndexes)
			trailIndexes.push(index)
			const breadcrumbIndexPath = new IndexPath(trailIndexes)
			const breadcrumbBlob = this.props.fileTree.objectAtIndexPath(breadcrumbIndexPath)
			breadcrumbs.push(
				<Breadcrumb.Item
					key={ breadcrumbIndexPath.toString() }
					overlay={ this.renderMenu(menuIndexPath) }>
						{ breadcrumbBlob?.name }
				</Breadcrumb.Item>
			)
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
