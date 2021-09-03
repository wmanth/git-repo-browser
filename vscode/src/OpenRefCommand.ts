import * as vscode from 'vscode';
import GitRepoFsProvider from './GitRepoFsProvider';

export default class OpenRefCommand implements vscode.Command {
	private static command = "repofs.openWorkspaceFolder";

	readonly title = "Open repository workspace folder";
	readonly command = OpenRefCommand.command;
	readonly tooltip = undefined;
	readonly arguments: string[] = [];

	static register(context: vscode.ExtensionContext): void {
		const commandHandler = (name: string, repoUri: string) => {
			const uri = vscode.Uri
				.parse(repoUri)
				.with({ scheme: GitRepoFsProvider.scheme });
			vscode.workspace.updateWorkspaceFolders(0, 0, { uri, name });
		};
		context.subscriptions.push(
			vscode.commands.registerCommand(OpenRefCommand.command, commandHandler)
		);
	}

	constructor(name: string, uri: vscode.Uri) {
		this.arguments.push(name);
		this.arguments.push(uri.toString());
	}
}
