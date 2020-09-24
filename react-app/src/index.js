import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';

const unified = require("unified");
const markdown = require("remark-parse");
const fromMarkdownProcessor = unified().use(markdown);

const data = require("./data.json"); //TODO: MOVE TEST DATA SO THAT IT SHOWS ONLY IN THE TEST VERSION OF THE REACT APP.

const Interactor = InteractorFactory.create();

//
// Converts markdown format to Kanban board data.
//
function markdownToBoard(markdown) {
    const boardData = {
        lanes: [],
    };

    const markdownAST = fromMarkdownProcessor.parse(markdown);

    //
    // Iterate children in the AST and find columns.
    //
    for (let childIndex = 0; childIndex < markdownAST.children.length; ++childIndex) {
        const child = markdownAST.children[childIndex];
        const isLaneHeading = child.type === "heading" && child.depth === 3; // This child is a lane heading.
        const nextChild = (childIndex + 1) < markdownAST.children.length ? markdownAST.children[childIndex + 1] : undefined;
        const hasList = nextChild && nextChild.type === "list"; // The next child is task list.
        if (isLaneHeading && hasList) {
            childIndex += 1; // Account for the list.

            //
            // This is a columns, convert it to a "lane" in the board.
            //
            const lane = { 
            };
            lane.title = lane.id = child.children[0].value
            lane.cards = [];

            boardData.lanes.push(lane);

            //
            // Iterate tasks in the list.
            //
            for (const listItem of nextChild.children) {
                //
                // This is a task, convert it to a "card" in the board.
                //
                const task = {};
                task.title = task.id = listItem.children[0].children[0].value

                lane.cards.push(task);
            }
        }
    }

    return boardData;
}

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

            const markdown = event.text;
            this.setState({
                data: markdownToBoard(markdown),
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
            {/* <div>Content:</div>
            <div>{this.state.documentDetails.text}</div> */}

            {this.state.data 
                && <Board data={this.state.data} /> 
            }
        </>
    }
}

ReactDOM.render(<Index />, document.getElementById("index"));