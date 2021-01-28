

extension:
    current selected markdown document changes:
        parse the markdown to AST
        convert the AST to board data
        Send the board data to the webview

    update received from the webview:
        Parse the update, make the change to the AST
        Serialize AST to markdown
        Replace the file content with the new markdown


webview:
    recieve new board data:
        apply the board data to the Kanban board

    wait for editing events:
        send editing events to the extension