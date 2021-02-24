# Taskboard development guide

Please contribute to this project!

Email me if you have questions: ashley@codecapers.com.au

The original code here was derived from this repo: https://github.com/MikielAgutu/vscode-react-extension

The UI uses React-trello: https://github.com/rcdexta/react-trello

I'm live streamed development of this project on Twitch.

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
- Set up test mode by commenting out the first line of the `render` function in `index.tsx`, the line of code that pulls the `data` from the component props. If you comment this out test data is used instead and you can run the react-app independently to the extension.
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

