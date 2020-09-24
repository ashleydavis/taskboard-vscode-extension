import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let webViewPanel : vscode.WebviewPanel;

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

        const document = e!.document;
        sendDocumentChangedMessage(document, panel);
    });

    sendDocumentChangedMessage(document, panel);
}

//
// Send a message to the webview that the current document in Visual Studio Code has changed.
//
function sendDocumentChangedMessage(document: vscode.TextDocument, panel: vscode.WebviewPanel): void {
    console.log("Current document in VS Code has changed:");
    console.log(document.languageId);
    console.log(document.fileName);

    if (document.languageId !== "markdown") {
        console.log("Selected document is not markdown, ignoring it.");
        return;
    }

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
    //todo: handle save message!

    case 'showInformationMessage':
      vscode.window.showInformationMessage(message.text); //todo: what other kinds of messages can I use?
      return;

    case 'getDirectoryInfo': //fio:
      runDirCommand((result : string) => webViewPanel.webview.postMessage({ command: 'getDirectoryInfo', directoryInfo: result }));
      return;
  }
}

function runDirCommand(callback : Function) { //fio:
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