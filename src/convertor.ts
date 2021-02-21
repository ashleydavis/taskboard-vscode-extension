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

    //
    // The title for the card.
    //
    title: string;

    //
    // The description for the card.
    //
    description?: string
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
    // Moves a lane to a new position.
    //
    moveLane(laneId: string, position: number): void;

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

    //
    // Moves a card to a new position.
    //
    moveCard(cardId: string, sourceLaneId: string, targetLaneId: string, position: number): void;

    //
    // Edits the title of a card.
    //
    editCardTitle(cardId: string, title: string): void;

    //
    // Edits the description of a card.
    //
    editCardDescription(cardId: string, description: string): void;
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
    // Moves a lane to a new position.
    //
    moveLane(laneId: string, position: number): void {
        const lane = this.laneMap[laneId];
        for (let childIndex = 0; childIndex < this.markdownAST.children.length; ++childIndex) {
            if (this.markdownAST.children[childIndex] === lane[0]) {
                // Remove the lane from its current position.
                this.markdownAST.children.splice(childIndex, 2);
            }
        }

        //
        // Count through "position" lanes to know where to reinsert the moved lane.
        //
        let numLanes = 0;
        let childIndex;

        for (childIndex = 0; childIndex < this.markdownAST.children.length; ++childIndex) {
            const childNode = this.markdownAST.children[childIndex];
            if (childNode.type === "heading" && childNode.depth === 3) {
                const nextChildIndex = childIndex + 1;
                if (nextChildIndex < this.markdownAST.children.length) {               
                    const cardsListNode = this.markdownAST.children[nextChildIndex];
                    if (cardsListNode && cardsListNode.type === "list") {            
                        if (numLanes >= position) {
                            break;
                        }
                        ++numLanes;
                        ++childIndex;
                        continue;
                    }
                }
            }
        }
                    
        // Add the lane to its new position.
        this.markdownAST.children.splice(childIndex, 0, lane[0], lane[1]); // position*2 is because each lane is two nodes in the AST.
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
    
    //
    // Moves a card to a new position.
    //
    moveCard(cardId: string, sourceLaneId: string, targetLaneId: string, position: number): void {
        const sourceLane = this.laneMap[sourceLaneId];
        const targetLane = this.laneMap[targetLaneId];
        const cardNode = this.cardMap[cardId];
        const sourceListNode = sourceLane[1];
        for (let childIndex = 0; childIndex < sourceListNode.children.length; ++childIndex) {
            if (sourceListNode.children[childIndex] === cardNode) {
                // Remove the card from the source lane.
                sourceListNode.children.splice(childIndex, 1);
                break;
            }
        }

        const targetListNode = targetLane[1];
        targetListNode.children.splice(position, 0, cardNode);
    }

    //
    // Edits the title of a card.
    //
    editCardTitle(cardId: string, newTitle: string): void {
        const cardNode = this.cardMap[cardId];
        const cardTitleNode = cardNode.children[0].children[0];
        cardTitleNode.value = newTitle;
    }

    //
    // Edits the description of a card.
    //
    editCardDescription(cardId: string, newDescription: string): void {
        const cardNode = this.cardMap[cardId];
        const cardDescriptionNode = cardNode.children[1].children[0].children[0].children[0];
        cardDescriptionNode.value = newDescription;
    }
}

//
// Converts a markdown abstract syntax tree (AST) to Kanban board data.
//
export function parseKanbanBoard(markdownAST: any, makeUuid?: () => string): IBoard {

    const board = new Board(markdownAST);
    const children = markdownAST.children;

    for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
        const laneNode = children[childIndex];
        if (laneNode.type === "heading" && laneNode.depth === 3) {
            const nextChildIndex = childIndex + 1;
            if (nextChildIndex < children.length) {               
                const cardsListNode = children[nextChildIndex];
                if (cardsListNode && cardsListNode.type === "list") {
                    const laneId = makeUuid ? makeUuid() : v4();
                    const lane: ILaneData = {
                        id: laneId,
                        title: laneNode.children[0].value,
                        cards: [],
                    };
                    board.boardData.lanes.push(lane);
                    
                    parseCards(cardsListNode, makeUuid, lane, board);

                    board.laneMap[laneId] = [laneNode, cardsListNode];
        
                    childIndex += 1;
                }    
            }
        }
    }

    return board;   
}

//
// Parse cards from markdown AST to the Kanban board data format.
//
function parseCards(listRootNode: any, makeUuid: (() => string) | undefined, lane: ILaneData, board: Board) {

    for (let listItemIndex = 0; listItemIndex < listRootNode.children.length; ++listItemIndex) {
        const listItemNode = listRootNode.children[listItemIndex];
        if (listItemNode.children && listItemNode.children.length > 0) {
            parseCard(listItemNode, makeUuid, lane, board);
        }
    }
}

//
// Parses a card from markdown AST to Kanboard board data format.
//
function parseCard(listItemNode: any, makeUuid: (() => string) | undefined, lane: ILaneData, board: Board) {
    const paragraphNode = listItemNode.children[0];
    if (paragraphNode && paragraphNode.type === "paragraph") {
        if (paragraphNode.children && paragraphNode.children.length > 0) {
            const textNode = paragraphNode.children[0];
            if (textNode) {
                // At minimum to create a card need a paragraph and some text for the title.
                const cardId = makeUuid ? makeUuid() : v4();
                const card: ICardData = {
                    id: cardId,
                    title: textNode.value,
                };
                lane.cards.push(card);
                board.cardMap[cardId] = listItemNode;

                if (listItemNode.children.length > 1) { //TODO: Be good to support a description composed of multiple list items.
                    const subListNode = listItemNode.children[1];
                    if (subListNode && 
                        subListNode.type === "list" && 
                        subListNode.children && 
                        subListNode.children.length > 0) {
                        
                        const subListItemNode = subListNode.children[0];
                        if (subListItemNode && 
                            subListItemNode.type === "listItem" &&
                            subListItemNode.children &&
                            subListItemNode.children.length > 0) {

                            const descriptionParagraph = subListItemNode.children[0];
                            if (descriptionParagraph && 
                                descriptionParagraph.type === "paragraph" && 
                                descriptionParagraph.children &&
                                descriptionParagraph.children.length > 0) {
                                
                                const textNode = descriptionParagraph.children[0];
                                if (textNode && textNode.type === "text" && textNode.value) {
                                    card.description = textNode.value;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

