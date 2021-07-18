import * as vscode from 'vscode';
import fetch from 'node-fetch';

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

enum ReferenceType {
	branch, tags
}

class ReferenceGroup implements Node {
	readonly uri: vscode.Uri;
	readonly label: string;
	constructor(readonly refType: ReferenceType, readonly parent: Repository) {
		this.label = (refType === ReferenceType.branch) ? 'branches' : 'tags';
		const refsName = (refType === ReferenceType.branch) ? 'heads' : 'tags';
		this.uri = vscode.Uri.joinPath(parent.uri, `refs/${refsName}`);
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
		treeItem.iconPath = (this.parent.refType === ReferenceType.branch) ? 
			new vscode.ThemeIcon('git-branch') :
			new vscode.ThemeIcon('tag');
		return treeItem;
	}
}

export default class RepositoryProvider implements vscode.TreeDataProvider<Node> {

	private baseUri: vscode.Uri;

	constructor(hostName: string, port: number) {
		this.baseUri = vscode.Uri.parse(`http://${hostName}:${port}/api`);
	}

	onDidChangeTreeData?: vscode.Event<void | Node | null | undefined> | undefined;

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
			return [ReferenceType.branch, ReferenceType.tags]
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

}