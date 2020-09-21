import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';

const data = require("./data.json");

const Interactor = InteractorFactory.create();

class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            directoryInfo: "",
            documentDetails: {
                fileName: "",
                languageId: "",
                text: "",
            }
        };

        Interactor.documentChangedEvent = (event) => {
            console.log("Document has changed! Updating details.");
            this.setState({
                documentDetails: event,
            });
        };
    }

    updateFilesToDisplay() {
        Interactor.getDirectoryInfo(directoryInfo => {
            this.setState({ directoryInfo: directoryInfo });
        })
    }

    render() {
        return <>
            <div>File name: {this.state.documentDetails.fileName}</div>
            <div>Language ID: {this.state.documentDetails.languageId}</div>
            <div>Content:</div>
            <div>{this.state.documentDetails.text}</div>

            {/* 
            TEMPORARILY REMOVED THE BOARD WHILE PROTOTYPING.

            <Board data={data} /> 
            */}
        </>
    }
}

ReactDOM.render(<Index />, document.getElementById("index"));