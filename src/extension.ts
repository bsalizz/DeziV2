import * as vscode from 'vscode';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { updateOverlay } from './overlay';
export function activate(context: vscode.ExtensionContext): void {
    const change = async (visible: boolean) => {
        try {
            const image = visible ? await readFile(join(context.extensionPath, 'media', 'cica.png')) : undefined;
            if (await updateOverlay(vscode.env.appRoot, image)) {
                void vscode.window.showInformationMessage(
                    'Dezi v2: a változás megjelenítéséhez zárd be az összes VS Code-ablakot, majd indítsd újra a VS Code-ot. A Reload Window önmagában nem mindig frissíti a stílust.');
            }
        } catch (error) { void vscode.window.showErrorMessage('Dezi v2: ' + String(error)); }
    };
    context.subscriptions.push(
        vscode.commands.registerCommand('deziv2.show', () => change(true)),
        vscode.commands.registerCommand('deziv2.hide', () => change(false))
    );
}
