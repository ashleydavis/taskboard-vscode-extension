const Interactor = {
    showInformationMessage: text => console.log(`showInformationMessage ${text}`),
    getDirectoryInfo: callback => console.log(`getDirectoryInfo ${callback}`),
    sendEdit: payload => console.log(`sendEdit: ${JSON.stringify(payload, null, 4)}`),
    documentChangedEvent: undefined,
}

export default Interactor;