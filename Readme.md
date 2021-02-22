# Kanban board extension for Visual Studio Code

This repo contains the code for an extension to VSCode so you can edit a markdown file in the [todo.md](https://github.com/todomd/todo.md) format as a Kanban board.

The original code here was derived from this repo: https://github.com/MikielAgutu/vscode-react-extension

I'm live streaming development of this project on Twitch.

Catch future live streams on Twitch: [https://www.twitch.tv/ashleydavis](https://www.twitch.tv/ashleydavis)

Catch up with old streams on YouTube: [https://www.youtube.com/playlist?list=PLQrB0_KjTmHh55dysxFCQDruSC6Dfbt7W](https://www.youtube.com/playlist?list=PLQrB0_KjTmHh55dysxFCQDruSC6Dfbt7W)

Follow the developer on Twitter for updates: [https://twitter.com/ashleydavis75](https://twitter.com/ashleydavis75)

## Running it from code

### Debug in VSCode

- Open the project in VSCode
- `npm install`
- Navigate to `/react-app`
- `npm install`
- Press `f5`
- Open the command selector (`ctrl+shift+p`)
- Search for the extension (`Open Kanban board`) and press enter

### Debug the React UI by itself

- Navigate to `/react-app`
- `npm run start:dev`

### Package and install the extension

List files that will be included in the package:

```bash
npx vsce ls
```

Create the package:

```bash
npx vsce package
```

Installed the package in VSCode:

```bash
code --install-extension taskboard-0.0.1.vsix
```

## Resources

- [VsCode Extension API](https://code.visualstudio.com/api)
- [VsCode WebView API](https://code.visualstudio.com/api/extension-guides/webview)
- [React](https://reactjs.org/)

