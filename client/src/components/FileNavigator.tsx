import React, { Component } from 'react'
import { Breadcrumb, Menu } from 'antd';
import { GitTree, GitTreeNode } from '../common/GitTree';
import SubMenu from 'antd/lib/menu/SubMenu';
import { SelectionHandler } from '../routes/RepoViewer';
import './FileNavigator.css'

interface FileNavigatorProps {
	gitTree?: GitTree
	selected?: string
	onSelect: SelectionHandler
}

interface FileNavigatorState {
	breadcrumbs: JSX.Element[]
}

export default class FileNavigator extends Component<FileNavigatorProps, FileNavigatorState> {
	state = {
		breadcrumbs: []
	}

	handleClick(menuInfo: any) {
		this.props.onSelect(menuInfo.key)
	}

	componentDidMount() {
		this.updateTrail()
	}

	componentDidUpdate(prevProps: FileNavigatorProps) {
		if (prevProps.selected !== this.props.selected) {
			this.updateTrail()
		}
	}

	async renderMenu(node: GitTreeNode): Promise<JSX.Element> {
		const menuItems: JSX.Element[] = []
		const childs = await node.fetchChilds()
		childs.forEach((node, name) => this.renderMenuItem(name, node).then(menuItem => menuItems.push(menuItem)))
		return (
			<Menu onClick={ this.handleClick.bind(this) }>
				{ menuItems }
			</Menu>
		)
	}

	async renderMenuItem(name: string, node: GitTreeNode): Promise<JSX.Element> {
		if (node.isDirectory()) return this.renderSubMenu(name, node)
		return <Menu.Item key={ node.getPath() }>{ name }</Menu.Item>
	}

	async renderSubMenu(name: string, node: GitTreeNode): Promise<JSX.Element> {
		const menuItems: JSX.Element[] = []
		const childs = await node.fetchChilds()
		childs.forEach((node, name) => this.renderMenuItem(name, node).then(menuItem => menuItems.push(menuItem)))
		return <SubMenu key={ node.getPath() } title={ name }>{ menuItems }</SubMenu>
	}

	async updateTrail() {
		const breadcrumbs: JSX.Element[] = []
		if (this.props.selected && this.props.gitTree) {
			const pathSegments = this.props.selected.split('/')
			var trailSegment: string | undefined
			var parentNode = this.props.gitTree.getRoot()

			while ((trailSegment = pathSegments.shift())) {
				const breadcrumbMenu = await this.renderMenu(parentNode)
				const breadcrumbNode = parentNode.getChilds()?.get(trailSegment)
				if (breadcrumbNode) {
					breadcrumbs.push(
						<Breadcrumb.Item
							key={ breadcrumbNode.getPath() }
							overlay={ breadcrumbMenu }>
								{ trailSegment }
						</Breadcrumb.Item>
					)
					parentNode = breadcrumbNode
				}
			}
		}
		this.setState({ breadcrumbs: breadcrumbs })
	}

	render() {
		return (
			// use &rsaquo; or &#9002; as separator
			<Breadcrumb className="filenavigator" separator="&rsaquo;">
				{ this.state.breadcrumbs }
			</Breadcrumb>
		)
	}
}
