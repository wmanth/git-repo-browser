import * as vscode from 'vscode';
import GitRepoFsProvider from './GitRepoFsProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(GitRepoFsProvider.register(context));
	vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('gitrepo:/org/name/master'), name: "master" });
}
