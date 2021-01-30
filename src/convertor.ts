//
// Represents a path into the markdown AST that can be used
// to identify a node in the AST for editing.
//
import * as R from "ramda";
import { v4 } from "uuid";

export type AstPath = (string | number)[];

//
// Represents a single card/task in the Kanban board.
//
export interface ICardData {

    //
    // Unique id for hte card.
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
// Maps unique ids to ast paths.
//
export interface IPathMap {
    [id: string]: AstPath;
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
    // Maps unique ids to ast paths.
    //
    pathMap: IPathMap;
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
        pathMap: {},
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
            board.pathMap[laneId] = [ "children", childIndex ];
            board.boardData.lanes.push(lane);
    
            const listChildIndex = childIndex + 1;
            const listRoot = markdownAST.children[listChildIndex];
            for (let listItemIndex = 0; listItemIndex < listRoot.children.length; ++listItemIndex) {
                const listItem = listRoot.children[listItemIndex];
                const taskText = listItem.children[0].children[0];
                const cardId = v4();
                lane.cards.push({
                    id: cardId,
                    title: taskText.value,
                });
                board.pathMap[cardId] = [ "children", listChildIndex, "children", listItemIndex ];
            }
    
            childIndex += 1;
        }
    }

    return board;   
}

//
// Edits the name of a lane in the Kanboard back into the markdown AST.
//
export function editLaneName(laneId: AstPath, newLaneName: string, markdownAST: any): void {
    const fullLaneAstPath = laneId.concat(["children", 0]);
    const laneTitleNode = R.path<any>(fullLaneAstPath, markdownAST);

    laneTitleNode.value = newLaneName;
}

//
// Adds a new lane to markdown AST.
//
export function addNewLane(newLaneName: string, markdownAST: any): void {
    markdownAST.children.push({
        "type": "heading",
        "depth": 3,
        "children": [
            {
                "type": "text",
                "value": newLaneName,
            },
        ],
    });

    markdownAST.children.push({
        "type": "list",
        "children": []
    });
}

//
// Removes a lane from a markdown AST.
//
export function removeLane(laneId: AstPath, markdownAST: any): void {
    const laneToRemove = R.path<any>(laneId, markdownAST);
    if (!laneToRemove) {
        return;
    }

    const laneIndex = R.findIndex(child => child === laneToRemove, markdownAST.children);
    if (laneIndex === -1) {
        return;
    }

    markdownAST.children = R.remove(laneIndex, 2, markdownAST.children);
}

//
// Edits the name of a task in a markdown AST.
//
export function editTaskName(taskId: AstPath, newTaskName: string, markdownAST: any): void {
    const taskTitlePath = taskId.concat(["children", 0, "children", 0]);
    const taskTitleNode = R.path<any>(taskTitlePath, markdownAST);

    taskTitleNode.value = newTaskName;
}

//
// Adds a new task to the lane.
//
export function addNewTask(laneId: AstPath, newTaskName: string, markdownAST: any): void {
    const laneNode = R.path<any>(laneId, markdownAST);
    if (!laneNode) {
        return;
    }
    
    const laneNodeIndex =  R.findIndex(child => child === laneNode, markdownAST.children)
    if (laneNodeIndex === -1) {
        return;
    }

    const listNode = markdownAST.children[laneNodeIndex+1];
    listNode.children.push({
        "type": "listItem",
        "children": [
            {
                "type": "paragraph",
                "children": [
                    {
                        "type": "text",
                        "value": newTaskName,
                    }
                ]
            }
        ]
    });
}

//
// Removes a task from a lane.
//
export function removeTask(taskId: AstPath, markdownAST: any): void {
    const listId = R.dropLast(2, taskId);
    const listNode = R.path<any>(listId, markdownAST);
    if (!listNode) {
        return;
    }

    const taskNode = R.path<any>(taskId, markdownAST);
    if (!taskNode) {
        return;
    }

    const taskIndex = R.findIndex(child => child === taskNode, listNode.children);
    if (taskIndex === -1) {
        return;
    }

    listNode.children = R.remove(taskIndex, 1, listNode.children);   
}