//
// Represents a path into the markdown AST that can be used
// to identify a node in the AST for editing.
//
import { v4 } from "uuid";

//
// Represents a single card/task in the Kanban board.
//
export interface ICardData {

    //
    // Unique id for the card.
    //
    // This is mapped to an AST path through the path map to location the node in the AST for the card.
    //
    id: string;

    title: string;
}

//
// Represents a lane/column of tasks in the Kanban board.
//
export interface ILaneData {

    //
    // Unique id for the lane.
    //
    // This is mapped to an AST path through the path map to location the node in the AST for the lane.
    //
    id: string;

    title: string;

    cards: ICardData[];
}

//
// Maps unique ids to cards.
//
export interface ICardMap {
    [id: string]: any; // Just a ref to the the markdown AST node for the card.
}

//
// Maps unique ids to lanes.
//
export interface ILaneMap {
    [id: string]: [any, any]; // A ref to the two markdown AST nodes for the lane.
}

//
// Represents a Kanban board.
// This is data that is passed to the webview and pluggined into React-trello.
//
export interface IBoardData {

    //
    // Data for each lane in the board.
    //
    lanes: ILaneData[];
}

//
// Represent the Kanban board and packages up the markdown AST and AST path map.
//
export interface IBoard {

    //
    // Converted data for the board.
    //
    boardData: IBoardData;

    //
    // Abstract syntax tree for the markdown the produced the board.
    //
    markdownAST: any;

    //
    // Maps unique ids to cards.
    //
    cardMap: ICardMap;

    //
    // Maps unique ids to lanes.
    //
    laneMap: ILaneMap;
}

//
// Converts a markdown abstract syntax tree (AST) to Kanban board data.
//
export function markdownAstToBoarddata(markdownAST: any): IBoard {

    const board: IBoard = {
        boardData: {
            lanes: [],
        },
        markdownAST: markdownAST,
        cardMap: {},
        laneMap: {},
    };

    for (let childIndex = 0; childIndex < markdownAST.children.length; childIndex += 1) {
        const columnNode = markdownAST.children[childIndex];
        if (columnNode.type === "heading" && columnNode.depth === 3) {
            const laneId = v4();
            const lane: ILaneData = {
                id: laneId,
                title: columnNode.children[0].value,
                cards: [],
            };
            board.boardData.lanes.push(lane);
    
            const listChildIndex = childIndex + 1;
            const listRootNode = markdownAST.children[listChildIndex];
            for (let listItemIndex = 0; listItemIndex < listRootNode.children.length; ++listItemIndex) {
                const listItemNode = listRootNode.children[listItemIndex];
                const taskText = listItemNode.children[0].children[0];
                const cardId = v4();
                lane.cards.push({
                    id: cardId,
                    title: taskText.value,
                });
                board.cardMap[cardId] = listItemNode
            }

            board.laneMap[laneId] = [columnNode, listRootNode];

            childIndex += 1;
        }
    }

    return board;   
}

//
// Edits the title of a lane in the Kanboard back into the markdown AST.
//
export function editLaneTitle(laneId: string, newTitle: string, board: IBoard): void {
    const laneNode = board.laneMap[laneId][0];
    const laneTitleNode = laneNode.children[0];
    laneTitleNode.value = newTitle;
}

//
// Adds a new lane to markdown AST.
//
export function addNewLane(laneId: string, title: string, board: IBoard): void {
    const laneHeadingNode = {
        "type": "heading",
        "depth": 3,
        "children": [
            {
                "type": "text",
                "value": title,
            },
        ],
    };
    board.markdownAST.children.push(laneHeadingNode); // Add lane title to AST.

    const laneChildrenNode = {
        "type": "list",
        "children": []
    };
    board.markdownAST.children.push(laneChildrenNode); // Add empty card list to the AST.

    board.laneMap[laneId] = [laneHeadingNode, laneChildrenNode]; // Keep track of the new nodes for the new lane.
}

//
// Removes a lane from a markdown AST.
//
export function removeLane(laneId: string, board: IBoard): void {
    const laneHeadingNode = board.laneMap[laneId][0];
    const laneIndex = board.markdownAST.children.indexOf(laneHeadingNode);
    board.markdownAST.children.splice(laneIndex, 2);
}

//
// Edits the name of a task in a markdown AST.
//
export function editTaskName(taskId: string, newTaskName: string, board: IBoard): void {
    
    const taskNode = board.cardMap[taskId];
    const taskTitleNode = taskNode.children[0].children[0];
    taskTitleNode.value = newTaskName;
}

//
// Adds a new task to the lane.
//
export function addNewTask(laneId: string, cardId: string, cardTitle: string, board: IBoard): void {
    const laneChildrenNode = board.laneMap[laneId][1];
    const newCardNode = {
        "type": "listItem",
        "children": [
            {
                "type": "paragraph",
                "children": [
                    {
                        "type": "text",
                        "value": cardTitle,
                    }
                ]
            }
        ]
    };
    laneChildrenNode.children.push(newCardNode); // Add node to AST.

    board.cardMap[cardId] = newCardNode; // Track the new node.
}

//
// Removes a task from a lane.
//
export function removeTask(laneId: string, taskId: string, board: IBoard): void {
    const laneChildrenNode = board.laneMap[laneId][1];
    const taskNode = board.cardMap[taskId];
    const taskIndex = laneChildrenNode.children.indexOf(taskNode);
    laneChildrenNode.children.splice(taskIndex, 1);
}