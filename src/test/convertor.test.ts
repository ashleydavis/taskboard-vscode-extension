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
        console.log(columnNames);
        const testMarkdownAST = makeTestDataForBoardWithColumns(columnNames);
        console.log(JSON.stringify(testMarkdownAST, null, 4)); 

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

    // 
    // loading tasks
    // 
    //  can load a task
    //  can load a task with different data
    //  can load multiple tasks
    //  AST node path is used as lane id
    //  AST node path is used as task id
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

