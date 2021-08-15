import * as vscode from 'vscode';
import OpenRefCommand from './OpenRefCommand';
import GitRepoFsProvider from './GitRepoFsProvider';
import RepositoryProvider from './RepositoryProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(OpenRefCommand.register());
	context.subscriptions.push(GitRepoFsProvider.register());
	context.subscriptions.push(RepositoryProvider.register());
}
