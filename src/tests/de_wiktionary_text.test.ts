import {
    lineIntroducesABody,
    lineIntroducesAPage, lineIntroducesASection,
    parseDeWikiTextToObject,
    tokenizeWikiText
} from "../de_wiktionary_text";
import * as path from "path";
import * as fs from "fs";
import {expectObjectEqual} from "./object_expect";
import {Flexion, WikiPage} from "wikinary-eintopf/lib/de_wiki_lang";
import  * as Ast from "../de_wiki_ast";
/**
 * implicit condition: a wiki text contains at least one page.
 * */
describe("parseDeWikiTextToObject : Parsing a complete wiki text", () =>{
    test("Get all blocks of body", () =>{
        let wikitext = readWikiTextFile('rosa');
        let wikiPage = parseDeWikiTextToObject(wikitext);
        expect(wikiPage).toHaveLength(1);
        let vorname = wikiPage[0].body[1];
        expect(vorname.lemma).toBe("Rosa");
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
        let selectLanguages = ["Deutsch", "Limburgisch", "Mittelenglisch",
            "Mittelhochdeutsch", "Polnisch", "Slowakisch"];
        let wikitext = readWikiTextFile('ich');
        let wikiPage = parseDeWikiTextToObject(wikitext, selectLanguages);
        expect(wikiPage).toHaveLength(6);
    });
});


describe("Single parts of a wiki text", ()=> {
    test("parse Helium", () => {
       let text = `== Helium ({{Sprache|Deutsch}}) ==
=== {{Wortart|Substantiv|Deutsch}}, {{n}} ===
{{Elemente|He|Wasserstoff|H|Lithium|Li}}
{{Deutsch Substantiv Übersicht
|Genus=n
|Nominativ Singular=Helium
|Nominativ Plural=—
|Genitiv Singular=Heliums
|Genitiv Plural=—
|Dativ Singular=Helium
|Dativ Plural=—
|Akkusativ Singular=Helium
|Akkusativ Plural=—
|Bild 1=Electron shell 002 Helium.svg|mini|1|Schematische Darstellung der Elektronenhülle von ''Helium''
|Bild 2=Edelgase in Entladungsroehren.jpg|mini|1|Edelgase in Entladungsröhren (von links nach rechts): ''Helium'', [[Neon]], [[Argon]], [[Krypton]] und [[Xenon]]
}}`;
        let page:WikiPage[] = parseDeWikiTextToObject(text);
        let flexion:Flexion|undefined = page[0].body[0].flexion;

    });


});

//// new parser
describe("tokenizeWikiText", ()=> {
   test("tokenizeWikiText.sein", () => {
      let text = readWikiTextFile("sein");
      let wiki:Ast.WikiText = tokenizeWikiText(text);
      expect(wiki.pages.length).toEqual(2);
      let deutschPage:Ast.Page = wiki.pages[0];
      expect(deutschPage.bodies.length).toEqual(2);
      expect(deutschPage.lemma).toEqual("sein");
      expect(deutschPage.language).toEqual("Deutsch");
      let verb:Ast.Body = deutschPage.bodies[0];
      expect(verb.lemma).toEqual("sein");
   });

    test("tokenizeWikiText.handsam", () => {
        let text = readWikiTextFile("handsam");
        let wiki:Ast.WikiText = tokenizeWikiText(text);
        expect(wiki.pages.length).toEqual(1);
        expect(wiki.extraLines.length).toEqual(1);
        let deutschPage:Ast.Page = wiki.pages[0];
        expect(deutschPage.bodies.length).toEqual(1);
        let sections = deutschPage.bodies[0].sections;
        expect(sections.length).toEqual(2);
        let mainSection = sections[0];
        expect(mainSection.blocks.length).toEqual(10);
    });

    test("tokenizeWikiText.genesen", () => {
        let text = readWikiTextFile("genesen");
        let wiki:Ast.WikiText = tokenizeWikiText(text);
        //Todo: write assert
    });

    test("tokenizeWikiText.morphemik", () => {
        let text = readWikiTextFile("morphemik");
        let wiki:Ast.WikiText = tokenizeWikiText(text);
        //Todo: write assert
    });

    test("tokenizeWikiText.versprochen", () => {
        let text = readWikiTextFile("versprochen");
        let wiki:Ast.WikiText = tokenizeWikiText(text);
        //Todo: write assert
    });
    test("tokenizeWikiText.geaechtet", () => {
        let text = readWikiTextFile("geaechtet");
        let wiki:Ast.WikiText = tokenizeWikiText(text);
        //Todo: write assert
    });
});

describe("regtest", ()=>{
   test("lineIntroducesAPage", ()=>{
       let data = [
           {line: "== genesen ({{Sprache|Deutsch}}) ==", expected:true},
           {line: "==={{Wortart|Verb|Deutsch}}  ===", expected:false},
           {line: "==== {{Übersetzungen}} ====", expected:false},
       ];
       data.forEach(d => {
          expect( lineIntroducesAPage(d.line) ).toEqual(d.expected);
       });
   });

    test("lineIntroducesABody", ()=>{
        let data = [
            {line: "== genesen ({{Sprache|Deutsch}}) ==", expected:false},
            {line: "== genesen ({{Sprache|Deutsch}})===", expected:false},

            {line: "==={{Wortart|Verb|Deutsch}}  ===", expected:true},
            {line: "==={{Wortart|Verb|Deutsch}}===", expected:true},
            {line: "=== {{Wortart|Verb|Deutsch}}  ===", expected:true},
            {line: "=== {{Wortart|Verb|Deutsch}} ===", expected:true},

            {line: "=== {{Wortart|Verb|Deutsch}} ==", expected:false},
            {line: "== {{Wortart|Verb|Deutsch}} ===", expected:false},

            {line: "==== {{Übersetzungen}} ====", expected:false},
        ];
        data.forEach(d => {
            console.log(d);
            expect( lineIntroducesABody(d.line) ).toEqual(d.expected);
        });
    });

    test("lineIntroducesASection", ()=>{
        let data = [
            {line: "== genesen ({{Sprache|Deutsch}}) ==", expected:false},
            {line: "== genesen ({{Sprache|Deutsch}})===", expected:false},

            {line: "==={{Wortart|Verb|Deutsch}}  ===", expected:false},
            {line: "==={{Wortart|Verb|Deutsch}}===", expected:false},
            {line: "=== {{Wortart|Verb|Deutsch}}  ===", expected:false},
            {line: "=== {{Wortart|Verb|Deutsch}} ===", expected:false},

            {line: "=== {{Wortart|Verb|Deutsch}} ==", expected:false},
            {line: "== {{Wortart|Verb|Deutsch}} ===", expected:false},

            {line: "==== {{Übersetzungen}} ====", expected:true},
            {line: "===={{Übersetzungen}} ====", expected:true},
            {line: "===={{Übersetzungen}}====", expected:true},
            {line: "==== {{Übersetzungen}}====", expected:true},
        ];
        data.forEach(d => {
            console.log(d);
            expect( lineIntroducesASection(d.line) ).toEqual(d.expected);
        });
    });
});

function readWikiTextFile(wikiname:string):string {
    let pathName = path.resolve(__dirname, `wikitext/${wikiname}.txt`);
    return fs.readFileSync(pathName, 'utf8');
}











