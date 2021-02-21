import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let webViewPanel: vscode.WebviewPanel;
let latestMarkdownEditor: vscode.TextEditor;

import * as unified from "unified";
import * as markdown from "remark-parse";
import * as stringify from 'remark-stringify';
import { IBoard, parseKanbanBoard } from './convertor';

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

//
// The command that opens the Kanban board view.
//
function openKanbanBoardView(context: vscode.ExtensionContext): void {

    if (webViewPanel) {
        // Just activate the already open view.
        webViewPanel.reveal();
        return;
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

    initKanbanBoardView(panel, context);
}

//
// Initialises the webview panel that contains the Kanbanboard.
///
function initKanbanBoardView(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {

    panel.webview.html = getHtmlForWebview();
    panel.webview.onDidReceiveMessage(
        onPanelDidReceiveMessage,
        undefined,
        context.subscriptions
    );

    panel.onDidDispose(onPanelDispose, null, context.subscriptions);

    webViewPanel = panel;

    sendDataToKanbanBoardView();
}

//
// Tracks the current active editor in VSCode, if it's markdown sends the data to the Kanban board.
//
function onActiveEditorChanged(editor: vscode.TextEditor): void {

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

    sendDataToKanbanBoardView();
}

//
// Sends latest markdown data to the Kanban board.
//
function sendDataToKanbanBoardView() {
    if (!webViewPanel) {
        return;
    }

    if (!latestMarkdownEditor) {
        return;
    }

    const document = latestMarkdownEditor.document;
    if (!document) {
        return;
    }

    const markdown = document.getText();

    // console.log("Markdown Text:");
    // console.log(markdown);

    const markdownAST = fromMarkdownProcessor.parse(markdown);
    // console.log("Markdown AST");
    // console.log("***");
    // console.log(JSON.stringify(markdownAST, null, 4));
    // console.log("***");

    currentBoard = parseKanbanBoard(markdownAST);
    // console.log("Board data");
    // console.log(JSON.stringify(currentBoard, null, 4));

    webViewPanel.webview.postMessage({
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

//
// Receives a command from the webview.
//
function onPanelDidReceiveMessage(message: any) {
  switch (message.command) {
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
                currentBoard!.moveLane(message.laneId, message.addedIndex);
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
                currentBoard!.editCardDescription(message.cardId, message.description);
                break;
            }

            case "move-card": {
                currentBoard!.moveCard(message.cardId, message.sourceLaneId, message.targetLaneId, message.position);
                break;
            }

            default: {
                throw new Error(`Unexpected edit type: ${message.type}`);
            }
        }

        // console.log("@@ AST after:");
        // console.log(JSON.stringify(currentBoard!.markdownAST, null, 4));

        let markdown = toMarkdownProcessor.stringify(currentBoard!.markdownAST);    

        // Remove escape characters for square brackets.
        markdown = markdown.replace(/\\\[/g, "[");

        const document = latestMarkdownEditor.document;
        const invalidRange = new vscode.Range(0, 0, document.lineCount /*intentionally missing the '-1' */, 0);
        const fullRange = document.validateRange(invalidRange);
        latestMarkdownEditor.edit(edit => edit.replace(fullRange, markdown));    
        return;
    }
  }
}

//
// Loads the HTML for the webview.
//
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

//
// Called when the extension is activated.
//
export function activate(context: vscode.ExtensionContext) {
    const startCommand = vscode.commands.registerCommand('extension.startExtension', () => openKanbanBoardView(context));
    context.subscriptions.push(startCommand);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            onActiveEditorChanged(editor);
        }
    });

    if (vscode.window.activeTextEditor) {
        onActiveEditorChanged(vscode.window.activeTextEditor);
    }

    vscode.window.registerWebviewPanelSerializer('kanban-board-extension', new KanboardBoardSerializer(context));
}

//
// Deserializes an already open webview.
//
class KanboardBoardSerializer implements vscode.WebviewPanelSerializer {
    
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        //TODO: Do I need to restore state in the Kanban board view?
        // `state` is the state persisted using `setState` inside the webview
        // console.log(`Got state: ${state}`);
    
        initKanbanBoardView(webviewPanel, this.context);
    }
}