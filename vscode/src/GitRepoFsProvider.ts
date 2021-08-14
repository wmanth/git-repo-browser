import * as vscode from 'vscode';
import fetch from 'node-fetch';

export default class GitRepoFsProvider implements vscode.FileSystemProvider {

	static scheme = 'repofs';

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new GitRepoFsProvider(context);
		const options = { isCaseSensitive: true, isReadonly: true };
		const providerRegistration = vscode.workspace.registerFileSystemProvider(GitRepoFsProvider.scheme, provider, options);
		return providerRegistration;
	}

	private outChannel: vscode.OutputChannel;

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		this.outChannel = vscode.window.createOutputChannel("RepoFS");
		this.outChannel.show();
	}

	private readonly _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	public readonly onDidChangeFile = this._onDidChangeFile.event;

	watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
		// ignore, fires for all changes...
		return new vscode.Disposable(() => { });
	}

	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		this.outChannel.appendLine(`stat for ${uri.toString()}`);
		const repoUri = uri.with({ scheme: "http" });
		const response = await fetch(repoUri.toString());
		if (!response.ok) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		throw vscode.FileSystemError.FileNotFound(uri);
	}

	readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Promise<[string, vscode.FileType][]> {
		vscode.window.showErrorMessage("method 'readDirectory' for ${uri.toString()} not implemented");
		return [["file.txt", vscode.FileType.File]];
	}

	createDirectory(uri: vscode.Uri): void | Promise<void> {
		throw new Error("Readonly filesystem.");
	}

	readFile(uri: vscode.Uri): Uint8Array | Promise<Uint8Array> {
		throw new Error("Method not implemented.");
	}

	writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Promise<void> {
		throw new Error("Readonly filesystem.");
	}

	delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Promise<void> {
		throw new Error("Readonly filesystem.");
	}

	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Promise<void> {
		throw new Error("Readonly filesystem.");
	}

}