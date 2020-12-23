//
// Represents a path into the markdown AST that can be used
// to identify a node in the AST for editing.
//
import * as R from "ramda";

export type AstPath = (string | number)[];

//
// Represents a single card/task in the Kanban board.
//
export interface ICardData {

    id: string;

    title: string;

    //
    // This is a path to the node for the task in the
    // markdown AST.
    //
    // It allows for the AST to be edited and serialized
    // without losing data.
    //
    astPath: AstPath;
}

//
// Represents a lane/column of tasks in the Kanban board.
//
export interface ILaneData {

    id: string;

    title: string;

    cards: ICardData[];

    //
    // This is a path to the node for the column in the
    // markdown AST.
    //
    // It allows for the AST to be edited and serialized
    // without losing data.
    //
    astPath: AstPath;
}

//
// Represents a Kanban board.
//
export interface IBoardData {

    lanes: ILaneData[];

}

//
// Converts a markdown abstract syntax tree (AST) to Kanban board data.
//
export function markdownAstToBoarddata(markdownAST: any): IBoardData {

    const boardData: IBoardData = {
        lanes: [],
    };

    for (let childIndex = 0; childIndex < markdownAST.children.length; childIndex += 2) {
        const columnNode = markdownAST.children[childIndex];
        const lane: ILaneData = {
            id: columnNode.children[0].value,
            title: columnNode.children[0].value,
            cards: [],
            astPath: [ "children", childIndex ]
        };
        boardData.lanes.push(lane);

        const listChildIndex = childIndex + 1;
        const listRoot = markdownAST.children[listChildIndex];
        for (let listItemIndex = 0; listItemIndex < listRoot.children.length; ++listItemIndex) {
            const listItem = listRoot.children[listItemIndex];
            const taskText = listItem.children[0].children[0];
            lane.cards.push({
                id: taskText.value,
                title: taskText.value,
                astPath: [ "children", listChildIndex, "children", listItemIndex ],
            });
        }
    }

    return boardData;   
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
        "ordered": false,
        "start": null,
        "spread": false,
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
    const fullTaskAstPath = taskId.concat(["children", 0]);
    const taskTitleNode = R.path<any>(fullTaskAstPath, markdownAST);

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
        "spread": false,
        "checked": false,
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