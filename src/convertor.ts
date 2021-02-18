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

    //
    // Edits the title of a lane in the Kanboard back into the markdown AST.
    //
    editLaneTitle(laneId: string, newTitle: string): void;

    //
    // Adds a new lane to markdown AST.
    //
    addNewLane(laneId: string, title: string): void;
        
    //
    // Removes a lane from a markdown AST.
    //
    removeLane(laneId: string): void;

    //
    // Edits the name of a task in a markdown AST.
    //
    editTaskName(taskId: string, newTaskName: string): void;
    
    //
    // Adds a new task to the lane.
    //
    addNewTask(laneId: string, cardId: string, cardTitle: string): void;

    //
    // Removes a task from a lane.
    //
    removeTask(laneId: string, taskId: string): void;
}

export class Board implements IBoard {

    //
    // Converted data for the board.
    //
    boardData: IBoardData = {
        lanes: [],
    };

    //
    // Abstract syntax tree for the markdown the produced the board.
    //
    markdownAST: any;

    //
    // Maps unique ids to cards.
    //
    cardMap: ICardMap = {};

    //
    // Maps unique ids to lanes.
    //
    laneMap: ILaneMap = {};

    constructor(markdownAST: any) {
        this.markdownAST = markdownAST;
    }

    //
    // Edits the title of a lane in the Kanboard back into the markdown AST.
    //
    editLaneTitle(laneId: string, newTitle: string): void {
        const laneNode = this.laneMap[laneId][0];
        const laneTitleNode = laneNode.children[0];
        laneTitleNode.value = newTitle;
    }

    //
    // Adds a new lane to markdown AST.
    //
    addNewLane(laneId: string, title: string): void {
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
        this.markdownAST.children.push(laneHeadingNode); // Add lane title to AST.

        const laneChildrenNode = {
            "type": "list",
            "children": []
        };
        this.markdownAST.children.push(laneChildrenNode); // Add empty card list to the AST.

        this.laneMap[laneId] = [laneHeadingNode, laneChildrenNode]; // Keep track of the new nodes for the new lane.
    }

    //
    // Removes a lane from a markdown AST.
    //
    removeLane(laneId: string): void {
        const laneHeadingNode = this.laneMap[laneId][0];
        const laneIndex = this.markdownAST.children.indexOf(laneHeadingNode);
        this.markdownAST.children.splice(laneIndex, 2);
    }

    //
    // Edits the name of a task in a markdown AST.
    //
    editTaskName(taskId: string, newTaskName: string): void {
        
        const taskNode = this.cardMap[taskId];
        const taskTitleNode = taskNode.children[0].children[0];
        taskTitleNode.value = newTaskName;
    }

    //
    // Adds a new task to the lane.
    //
    addNewTask(laneId: string, cardId: string, cardTitle: string): void {
        const laneChildrenNode = this.laneMap[laneId][1];
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

        this.cardMap[cardId] = newCardNode; // Track the new node.
    }

    //
    // Removes a task from a lane.
    //
    removeTask(laneId: string, taskId: string): void {
        const laneChildrenNode = this.laneMap[laneId][1];
        const taskNode = this.cardMap[taskId];
        const taskIndex = laneChildrenNode.children.indexOf(taskNode);
        laneChildrenNode.children.splice(taskIndex, 1);
    }

}

//
// Converts a markdown abstract syntax tree (AST) to Kanban board data.
//
export function markdownAstToBoarddata(markdownAST: any, makeUuid?: () => string): IBoard {

    const board = new Board(markdownAST);
    const children = markdownAST.children;

    for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
        const columnNode = children[childIndex];
        if (columnNode.type === "heading" && columnNode.depth === 3) {
            const nextChildIndex = childIndex + 1;
            if (nextChildIndex < children.length) {
                const laneId = makeUuid ? makeUuid() : v4();
                const lane: ILaneData = {
                    id: laneId,
                    title: columnNode.children[0].value,
                    cards: [],
                };
                board.boardData.lanes.push(lane);
        
                const listRootNode = children[nextChildIndex];
                for (let listItemIndex = 0; listItemIndex < listRootNode.children.length; ++listItemIndex) {
                    const listItemNode = listRootNode.children[listItemIndex];
                    const taskText = listItemNode.children[0].children[0];
                    const cardId = makeUuid ? makeUuid() : v4();
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
    }

    return board;   
}
