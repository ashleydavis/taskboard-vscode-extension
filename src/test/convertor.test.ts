import { markdownAstToBoarddata } from "../convertor";

describe("convertor", () => {

    //
    // Interfaces for creating test data.
    //

    interface ITestTask {
        // The name of the task.
        name: string;
    }

    interface ITestColumn {
        // The name of the column.
        name: string;

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
                "depth": 3,
                "children": [
                    {
                        "type": "text",
                        "value": columnName,
                        "position": {
                            "start": {
                                "line": 7,
                                "column": 5,
                                "offset": 118
                            },
                            "end": {
                                "line": 7,
                                "column": 9,
                                "offset": 122
                            },
                            "indent": []
                        }
                    },
                ],
            });

            const columnChildren: any[] = [];
            if (column.tasks) {
                for (const task of column.tasks) {
                    columnChildren.push({
                        "type": "listItem",
                        "spread": false,
                        "checked": false,
                        "children": [
                            {
                                "type": "paragraph",
                                "children": [
                                    {
                                        "type": "text",
                                        "value": task.name,
                                    }
                                ]
                            }
                        ]
                    });
                }
            }

            children.push({
                "type": "list",
                "ordered": false,
                "start": null,
                "spread": false,
                "children": columnChildren,
            });
        }
   
        return {
            "type": "root",
            "children": children,
        };
    }

    it("can load empty board", () => {
        const emptyMarkdownAST = { 
            children: [],
        };
        const boardData = markdownAstToBoarddata(emptyMarkdownAST);
        expect(boardData).toEqual({
            lanes: [],
        });
    });

    it("can load a column", () => {

        const columnName = "Todo";
        const testMarkdownAST = makeTestData([ { name: columnName } ]);

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: columnName,
                    title: columnName,
                    cards: [],
                },
            ],
        });
    });

    it("can load a column with different data", () => {

        const columnName = "Blah";
        const testMarkdownAST = makeTestData([ { name: columnName } ]);

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: columnName,
                    title: columnName,
                    cards: [],
                },
            ],
        });
    });

    it("can load multiple columns", () => {

        const columnName1 = "Task1";
        const columnName2 = "Task2";
        const columns = [ { name: columnName1 }, { name: columnName2 } ];
        const testMarkdownAST = makeTestData(columns);

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: columnName1,
                    title: columnName1,
                    cards: [],
                },
                {
                    id: columnName2,
                    title: columnName2,
                    cards: [],
                },
            ],
        });

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

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData.lanes.length).toBe(1);

        const lane = boardData.lanes[0];
        expect(lane.cards).toEqual([
            {
                id: "Task",
                title: "Task",
            }
        ]);
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

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData.lanes.length).toBe(1);

        const lane = boardData.lanes[0];
        expect(lane.cards).toEqual([
            {
                id: "AnotherTask",
                title: "AnotherTask",
            }
        ]);
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

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData.lanes.length).toBe(1);

        const lane = boardData.lanes[0];
        expect(lane.cards).toEqual([
            {
                id: "Task1",
                title: "Task1",
            },
            {
                id: "Task2",
                title: "Task2",
            }
        ]);
    });

    // 
    // loading tasks
    // 
    //  AST node path is used as lane id
    //  AST node path is used as task id
    //
    //  write a test that checks that where there is no list it can be handled
    //  write tests to check required children in the AST are missing
    //  tests for other edge cases
    // 
    // editing tasks
    //
    //  can change lane title
    //  can add lane
    //  can delete lane
    //  can change task title
    //  can add task
    //  can delete task

});

