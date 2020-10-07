const Interactor = {
    showInformationMessage: text => console.log(`showInformationMessage ${text}`),
    getDirectoryInfo: callback => console.log(`getDirectoryInfo ${callback}`),
    updateDocument: markdown => console.log(`updateDocument ${markdown}`),
    documentChangedEvent: undefined,
}

export default Interactor;