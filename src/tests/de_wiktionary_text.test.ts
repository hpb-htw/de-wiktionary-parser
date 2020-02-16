import {parseDeWikiTextToObject} from "../de_wiktionary_text";
import * as path from "path";
import * as fs from "fs";

/**
 * implicit condition: a wiki text contains at least one page.
 * */
describe("parseDeWikiTextToObject : Parsing a complete wiki text", () =>{
    test("Get all blocks of body", () =>{
        let wikitext = readWikiTextFile('rosa');
        let wikiPage = parseDeWikiTextToObject(wikitext);
        expect(wikiPage).toHaveLength(1);
        let vorname = wikiPage[0].body[1];
        console.log(vorname);
    });

    test("Get all body of wiki page", () =>{
        let wikitext = readWikiTextFile('outmost-struct');
        let wikiPage = parseDeWikiTextToObject(wikitext);
        expect(wikiPage[0].body).toHaveLength(2);
        expect(wikiPage[1].body).toHaveLength(2);
    });

    test("Get all pages of wiki text : outmost-struct", () =>{
        let wikitext = readWikiTextFile('outmost-struct');
        let wikiPage = parseDeWikiTextToObject(wikitext);
        expect(wikiPage).toHaveLength(2);
    });

    test("Get all pages of wiki text : ich", () =>{
        let wikitext = readWikiTextFile('ich');
        let wikiPage = parseDeWikiTextToObject(wikitext);
        expect(wikiPage).toHaveLength(6);
    });
});


function readWikiTextFile(wikiname:string):string {
    let pathName = path.resolve(__dirname, `wikitext/${wikiname}.txt`);
    return fs.readFileSync(pathName, 'utf8');
}











