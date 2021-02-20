import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let webViewPanel: vscode.WebviewPanel;
let latestMarkdownEditor: vscode.TextEditor;

import * as unified from "unified";
import * as markdown from "remark-parse";
import * as stringify from 'remark-stringify';
import { Board, IBoard, markdownAstToBoarddata } from './convertor';

// Converts from markdown to AST.
const fromMarkdownProcessor = unified().use(markdown);

// Markdown options:
// https://github.com/syntax-tree/mdast-util-to-markdown#formatting-options
const markdownOptions: any = {
    bullet: "-",
    emphasis: "*",
    fence: "`",
    fences: true,
    listItemIndent: "one",
    entities: true,
};

// Converts from AST to markdown.
const toMarkdownProcessor = unified().use(stringify, markdownOptions);

//
// The most recently converted Kanban board for the currently active markdown document.
//
let currentBoard: IBoard | undefined;

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

    // console.log("Markdown Text:");
    // console.log(markdown);

    const markdownAST = fromMarkdownProcessor.parse(markdown);
    // console.log("Markdown AST");
    // console.log("***");
    // console.log(JSON.stringify(markdownAST, null, 4));
    // console.log("***");

    currentBoard = markdownAstToBoarddata(markdownAST);
    // console.log("Board data");
    // console.log(JSON.stringify(currentBoard, null, 4));

    panel.webview.postMessage({
        command: "document-changed",
        fileName: document.fileName,
        languageId: document.languageId,
        boardData: currentBoard.boardData,
    });

    //
    // Uncomment this to test serialization of markdown straight back to the document.
    //
    // const smarkdown = toMarkdownProcessor.stringify(markdownAST);
    // const invalidRange = new vscode.Range(0, 0, document.lineCount /*intentionally missing the '-1' */, 0);
    // const fullRange = document.validateRange(invalidRange);
    // latestMarkdownEditor.edit(edit => edit.replace(fullRange, smarkdown ));    
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

    case "send-edit": {
        console.log("send-edit");
        console.log(JSON.stringify(message, null, 4));

        // console.log("@@ AST before:");
        // console.log(JSON.stringify(currentBoard!.markdownAST, null, 4));

        switch (message.type) {
            case "add-lane": {
                currentBoard!.addNewLane(message.id,  message.title, );
                break;
            }

            case "delete-lane": {
                currentBoard!.removeLane(message.laneId);
                break;
            }

            case "edit-lane-title": {
                currentBoard!.editLaneTitle(message.laneId, message.title);
                break;
            }

            case "move-lane": {
                //TODO:
                break;
            }

            case "add-card": {
                currentBoard!.addNewTask(message.laneId, message.cardId, message.title);
                break;
            }

            case "delete-card": {
                currentBoard!.removeTask(message.laneId, message.cardId);
                break;
            }

            case "edit-card-title": {
                currentBoard!.editCardTitle(message.cardId, message.title);
                break;
            }

            case "edit-card-description": {
                //todo:
                console.log("Edit card description...");
                console.log(message);
                break;
            }

            case "move-card": {
                //TODO:
                break;
            }

            default: {
                throw new Error(`Unexpected edit type: ${message.type}`);
            }
        }

        // console.log("@@ AST after:");
        // console.log(JSON.stringify(currentBoard!.markdownAST, null, 4));

        const markdown = toMarkdownProcessor.stringify(currentBoard!.markdownAST);    

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