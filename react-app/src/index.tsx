import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';
import Board from 'react-trello';

const unified = require("unified");
const markdown = require("remark-parse");
const stringify = require('remark-stringify');

// Converts from markdown to AST.
const fromMarkdownProcessor = unified().use(markdown);

// Converts from AST to markdown.
const toMarkdownProcessor = unified().use(stringify);

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
            const lane: any = { 
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
                const task: any = {};
                task.title = task.id = listItem.children[0].children[0].value

                lane.cards.push(task);
            }
        }
    }

    return boardData;
}

//
// Converts Kanban board data back to markdown format.
//
function boardToMarkdown(boardData) {
    const markdownAST = {
        type: "root",
        children: [],
    };

    for (const lane of boardData.lanes) {

        const laneHeadingAST = {
            type: "heading",
            depth: 3,
            children: [
                {
                    type: "text",
                    value: lane.title,
                },
            ],
        };
        markdownAST.children.push(laneHeadingAST);

        const cardsListAST = {
            type: "list",
            children: [],
        };
        markdownAST.children.push(cardsListAST);

        for (const card of lane.cards) {
            const cardAST = {
                type: "listItem",
                children: [
                    {
                        type: "paragraph",
                        children: [
                            {
                                type: "text",
                                value: card.title,
                            },
                        ],
                    },
                ],
            };
            cardsListAST.children.push(cardAST);
        }
    }

    const markdown = toMarkdownProcessor.stringify(markdownAST);    
    return markdown;
}

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
                    onDataChange={newData => {

                        //
                        // Convert the updated board data back to markdown format.
                        //
                        const updatedMarkdownText = boardToMarkdown(newData);

                        //
                        // Prototype code (good for debugging):
                        //
                        console.log("onDataChange");
                        console.log(updatedMarkdownText);

                        // 
                        // Send the updated markdown file from the Webview back to the Extension 
                        // to update the active document.
                        //
                        Interactor.updateDocument(updatedMarkdownText);
                    }}
                    /> 
            }
        </>
    }
}

ReactDOM.render(<Index />, document.getElementById("index"));