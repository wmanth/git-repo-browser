import * as vscode from 'vscode';
import * as common from '@wmanth/git-repo-common';
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
		// it's a read-only file system, nothing will change -> ignore
		return new vscode.Disposable(() => { });
	}

	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		this.outChannel.appendLine(`stat for ${uri.toString()}`);
		const repoUri = uri.with({ scheme: "http" });
		const response = await fetch(repoUri.toString(), { method: 'HEAD' });
		if (response.ok) {
			const gitObjectType = response.headers.get(common.GIT_OBJECT_TYPE_HEADER);
			const contentLength = response.headers.get('Content-Length');
			if (gitObjectType === common.GitObjectType.file) {
				return { type: vscode.FileType.File, ctime: 0, mtime: 0, size: Number(contentLength) };
			}
			if (gitObjectType === common.GitObjectType.directory) {
				return { type: vscode.FileType.Directory, ctime: 0, mtime: 0, size: 0 };
			}
		}
		throw vscode.FileSystemError.FileNotFound(uri);
	}

	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		this.outChannel.appendLine(`readDirectory for ${uri.toString()}`);
		const repoUri = uri.with({ scheme: "http" });
		const response = await fetch(repoUri.toString());
		if (response.ok) {
			const gitObjectType = response.headers.get(common.GIT_OBJECT_TYPE_HEADER);
			if (gitObjectType !== common.GitObjectType.directory) {
				throw vscode.FileSystemError.FileNotADirectory(uri);
			}
			const content: common.GitTreeEntry[] = await response.json();
			const mapType = (type: common.GitObjectType) => {
				switch (type) {
					case common.GitObjectType.file: return vscode.FileType.File;
					case common.GitObjectType.directory: return vscode.FileType.Directory;
					default: return vscode.FileType.Unknown;
				}
			};
			return content.map(treeEntry => [treeEntry.name, mapType(treeEntry.type)]);
		}
		throw vscode.FileSystemError.FileNotFound(uri);
	}

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		this.outChannel.appendLine(`readFile for ${uri.toString()}`);
		const repoUri = uri.with({ scheme: "http" });
		const response = await fetch(repoUri.toString());
		if (response.ok) {
			const gitObjectType = response.headers.get(common.GIT_OBJECT_TYPE_HEADER);
			if (gitObjectType === common.GitObjectType.directory) {
				throw vscode.FileSystemError.FileIsADirectory(uri);
			}
			if (gitObjectType === common.GitObjectType.file) {
				const content = await response.arrayBuffer();
				return new Uint8Array(content);
			}
		}
		throw vscode.FileSystemError.FileNotFound(uri);
	}

	createDirectory(uri: vscode.Uri): void | Promise<void> {
		throw new Error("Readonly filesystem.");
	}

	writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }) {
		throw new Error("Readonly filesystem.");
	}

	delete(uri: vscode.Uri, options: { recursive: boolean; }) {
		throw new Error("Readonly filesystem.");
	}

	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }) {
		throw new Error("Readonly filesystem.");
	}

}