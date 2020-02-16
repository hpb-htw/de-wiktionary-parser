import {
    isGermanWord,
    escape,
} from "../de_wiki_aux";
import {consumePartOfSpeech, consumeTitle} from "../de_wiktionary_text";
import {expectObjectEqual} from "./object_expect";



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







});

