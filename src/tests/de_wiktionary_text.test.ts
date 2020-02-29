import {consumePartOfSpeech, consumeTitle, parseDeWikiTextToObject} from "../de_wiktionary_text";
import * as path from "path";
import * as fs from "fs";
import {expectObjectEqual} from "./object_expect";
import {Flexion, WikiPage} from "wikinary-eintopf/lib/de_wiki_lang";

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

    test("consumeTitle.singen", () => {
        let wikiText =
            `{{Siehe auch|[[Singen]]}}
== singen ({{Sprache|Deutsch}}) ==
=== {{Wortart|Verb|Deutsch}} ===`;
        let [index, title] = consumeTitle(0, wikiText.split("\n"));
        expect(index).toBe(2);
        let expectedTitle = {
            lemma:"singen",
            language:"Deutsch"
        };
        expectObjectEqual(title, expectedTitle);
    });
    test("consumeTitle.ich", () => {
        let wikiText =
            `{{Siehe auch|[[Ich]], [[ICH]]}}
{{Wort der Woche|29|2017}}
== ich ({{Sprache|Deutsch}}) ==
=== {{Wortart|Personalpronomen|Deutsch}} ===

{{Deutsch Personalpronomen 1}}

{{Anmerkung}}`;
        let [index, title] = consumeTitle(2, wikiText.split("\n"));
        expect(index).toBe(1);
        let expectedTitle = {
            lemma:"ich",
            language:"Deutsch"
        };
        expectObjectEqual(title, expectedTitle);
    });


    test("consumeTitle.python", () => {
        let wikiText =
            `== Python ({{Sprache|Deutsch}}) ==
=== {{Wortart|Substantiv|Deutsch}}, {{m}}, {{f}} ===

{{Deutsch Substantiv Übersicht
|Genus 1=m
|Genus 2=f
|Nominativ Singular 1=Python
|Nominativ Singular 2=Python
|Nominativ Plural=Pythons
|Genitiv Singular 1=Pythons
|Genitiv Singular 2=Python
|Genitiv Plural=Pythons
|Dativ Singular 1=Python
|Dativ Singular 2=Python
|Dativ Plural=Pythons
|Akkusativ Singular 1=Python
|Akkusativ Singular 2=Python
|Akkusativ Plural=Pythons
|Bild=Morelia viridis 1.jpg|230px|1|ein ''Python'' der Gattung Morelia
}}`;
        let [index, title] = consumeTitle(0, wikiText.split("\n"));
        expect(index).toBe(1);
        let expectedTitle = {
            lemma:"Python",
            language:"Deutsch"
        };
        expectObjectEqual(title, expectedTitle);
    });

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

    test("consumePartOfSpeech.multiple_variants", ()=>{
        let testData = [
            [
                "=== {{Wortart|Substantiv|Deutsch}}, {{mf}}, {{Wortart|Nachname|Deutsch}} ==="
            ],
            [
                "=== {{Wortart|Substantiv|Deutsch}}, {{f}} ==="
            ],
            [
                "=== {{Wortart|Verb|Deutsch}} ==="
            ],
            [
                "=== {{Wortart|Wortverbindung|Deutsch}}, {{Wortart|Interjektion|Deutsch}} ==="
            ],
            [
                "=== {{Wortart|Abkürzung|Deutsch}}, {{Wortart|Substantiv|Deutsch}}, {{f}} ==="
            ]
        ];
        let expected = [
            ["Substantiv", "Nachname"],
            ["Substantiv"],
            ["Verb"],
            ["Wortverbindung", "Interjektion"],
            ["Abkürzung", "Substantiv"]
        ];
        testData.forEach( (data,idx)=>{
            let [count, pos] = consumePartOfSpeech("Python",0,data);
            expect(count).toBe(1);
            expect(pos.pos).toStrictEqual(expected[idx]);
        });
    });
});



function readWikiTextFile(wikiname:string):string {
    let pathName = path.resolve(__dirname, `wikitext/${wikiname}.txt`);
    return fs.readFileSync(pathName, 'utf8');
}











