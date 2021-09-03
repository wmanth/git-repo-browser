import * as vscode from 'vscode';
import * as common from '@repofs/common';
import fetch from 'node-fetch';
import OpenRefCommand from './OpenRefCommand';

const HOSTNAME_CONFIG = 'repofs.gateway.hostName';
const PORT_CONFIG = 'repofs.gateway.portNumber';

interface Node {
	label: string
	uri: vscode.Uri
	parent?: Node
	getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem>
}

class Repository implements Node {

	constructor(
		readonly id: string,
		readonly label: string,
		readonly uri: vscode.Uri,
	) {}

	getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const treeItem = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.Collapsed);
		treeItem.iconPath = new vscode.ThemeIcon('repo');
		return treeItem;
	}
}

class ReferenceGroup implements Node {
	readonly uri: vscode.Uri;
	readonly label: string;

	constructor(readonly refType: common.RefType, readonly parent: Repository) {
		this.label = (refType === common.RefType.heads) ? 'branches' : 'tags';
		this.uri = vscode.Uri.joinPath(parent.uri, `refs/${refType}`);
	}

	getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const treeItem = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.Collapsed);
		treeItem.iconPath = new vscode.ThemeIcon('array');
		return treeItem;
	}
}

class Reference implements Node {
	readonly uri: vscode.Uri;

	constructor(readonly label: string, readonly parent: ReferenceGroup) {
		this.uri = vscode.Uri.joinPath(parent.uri, label);
	}

	getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const treeItem = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.None);
		treeItem.iconPath = (this.parent.refType === common.RefType.heads) ?
			new vscode.ThemeIcon('git-branch') :
			new vscode.ThemeIcon('tag');
		treeItem.command = new OpenRefCommand(`${this.parent.parent.label}: ${this.label}`, this.uri);
		return treeItem;
	}
}

export default class RepositoryProvider implements vscode.TreeDataProvider<Node> {

	private baseUri: vscode.Uri;

	static register(context: vscode.ExtensionContext): void {
		const repositoryProvider = new RepositoryProvider();
		context.subscriptions.push(
			vscode.window.registerTreeDataProvider('repoList', repositoryProvider)
		);
		context.subscriptions.push(
			vscode.commands.registerCommand('repoList.refresh', () => repositoryProvider.refresh())
		);
	}

	private constructor() {
		const config = vscode.workspace.getConfiguration();
		const hostName = config.get(HOSTNAME_CONFIG);
		const port = config.get(PORT_CONFIG);
		this.baseUri = vscode.Uri.parse(`http://${hostName}:${port}/api`);
	}

	private changeTreeDataEmitter: vscode.EventEmitter<Node | undefined | null | void> = new vscode.EventEmitter<Node | undefined | null | void>();

	readonly onDidChangeTreeData: vscode.Event<Node | undefined | null | void> = this.changeTreeDataEmitter.event;

	getTreeItem(element: Node): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element.getTreeItem();
	}

	getChildren(element?: Node): vscode.ProviderResult<Node[]> {
		if (!element) {
			const uri = vscode.Uri.joinPath(this.baseUri, 'repos');
			return fetch(uri.toString())
				.then(response => response.json())
				.then(inventory => Object.keys(inventory)
					.map(id =>  new Repository(id, inventory[id].name, vscode.Uri.joinPath(uri, id))))
				.catch(e => undefined );

		}

		if (element instanceof Repository) {
			return [common.RefType.heads, common.RefType.tags]
				.map(refType => new ReferenceGroup(refType, element));
		}

		if (element instanceof ReferenceGroup) {
			return fetch(element.uri.toString())
				.then(respons => respons.json())
				.then(list => Object.values(list)
					.map(name => new Reference(name as string, element)))
				.catch(e => undefined);
		}

		return undefined;
	}

	refresh(): void {
		this.changeTreeDataEmitter.fire();
	}
}
