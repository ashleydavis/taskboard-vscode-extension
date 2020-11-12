//
// Represents Kanban board data.
//

export interface ICardData {

}

export interface ILaneData {

    id: string;

    title: string;

    cards: ICardData[];
}

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
        };
        boardData.lanes.push(lane);
    }

    return boardData;   
}