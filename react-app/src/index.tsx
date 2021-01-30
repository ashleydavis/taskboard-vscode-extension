import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';

const data = require("./data.json"); //TODO: MOVE TEST DATA SO THAT IT SHOWS ONLY IN THE TEST VERSION OF THE REACT APP.

const Interactor = InteractorFactory.create();
class Index extends React.Component<any, any> {

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

            const boardData = event.boardData;
            this.setState({
                data: boardData,
            })
        };
    }

    updateFilesToDisplay() {
        Interactor.getDirectoryInfo(directoryInfo => {
            this.setState({ directoryInfo: directoryInfo });
        })
    }

    render() {
        // Comment this out to use test data instead.
        const data = this.state.data;

        return <>
            {/* <div>File name: {this.state.documentDetails.fileName}</div>
            <div>Language ID: {this.state.documentDetails.languageId}</div>
            <div>{this.state.documentDetails.text}</div> */}

            {data 
                && <Board 
                    editable={true}
                    draggable={true}
                    canAddLanes={true}
                    editLaneTitle={true}
                    collapsibleLanes={true}
                    data={data} 
                    onLaneUpdate={(laneId, data) => {
                        console.log("onLaneUpdate");
                        console.log("Lane id: " + laneId);
                        console.log("Data: ")
                        console.log(data);

                        Interactor.sendEdit({
                            laneId: laneId,
                            data: data,
                        });
                    }}
                    onDataChange={newData => {

                        console.log("onDataChange");
                        console.log(newData);
                    }}
                    /> 
            }
        </>
    }
}

ReactDOM.render(<Index />, document.getElementById("index"));