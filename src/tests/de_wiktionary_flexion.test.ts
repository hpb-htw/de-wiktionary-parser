import {consumeFlexion, consumeSubstantivFlexion} from "../de_wiktionary_flexion";
import {SubstantivFlexion} from "../de_wiki_lang";
import {expectObjectEqual} from "./object_expect";

describe("test flexion", () => {

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
});