import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let webViewPanel: vscode.WebviewPanel;
let latestMarkdownEditor: vscode.TextEditor;

import * as unified from "unified";
import * as markdown from "remark-parse";
import * as stringify from 'remark-stringify';
import { editLaneName, IBoardData, markdownAstToBoarddata } from './convertor';

// Converts from markdown to AST.
const fromMarkdownProcessor = unified().use(markdown);

// Converts from AST to markdown.
const toMarkdownProcessor = unified().use(stringify);

//
// The AST for the currently active markdown file.
//
let markdownAST: any;

//
// The converted board data for the currently active markdown. 
//
let boardData: IBoardData | undefined;

function startCommandHandler(context: vscode.ExtensionContext): void {

    const editor = vscode.window.activeTextEditor;
    const document = editor ? editor.document : undefined;
    
    console.log("Initial selected document:");
    if (document) {
        console.log(document.languageId);
        console.log(document.fileName);
    }
    else {
        console.log("No document");
    }

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

    vscode.window.onDidChangeActiveTextEditor(editor => {

        if (!editor) {
            return;
        }

        sendDocumentChangedMessage(editor!, panel);
    });

    if (editor) {
        sendDocumentChangedMessage(editor, panel);
    }
}

//
// Send a message to the webview that the current document in Visual Studio Code has changed.
//
function sendDocumentChangedMessage(editor: vscode.TextEditor, panel: vscode.WebviewPanel): void {
    const document = editor.document;
    if (!document) {
        return;
    }

    console.log("Current document in VS Code has changed:");
    console.log(document.languageId);
    console.log(document.fileName);

    if (document.languageId !== "markdown") {
        console.log("Selected document is not markdown, ignoring it.");
        return;
    }

    latestMarkdownEditor = editor;

    const markdown = document.getText();

    console.log("Markdown Text:");
    console.log(markdown);

    markdownAST = fromMarkdownProcessor.parse(markdown);
    console.log("Markdown AST");
    console.log(JSON.stringify(markdownAST, null, 4));

    boardData = markdownAstToBoarddata(markdownAST);
    console.log("Board data");
    console.log(JSON.stringify(boardData, null, 4));

    panel.webview.postMessage({
        command: "document-changed",
        fileName: document.fileName,
        languageId: document.languageId,
        boardData: boardData,
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

    case "send-edit": {
        console.log("send-edit");
        console.log(JSON.stringify(message, null, 4));

        const laneId = message.payload.laneId;
        const title = message.payload.data.title;
        editLaneName(laneId, title, markdownAST); // Updates the AST.

        // console.log("Updated markdown AST:");
        // console.log(JSON.stringify(markdownAST, null, 4));

        const markdown = toMarkdownProcessor.stringify(markdownAST);    

        const document = latestMarkdownEditor.document;
        const invalidRange = new vscode.Range(0, 0, document.lineCount /*intentionally missing the '-1' */, 0);
        const fullRange = document.validateRange(invalidRange);
        latestMarkdownEditor.edit(edit => edit.replace(fullRange, markdown));    
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