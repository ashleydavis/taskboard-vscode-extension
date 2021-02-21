import * as unified from "unified";
import * as markdown from "remark-parse";
import { parseKanbanBoard } from "../convertor";
import * as dedent from "dedent-js";

// Converts from markdown to AST.
const fromMarkdownProcessor = unified().use(markdown);

describe("integration", () => {

    it("an integration test", () => {

        const testMarkdown = dedent(
            `### Todo

            - [ ] Work on the website ~3d #feat @john 2020-03-20  
            - [ ] Fix the homepage ~1d #bug @jane  
            - [ ] Sub-task or description`
        );

        const markdownAST = fromMarkdownProcessor.parse(testMarkdown);
        const board = parseKanbanBoard(markdownAST, () => "ABCD");
        expect(board.boardData).toEqual({
            "lanes": [
                {
                    "id": "ABCD",
                    "title": "Todo",
                    "cards": [
                        {
                            "id": "ABCD",
                            "title": "[ ] Work on the website ~3d #feat @john 2020-03-20"
                        },
                        {
                            "id": "ABCD",
                            "title": "[ ] Fix the homepage ~1d #bug @jane"
                        },
                        {
                            "id": "ABCD",
                            "title": "[ ] Sub-task or description"
                        }
                    ]
                }
            ]
        });
    });  

    it("bad markdown 1", () => {

        const testMarkdown = `### Todo`;

        const markdownAST = fromMarkdownProcessor.parse(testMarkdown);
        const board = parseKanbanBoard(markdownAST, () => "ABCD");
        expect(board.boardData).toEqual({
            "lanes": [],
        });

    });    

    it("bad markdown 2", () => {

        const testMarkdown = ``;
        const markdownAST = fromMarkdownProcessor.parse(testMarkdown);
        const board = parseKanbanBoard(markdownAST, () => "ABCD");
        expect(board.boardData).toEqual({
            "lanes": [],
        });
    });    

    it("bad markdown 3", () => {

        const testMarkdown = dedent(
            `### Todo

            -`
        );

        const markdownAST = fromMarkdownProcessor.parse(testMarkdown);
        const board = parseKanbanBoard(markdownAST, () => "ABCD");
        expect(board.boardData).toEqual( {
            "lanes": [
                {
                    "id": "ABCD",
                    "title": "Todo",
                    "cards": []
                }
            ]
        });
    });      

    
});