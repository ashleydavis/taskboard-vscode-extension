import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';
import { IVSCodeApi, IVSCodeApi_id } from "./VsCodeApi";
import { InjectableClass, InjectProperty } from "@codecapers/fusion";

const data = require("./data.json"); //TODO: MOVE TEST DATA SO THAT IT SHOWS ONLY IN THE TEST VERSION OF THE REACT APP.

const Interactor = InteractorFactory.create();

@InjectableClass()
class Index extends React.Component<any, any> {

    @InjectProperty(IVSCodeApi_id)
    vsCodeApi!: IVSCodeApi;

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

    componentDidMount() {
        this.vsCodeApi.printMessage();
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
                    onLaneAdd={lane => {
                        Interactor.sendEdit({
                            type: "add-lane",
                            id: lane.id,
                            title: lane.title,
                        });
                    }}
                    onLaneDelete={(laneId) => {
                        console.log("onLaneDelete");
                        console.log(laneId);
                        
                        Interactor.sendEdit({
                            type: "delete-lane",
                            laneId: laneId,
                        });
                    }}
                    onLaneUpdate={(laneId, data) => {
                        console.log("onLaneUpdate");
                        console.log("Lane id: " + laneId);
                        console.log("Data: ")
                        console.log(data);

                        Interactor.sendEdit({
                            type: "edit-lane-title",
                            laneId: laneId,
                            title: data.title,
                        });
                    }}
                    handleLaneDragEnd={(removedIndex, addedIndex, payload) => {
                        console.log("handleLaneDragEnd");
                        console.log(removedIndex, addedIndex, payload);

                        Interactor.sendEdit({
                            type: "move-lane",
                            laneId: payload.id,
                            removedIndex: removedIndex,
                            addedIndex: addedIndex,
                        });
                    }}
                    onCardAdd={(card, laneId) => {
                        console.log("onCardAdd");
                        console.log(card);
                        console.log(laneId);

                        Interactor.sendEdit({
                            type: "add-card",
                            cardId: card.id,
                            title: card.title,  
                            laneId: laneId,
                        });
                    }}
                    onCardDelete={(cardId, laneId) => {
                        console.log("onCardDelete");
                        console.log(cardId);
                        console.log(laneId);

                        Interactor.sendEdit({
                            type: "delete-card",
                            cardId: cardId,
                            laneId: laneId,
                        });

                    }}
                    handleDragEnd={(cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
                        console.log("handleDragEnd");
                        console.log(cardId, sourceLaneId, targetLaneId, position, cardDetails);

                        Interactor.sendEdit({
                            type: "move-card",
                            cardId: cardId,
                            sourceLaneId: sourceLaneId,
                            targetLaneId: targetLaneId,
                            position: position,
                            data: data,
                        });
                    }}
                    onCardClick={(cardId, metadata, laneId) => {
                        console.log("onCardClick");
                        console.log(cardId, metadata, laneId);

                        //TODO: Open modal to edit card like trello.
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