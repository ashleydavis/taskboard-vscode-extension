import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let webViewPanel: vscode.WebviewPanel;
let latestMarkdownEditor: vscode.TextEditor;

function startCommandHandler(context: vscode.ExtensionContext): void {

    const editor = vscode.window.activeTextEditor!;
    const document = editor.document;
    
    console.log("Initial selected document:");
    console.log(document.languageId);
    console.log(document.fileName);

    const showOptions = {
        enableScripts: true
    };

    const panel = vscode.window.createWebviewPanel(
        "kanban-board-extension",
        "Kanban board",
        vscode.ViewColumn.One,
        showOptions
    );

    panel.webview.html = getHtmlForWebview();
    panel.webview.onDidReceiveMessage(
        onPanelDidReceiveMessage,
        undefined,
        context.subscriptions
    );

    panel.onDidDispose(onPanelDispose, null, context.subscriptions);

    webViewPanel = panel;

    vscode.window.onDidChangeActiveTextEditor(e => {

        if (!e) {
            return;
        }

        sendDocumentChangedMessage(e!, panel);
    });

    sendDocumentChangedMessage(editor, panel);
}

//
// Send a message to the webview that the current document in Visual Studio Code has changed.
//
function sendDocumentChangedMessage(editor: vscode.TextEditor, panel: vscode.WebviewPanel): void {
    const document = editor.document;

    console.log("Current document in VS Code has changed:");
    console.log(document.languageId);
    console.log(document.fileName);

    if (document.languageId !== "markdown") {
        console.log("Selected document is not markdown, ignoring it.");
        return;
    }

    latestMarkdownEditor = editor;

    panel.webview.postMessage({
        command: "document-changed",
        fileName: document.fileName,
        languageId: document.languageId,
        text: document.getText(),
    });
}

function onPanelDispose(): void {
  // Clean up panel here
}

function onPanelDidReceiveMessage(message: any) {
  switch (message.command) {

    case 'showInformationMessage':
      vscode.window.showInformationMessage(message.text);
      return;

    case 'getDirectoryInfo':
      runDirCommand((result : string) => webViewPanel.webview.postMessage({ command: 'getDirectoryInfo', directoryInfo: result }));
      return;

    case "update-document": {
        console.log(`Updating document with:`);
        console.log(message.text);

        if (latestMarkdownEditor) {
            const document = latestMarkdownEditor.document;
            const invalidRange = new vscode.Range(0, 0, document.lineCount /*intentionally missing the '-1' */, 0);
            const fullRange = document.validateRange(invalidRange);
            latestMarkdownEditor.edit(edit => edit.replace(fullRange, message.text));    
        }
        else {
            console.error(`No latest editor.`);
        }

        return;
    }
  }
}

function runDirCommand(callback : Function) {
  var spawn = require('child_process').spawn;
  var cp = spawn(process.env.comspec, ['/c', 'dir']);
  
  cp.stdout.on("data", function(data : any) {
    const dataString = data.toString();

    callback(dataString);
  });
  
  cp.stderr.on("data", function(data : any) {
    // No op
  });
}

function getHtmlForWebview(): string {
  try {
    const reactApplicationHtmlFilename = 'index.html';
    const htmlPath = path.join(__dirname, reactApplicationHtmlFilename);
    const html = fs.readFileSync(htmlPath).toString();

    return html;
  }
  catch (e) {
    return `Error getting HTML for web view: ${e}`;
  }
}

export function activate(context: vscode.ExtensionContext) {
    const startCommand = vscode.commands.registerCommand('extension.startExtension', () => startCommandHandler(context));
    context.subscriptions.push(startCommand);
}