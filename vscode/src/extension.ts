import * as vscode from 'vscode';
import RepositoryProvider from './RepositoryProvider';
import GitRepoFsProvider from './GitRepoFsProvider';
import OpenRefCommand from './OpenRefCommand';

export function activate(context: vscode.ExtensionContext) {
	const repositoryProvider = new RepositoryProvider('localhost', 8080);
	vscode.window.registerTreeDataProvider('repoSelect', repositoryProvider);
	context.subscriptions.push(GitRepoFsProvider.register(context));
	context.subscriptions.push(OpenRefCommand.register());
}
