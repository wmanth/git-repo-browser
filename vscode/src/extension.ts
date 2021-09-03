import * as vscode from 'vscode';
import OpenRefCommand from './OpenRefCommand';
import GitRepoFsProvider from './GitRepoFsProvider';
import RepositoryProvider from './RepositoryProvider';

export function activate(context: vscode.ExtensionContext) {
	OpenRefCommand.register(context);
	GitRepoFsProvider.register(context);
	RepositoryProvider.register(context);
}
