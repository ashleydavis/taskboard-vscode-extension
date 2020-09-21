const Interactor = {
    showInformationMessage: text => console.log(`showInformationMessage ${text}`),
    getDirectoryInfo: callback => console.log(`getDirectoryInfo ${callback}`),
    documentChangedEvent: undefined,
}

export default Interactor;