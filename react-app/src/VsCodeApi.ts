import { registerSingleton } from "@codecapers/fusion";

type DocumentChangedEvent = (message: any) => void;

export interface IVSCodeApi {

    //
    // Sends an edit to the kanban board back to the extension.
    //
    sendEdit(payload: any): void;

    //
    // Set an event handler for the document changed event.
    // This notifies the webview that the current document
    // in VSCode has changed.
    //
    setDocumentChangedEvent(fn: DocumentChangedEvent);    

}

export const IVSCodeApi_id = "IVSCodeApi";

export class MockVSCodeApi implements IVSCodeApi {

    //
    // Sends an edit to the kanban board back to the extension.
    //
    sendEdit(payload: any): void {
        console.log("sendEdit called");
        console.log(payload);
    }

    //
    // Set an event handler for the document changed event.
    // This notifies the webview that the current document
    // in VSCode has changed.
    //
    setDocumentChangedEvent(fn: DocumentChangedEvent) {
        console.log("setDocumentChangedEvent called");
    }   
}

export class VSCodeApi implements IVSCodeApi {
    
    //
    // The actual inteface to VSCode.
    //
    private vsCodeApi: any;
    
    //
    // Event that is raised whenever the current markdown
    // document is changed.
    //
    documentChangedEvent: DocumentChangedEvent;

    constructor(vsCodeApi: any) {
        this.vsCodeApi = vsCodeApi;
    }

    //
    // Sends an edit to the kanban board back to the extension.
    //
    sendEdit(payload: any): void {
        this.vsCodeApi.postMessage({
            command: "send-edit",
            ...payload,
        });
    }

    //
    // Set an event handler for the document changed event.
    // This notifies the webview that the current document
    // in VSCode has changed.
    //
    setDocumentChangedEvent(fn: DocumentChangedEvent) {
        this.documentChangedEvent = fn;
    }   
}

if ((window as any).acquireVsCodeApi !== undefined) {
    //
    // If we can acquire the VSCode API, it means we are running under VSCode.
    //
    const vscode = (window as any).acquireVsCodeApi();
    const vsCodeApi = new VSCodeApi(vscode);
    registerSingleton(IVSCodeApi_id, vsCodeApi);

    window.addEventListener('message', event => {
        const message = event.data;
    
        switch(message.command) {
            case "document-changed": {
                if (vsCodeApi.documentChangedEvent) {
                    vsCodeApi.documentChangedEvent(message);
                }
                break;
            }
        }
    });    

}
else {
    //
    // If we can't acquire the VSCode API, it means we are running under the browser in test mode.
    //
    registerSingleton(IVSCodeApi_id, new MockVSCodeApi());   
}
