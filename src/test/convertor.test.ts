import { Board, parseKanbanBoard } from "../convertor";

//
// Interfaces for creating test data.
//

interface ITestTask {
    // The name of the task.
    name: string;

    // The description of the task.
    description?: string;
}

interface ITestColumn {

    // The name of the column.
    name: string;

    // The heading depth of the column in the markdown.
    depth?: number;

    // Tasks in this column.
    tasks?: ITestTask[];
}

//
// Function to create test data.
//
function makeTestData(columns: ITestColumn[]): any {
    const children: any[] = [];

    for (const column of columns) {
        const columnName = column.name;
        children.push({
            "type": "heading",
            "depth": column.depth || 3,
            "children": [
                {
                    "type": "text",
                    "value": columnName,
                },
            ],
        });

        const columnChildren: any[] = [];
        if (column.tasks) {
            for (const task of column.tasks) {
                const cardChildren: any[] = [
                    {
                        "type": "paragraph",
                        "children": [
                            {
                                "type": "text",
                                "value": task.name,
                            }
                        ]
                    }
                ];

                if (task.description) {
                    cardChildren.push({
                        "type": "list",
                        "children": [
                            {
                                "type": "listItem",
                                "children": [
                                    {
                                        "type": "paragraph",
                                        "children": [
                                            {
                                                "type": "text",
                                                "value": task.description,
                                            }
                                        ],
                                    }
                                ],
                            }
                        ],
                    });
                }

                const cardNode = {
                    "type": "listItem",
                    "children": cardChildren,
                };
                columnChildren.push(cardNode);
            }
        }

        children.push({
            "type": "list",
            "children": columnChildren,
        });
    }

    return {
        "type": "root",
        "children": children,
    };
}

