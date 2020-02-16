import * as fs from "fs";
import * as path from "path";

import {
    isGermanWord,
    escape,
    parseDeWikiTextToObject,
    consumePartOfSpeech,
    consumeTitle,
    consumeSubstantivFlexion, consumeFlexion, consumeWorttrennung
} from "../de_wiki_aux";
import {WikiPage, Title, SubstantivFlexion, Body} from "../de_wiki_lang";



describe('de_wiki_aux', () => {
    test('isGermanWord', () => {
        let title = "test_word",
            text = "== test_word ({{Sprache|Deutsch}}) ==";
        let isGeWord = isGermanWord(title, text);
        expect(isGeWord).toBeTruthy();
    });


    test('escape', () => {
        let text = "<test att1=\"1\" att2='2'>";
        let result = escape(text);
        expect(result).toEqual("&lt;test att1=&quot;1&quot; att2=&apos;2&apos;&gt;");
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
            title:"singen",
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
            title:"ich",
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
            title:"Python",
            language:"Deutsch"
        };
        expectObjectEqual(title, expectedTitle);
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
            let [count, pos] = consumePartOfSpeech(0,data);
            expect(count).toBe(1);
            expect(pos.pos).toStrictEqual(expected[idx]);
        });
    });

    test("consumeSubstantivFlexion.wort", () => {
        let wikiText =
`{{Siehe auch|[[wort]]}}
{{Wort der Woche|23|2006}}
== Wort ({{Sprache|Deutsch}}) ==
=== {{Wortart|Substantiv|Deutsch}}, {{n}}, Wörter ===

{{Deutsch Substantiv Übersicht
|Genus=n
|Nominativ Singular=Wort
|Nominativ Plural=Wörter
|Genitiv Singular=Worts
|Genitiv Singular*=Wortes
|Genitiv Plural=Wörter
|Dativ Singular=Wort
|Dativ Singular*=Worte
|Dativ Plural=Wörtern
|Akkusativ Singular=Wort
|Akkusativ Plural=Wörter
}}
`;
        let [lastIdx, flexion] = consumeSubstantivFlexion(5, wikiText.split("\n"));
        let expectedFlexion: SubstantivFlexion =  {
            genus: ['n'],
            nominativ: { singular: [ 'Wort' ],            plural: [ 'Wörter' ] },
            genitiv:   { singular: [ 'Worts', 'Wortes' ], plural: [ 'Wörter' ] },
            dativ:     { singular: [ 'Wort', 'Worte' ],   plural: [ 'Wörtern' ] },
            akkusativ: { singular: [ 'Wort' ],            plural: [ 'Wörter' ] }
        };
        expect(lastIdx).toBe(13);

        expectObjectEqual(flexion, expectedFlexion);
    });



    test("consumeSubstantivFlexion.Ferien", ()=>{
        let wikitext =
`== Ferien ({{Sprache|Deutsch}}) ==
=== {{Wortart|Substantiv|Deutsch}} ===

{{Deutsch Substantiv Übersicht
|Genus=0
|Nominativ Singular=—
|Nominativ Plural=Ferien
|Genitiv Singular=—
|Genitiv Plural=Ferien
|Dativ Singular=—
|Dativ Plural=Ferien
|Akkusativ Singular=—
|Akkusativ Plural=Ferien
}}
`;
        let [count, flexion]= consumeSubstantivFlexion(2,wikitext.split("\n"));
        let expectedFlexion = {
            genus: ['0'],
            nominativ: { singular: [ '—' ], plural: [ 'Ferien' ] },
            genitiv:   { singular: [ '—' ], plural: [ 'Ferien' ] },
            dativ:     { singular: [ '—' ], plural: [ 'Ferien' ] },
            akkusativ: { singular: [ '—' ], plural: [ 'Ferien' ] }
        };
        expect(count).toBe(12);
        expect( JSON.parse(JSON.stringify(flexion)) )
            .toStrictEqual(JSON.parse(JSON.stringify(expectedFlexion)));
        // other test
        [count, flexion]= consumeSubstantivFlexion(3,wikitext.split("\n"));
        expect(count).toBe(11);
        expectObjectEqual(flexion, expectedFlexion);
    });


    test("consumeSubstantivFlexion.python", ()=>{
        let wikitext =
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
        let [count, flexion]= consumeSubstantivFlexion(0,wikitext.split("\n"));
        let expectedFlexion = {
            genus: ['m', 'f'],
            nominativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            genitiv:   { singular: [ 'Pythons','Python' ], plural: [ 'Pythons' ] },
            dativ:     { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            akkusativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] }
        };
        expect(count).toBe(20);
        expectObjectEqual(flexion, expectedFlexion);
    });

    test("consumeFlexion.python (beginIdx = 0)", ()=>{
        let wikitext =
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
        let [count, flexion]= consumeFlexion(0, wikitext.split("\n"));
        let expectedFlexion = {
            genus: ['m', 'f'],
            nominativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            genitiv:   { singular: [ 'Pythons','Python' ], plural: [ 'Pythons' ] },
            dativ:     { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            akkusativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] }
        };
        expect(count).toBe(20);
        expectObjectEqual(flexion, expectedFlexion);
    });

    test("consumeFlexion.python (beginIdx = 2)", ()=>{
        let wikitext =
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
        let [count, flexion]= consumeFlexion(2, wikitext.split("\n"));
        let expectedFlexion = {
            genus: ['m', 'f'],
            nominativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            genitiv:   { singular: [ 'Pythons','Python' ], plural: [ 'Pythons' ] },
            dativ:     { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] },
            akkusativ: { singular: [ 'Python', 'Python' ], plural: [ 'Pythons' ] }
        };
        expect(count).toBe(18);
        expectObjectEqual(flexion, expectedFlexion);
    });

    test("consumeWorttrennung.sein (Possessivpronomen)", () => {
        let wikitext =
`{{Worttrennung}}
:sein, {{Pl.}} sei·ne &lt;small&gt;(mehrere besessene Objekte)&lt;/small&gt;, ihr &lt;small&gt;(mehrere Besitzer)&lt;/small&gt;`;
        let body:Body = new Body({
            pos: ["Possessivpronomen"],
            addition: []
        });
        consumeWorttrennung(body, wikitext.split("\n"));
    });

    test("consumeWorttrennung.ich", () => {
        let wikitext =
            `{{Worttrennung}}
:ich, {{Gen.}} mei·ner, {{va.|:}} mein, {{Dat.}} mir, {{Akk.}} mich; {{Pl.}} wir, {{Gen.}} un·ser, {{Dat.}} uns, {{Akk.}} uns`;
        let body:Body = new Body({
            pos: ["Pronomen"],
            addition: []
        });
        consumeWorttrennung(body, wikitext.split("\n"));
    });
});

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



function expectObjectEqual(object:any, expectObj:any): void {
    expect( JSON.parse(JSON.stringify(object)) )
        .toStrictEqual(JSON.parse(JSON.stringify(expectObj)));
}

function readWikiTextFile(wikiname:string):string {
    let pathName = path.resolve(__dirname, `wikitext/${wikiname}.txt`);
    return fs.readFileSync(pathName, 'utf8');
}











