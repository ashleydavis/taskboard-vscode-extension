//
// Represents a path into the markdown AST that can be used
// to identify a node in the AST for editing.
//
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

        const listRoot = markdownAST.children[childIndex + 1];
        for (let listItemIndex = 0; listItemIndex < listRoot.children.length; ++listItemIndex) {
            const listItem = listRoot.children[listItemIndex];
            const taskText = listItem.children[0].children[0];
            lane.cards.push({
                id: taskText.value,
                title: taskText.value,
                astPath: [ "children", 1, "children", listItemIndex ],
            });
        }
    }

    return boardData;   
}