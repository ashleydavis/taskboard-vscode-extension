import { markdownAstToBoarddata } from "../convertor";

describe("convertor", () => {

    function makeTestDataForBoardWithColumns(columnNames: string[]): any {
        const children: any[] = [];

        for (const columnName of columnNames) {
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

            children.push({
                "type": "list",
                "ordered": false,
                "start": null,
                "spread": false,
                "children": []
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
        const testMarkdownAST = makeTestDataForBoardWithColumns([ columnName ]);

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
        const testMarkdownAST = makeTestDataForBoardWithColumns([ columnName ]);

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
        const columnNames = [ columnName1, columnName2 ];
        const testMarkdownAST = makeTestDataForBoardWithColumns(columnNames);

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
        const testMarkdownAST = {
            "type": "root",
            "children": [
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Todo",
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
                        }
                    ]
                },
                {
                    "type": "list",
                    "ordered": false,
                    "start": null,
                    "spread": false,
                    "children": [
                        {
                            "type": "listItem",
                            "spread": false,
                            "checked": false,
                            "children": [
                                {
                                    "type": "paragraph",
                                    "children": [
                                        {
                                            "type": "text",
                                            "value": "Task",
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        };

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
        const testMarkdownAST = {
            "type": "root",
            "children": [
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Todo",
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
                        }
                    ]
                },
                {
                    "type": "list",
                    "ordered": false,
                    "start": null,
                    "spread": false,
                    "children": [
                        {
                            "type": "listItem",
                            "spread": false,
                            "checked": false,
                            "children": [
                                {
                                    "type": "paragraph",
                                    "children": [
                                        {
                                            "type": "text",
                                            "value": "AnotherTask",
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        };

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
        const testMarkdownAST = {
            "type": "root",
            "children": [
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Todo",
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
                        }
                    ]
                },
                {
                    "type": "list",
                    "ordered": false,
                    "start": null,
                    "spread": false,
                    "children": [
                        {
                            "type": "listItem",
                            "spread": false,
                            "checked": false,
                            "children": [
                                {
                                    "type": "paragraph",
                                    "children": [
                                        {
                                            "type": "text",
                                            "value": "Task1",
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "listItem",
                            "spread": false,
                            "checked": false,
                            "children": [
                                {
                                    "type": "paragraph",
                                    "children": [
                                        {
                                            "type": "text",
                                            "value": "Task2",
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        };

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