describe("deserialize markdown to board data", () => {


    it("can load empty board", () => {
        const emptyMarkdownAST = { 
            children: [],
        };
        const board = parseKanbanBoard(emptyMarkdownAST);
        expect(board).toEqual({
            boardData: {
                lanes: [],
            },
            markdownAST: {
                children: [],
            },
            laneMap: {},
            cardMap: {},
        });
    });

    it("can load a column", () => {

        const columnName = "Todo";
        const testMarkdownAST = makeTestData([ { name: columnName } ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(1);

        const lane = board.boardData.lanes[0];
        expect(lane.title).toEqual(columnName);
    });

    it("can load a column with different data", () => {

        const columnName = "Blah";
        const testMarkdownAST = makeTestData([ { name: columnName } ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(1);

        const lane = board.boardData.lanes[0];
        expect(lane.title).toEqual(columnName);
    });

    it("can load multiple columns", () => {

        const columnName1 = "Task1";
        const columnName2 = "Task2";
        const columns = [ { name: columnName1 }, { name: columnName2 } ];
        const testMarkdownAST = makeTestData(columns);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(2);
        
        const lane1 = board.boardData.lanes[0];
        expect(lane1.title).toEqual(columnName1);

        const lane2 = board.boardData.lanes[1];
        expect(lane2.title).toEqual(columnName2);
    });

    it("can load a task", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toBe(1);
        
        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(1);

        const card = lane.cards[0];
        expect(card.title).toEqual("Task");
    });

    it("can load a task with different data", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "AnotherTask",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toBe(1);
        
        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(1);

        const card = lane.cards[0];
        expect(card.title).toEqual("AnotherTask");
    });

    it("can load a task with a description", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "Task",
                        description: "A great task",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);

        expect(board.boardData.lanes.length).toBe(1);
        
        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(1);

        const card = lane.cards[0];
        expect(card.description).toEqual("A great task");
    });

    it("can load multiple tasks", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "Task1",
                    },
                    {
                        name: "Task2",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toBe(1);

        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(2);

        const card1 = lane.cards[0];
        expect(card1.title).toEqual("Task1");

        const card2 = lane.cards[1];
        expect(card2.title).toEqual("Task2");
    });

    it("id is mapped for first loaded column", () => {

        const testMarkdownAST = makeTestData([ { name: "Column" } ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(1);

        const lane = board.boardData.lanes[0];
        expect(board.laneMap[lane.id]).toEqual([
            testMarkdownAST.children[0],
            testMarkdownAST.children[1],
        ]);
    });

    it("id is mapped for second loaded column", () => {

        const testMarkdownAST = makeTestData([ 
            { 
                name: "Column1",
            },
            { 
                name: "Column2",
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(2);

        const lane = board.boardData.lanes[1];
        expect(board.laneMap[lane.id]).toEqual([
            testMarkdownAST.children[2],
            testMarkdownAST.children[3],
        ]);
    });
 

    it("is is mapped for first loaded task", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(1);

        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(1);

        const card = lane.cards[0];
        expect(board.cardMap[card.id]).toEqual(testMarkdownAST.children[1].children[0]);
    });

    it("second loaded task has an AST path", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Todo",
                tasks: [
                    {
                        name: "Task1",
                    },
                    {
                        name: "Task2",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(1);

        const lane = board.boardData.lanes[0];
        expect(lane.cards.length).toEqual(2);

        const card = lane.cards[1];
        expect(board.cardMap[card.id]).toEqual(testMarkdownAST.children[1].children[1]);
    });

    it("id is mapped for task from second column", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Column1",
                tasks: [
                ],
            },
            {
                name: "Column2",
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes.length).toEqual(2);

        const lane = board.boardData.lanes[1];
        expect(lane.cards.length).toEqual(1);

        const card = lane.cards[0];
        expect(board.cardMap[card.id]).toEqual(testMarkdownAST.children[3].children[0]);
    });

    it("ignores headings with depths that are not at level 3", () => {
        const testMarkdownAST = makeTestData([
            {
                name: "Column1",
                depth: 1,
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
            {
                name: "Column2",
                depth: 2,
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
            {
                name: "Column3",
                depth: 4,
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
        ]);

        const board = parseKanbanBoard(testMarkdownAST);
        expect(board.boardData.lanes).toEqual([]);
    });

});

describe("update board data to markdown AST", () => {

    it("can update lane name in markdown AST", () => {

        const testMarkdownAst = makeTestData([ { name: "Old name" } ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.editLaneTitle("lane-1", "New name");

        const expectedResultingMarkdownAst = makeTestData([ { name: "New name" } ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst)
    });

    it("can add new lane to empty markdown AST", () => {

        const testMarkdownAst = makeTestData([]);
        const board = new Board(testMarkdownAst);
        board.addNewLane("1", "New lane");

        const expectedResultingMarkdownAst = makeTestData([ { name: "New lane" } ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can add new lane to existing markdown AST", () => {

        const testMarkdownAst = makeTestData([ { name: "Existing lane" } ]);
        const board = new Board(testMarkdownAst);
        board.addNewLane("1", "New lane");

        const expectedResultingMarkdownAst = makeTestData([ 
            { name: "Existing lane" }, 
            { name: "New lane" },
        ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can remove only lane from a markdown AST", () => {

        const testMarkdownAst = makeTestData([  { name: "Existing lane" } ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.removeLane("lane-1");
        
        const expectedResultingMarkdownAst = makeTestData([]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can remove first lane from a markdown AST", () => {

        const testMarkdownAst = makeTestData([  { name: "Lane1" }, { name: "Lane2"}, ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.removeLane("lane-1");

        const expectedResultingMarkdownAst = makeTestData([ { name: "Lane2" } ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can remove last lane from a markdown AST", () => {

        const testMarkdownAst = makeTestData([  { name: "Lane1" }, { name: "Lane2"}, ]);
        const laneHeadingNode = testMarkdownAst.children[2];
        const laneChildrenNode = testMarkdownAst.children[3];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-2": [laneHeadingNode, laneChildrenNode],
        };
        board.removeLane("lane-2");

        const expectedResultingMarkdownAst = makeTestData([ { name: "Lane1" } ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can remove middle lane from a markdown AST", () => {

        const testMarkdownAst = makeTestData([  { name: "Lane1" }, { name: "Lane2"}, { name: "Lane3" }, ]);
        const laneHeadingNode = testMarkdownAst.children[2];
        const laneChildrenNode = testMarkdownAst.children[3];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-2": [laneHeadingNode, laneChildrenNode],
        };
        board.removeLane("lane-2");

        const expectedResultingMarkdownAst = makeTestData([ { name: "Lane1" },  { name: "Lane3" } ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can update task name in markdown AST", () => {

        const testMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "Old task name",
                    },
                ],
            },
        ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const taskNode = laneChildrenNode.children[0];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.cardMap = {
            "card-1": taskNode,
        };
        board.editTaskName("card-1", "New task name");

        const expectedResultingMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "New task name",
                    },
                ],
            },
        ]);

        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst)
    });

    it("can add a task to an empty lane in markdown AST", () => {

        const testMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                ],
            },
        ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.addNewTask("lane-1", "card-1", "New task name");

        const expectedResultingMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "New task name",
                    },
                ],
            },
        ]);

        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst)
    });

    it("can add a new task to a lane in markdown AST", () => {

        const testMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "Task1",
                    },
                ],
            },
        ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.addNewTask("lane-1", "card-1", "Task2");

        const expectedResultingMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "Task1",
                    },
                    {
                        name: "Task2",
                    },
                ],
            },
        ]);

        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });

    it("can remove a task from a lane in markdown AST", () => {

        const testMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [
                    {
                        name: "Task",
                    },
                ],
            },
        ]);
        const laneHeadingNode = testMarkdownAst.children[0];
        const laneChildrenNode = testMarkdownAst.children[1];
        const taskNode = laneChildrenNode.children[0];
        const board = new Board(testMarkdownAst);
        board.laneMap = {
            "lane-1": [laneHeadingNode, laneChildrenNode],
        };
        board.cardMap = {
            "card-1": taskNode,
        };
        board.removeTask("lane-1", "card-1");

        const expectedResultingMarkdownAst = makeTestData([ 
            { 
                name: "Lane", 
                tasks: [],
            },
        ]);
        expect(testMarkdownAst).toEqual(expectedResultingMarkdownAst);
    });    
});
