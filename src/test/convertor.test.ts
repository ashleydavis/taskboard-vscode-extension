import { markdownAstToBoarddata } from "../convertor";

describe("convertor", () => {

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
                    ]
                }
            ]
        };

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: "Todo",
                    title: "Todo",
                    cards: [],
                },
            ],
        });
    });

    it("can load a column with different data", () => {

        const testMarkdownAST = {
            "type": "root",
            "children": [
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Blah",
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
                    ]
                }
            ]
        };

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: "Blah",
                    title: "Blah",
                    cards: [],
                },
            ],
        });
    });

    it("can load multiple columns", () => {

        const testMarkdownAST = {
            "type": "root",
            "children": [
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Task1"
                        }
                    ]
                },
                {
                    "type": "list",
                    "ordered": false,
                    "start": null,
                    "spread": false,
                    "children": [
                    ]
                },
                {
                    "type": "heading",
                    "depth": 3,
                    "children": [
                        {
                            "type": "text",
                            "value": "Task2"
                        }
                    ]
                },
                {
                    "type": "list",
                    "ordered": false,
                    "start": null,
                    "spread": false,
                    "children": [
                    ]
                }
            ]
        };

        const boardData = markdownAstToBoarddata(testMarkdownAST);
        expect(boardData).toEqual({
            lanes: [
                {
                    id: "Task1",
                    title: "Task1",
                    cards: [],
                },
                {
                    id: "Task2",
                    title: "Task2",
                    cards: [],
                },
            ],
        });

    });

    // 
    // 
    // can load a task
    // can load multiple tasks

});