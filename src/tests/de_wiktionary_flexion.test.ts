import {
    consumeAdjektivFlexion,
    consumeFlexion,
    consumeSubstantivFlexion,
    consumeVerbFlexion,
    consumeVornameFlexion
} from "../de_wiktionary_flexion";
import {Body, SubstantivFlexion} from "../de_wiki_lang";
import {expectObjectEqual} from "./object_expect";

describe("test flexion", () => {





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
        let body = new Body("Python", {
            pos:["Substantiv"], addition:[]
        });
        let [count, flexion]= consumeFlexion(body,0, wikitext.split("\n"));
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
        let body = new Body("Python", {
            pos:["Substantiv"], addition:[]
        });
        let [count, flexion]= consumeFlexion(body,2, wikitext.split("\n"));
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



});



describe("Substantiv Flexion", ()=>{

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



});


describe("Vorname Flexion", () =>{

    test("consumeVornameFlexion.Rosa",()=>{
        let text =
`{{Deutsch Vorname Übersicht f
|Nominativ Singular=Rosa
|Nominativ Plural 1=Rosas
|Nominativ Plural 2=Rosen
|Genitiv Singular=Rosas
|Genitiv Plural 1=Rosas
|Genitiv Plural 2=Rosen
|Dativ Singular=Rosa
|Dativ Plural 1=Rosas
|Dativ Plural 2=Rosen
|Akkusativ Singular=Rosa
|Akkusativ Plural 1=Rosas
|Akkusativ Plural 2=Rosen
}}`;

        let expectedFlexion = {
            genus: ['f'],
            nominativ: { singular: [ 'Rosa' ], plural: [ 'Rosas', 'Rosen' ] },
            genitiv:   { singular: [ 'Rosas'], plural: [ 'Rosas', 'Rosen' ] },
            dativ:     { singular: [ 'Rosa'],  plural: [ 'Rosas', 'Rosen'] },
            akkusativ: { singular: [ 'Rosa'],  plural: [ 'Rosas', 'Rosen' ] }
        };

        let [lineCount, flexion] = consumeVornameFlexion("Rosa",0, text.split('\n'));
        expect(lineCount).toBe(14);
        expectObjectEqual(flexion, expectedFlexion);

    });

    test("consumeVornameFlexion.Achim",()=>{
        let text =
`{{Deutsch Vorname Übersicht m
|Plural=Achims
}}`;

        let expectedFlexion = {
            genus: ['m'],
            nominativ: { singular: [ "Achim" ], plural: [ "Achims" ] },
            genitiv:   { singular: ["Achim", "Achims" ], plural: [ "Achims" ] },
            dativ:     { singular: [ "Achim" ],  plural: [ "Achims" ] },
            akkusativ: { singular: [ "Achim" ],  plural: [ "Achims" ] }
        };

        let [lineCount, flexion] = consumeVornameFlexion("Achim",0, text.split('\n'));
        expect(lineCount).toBe(3);
        expectObjectEqual(flexion, expectedFlexion);

    });
});


describe("Verb Flexion", () => {
    test("consumeVerbFlexion.fahren", () => {
        let text =
`{{Deutsch Verb Übersicht
|Präsens_ich=fahre
|Präsens_du=fährst
|Präsens_er, sie, es=fährt
|Präteritum_ich=fuhr
|Partizip II=gefahren
|Konjunktiv II_ich=führe
|Imperativ Singular=fahr
|Imperativ Singular*=fahre
|Imperativ Plural=fahrt
|Hilfsverb=sein
|Hilfsverb*=haben
}}`.split('\n');
        let expected = {
            // Tempus
            // Singular, 1. 2. and 3. Person
            "praesens": {
                ich: ["fahre"],
                du: ["fährst"],
                er_sie_es:[ "fährt"]
            },
            "imperfekt": ["fuhr"],
            "perfekt":   ["gefahren"],

            //Modus
            "konjunktiv_II": ["führe"],

            "imperativ":{
                "singular":  ["fahr","fahre"],
                "plural":    ["fahrt"]
            },

            "hilfverb": ["sein", "haben"],
            "weitereKonjugationen": ""
        };
        let [countLine, flexion] = consumeVerbFlexion("fahren",0, text);
        expectObjectEqual(flexion, expected);
        expect(countLine).toBe(text.length);
    });
});


describe("Adjektiv Flexion", ()=>{
    test("consumeAdjektivFlexion.teuer", ()=>{
        let text =
`{{Deutsch Adjektiv Übersicht
|Positiv=teuer
|Komparativ=teurer
|Superlativ=teuersten
}}`.split('\n');

        let expected = {
            "positiv": ["teuer"],
            "komparativ": ["teurer"],
            "superlativ": ["teuersten"]
        };

        let [countLine, flexion] = consumeAdjektivFlexion("teuer", 0, text);
        expect(countLine).toBe(text.length);
        expectObjectEqual(flexion, expected);
    });

    test("consumeAdjektivFlexion.einbruchsicher", ()=>{
        let text =
            `{{Deutsch Adjektiv Übersicht
|Positiv=einbruchsicher
|Komparativ=einbruchsicherer
|Komparativ*=einbruchsichrer
|Superlativ=einbruchsichersten
}}`.split('\n');

        let expected = {
            "positiv": ["einbruchsicher"],
            "komparativ": ["einbruchsicherer", "einbruchsichrer"],
            "superlativ": ["einbruchsichersten"]
        };

        let [countLine,  flexion] = consumeAdjektivFlexion("einbruchsicher", 0, text);
        expect(countLine).toBe(text.length);
        expectObjectEqual(flexion, expected);
    });
});














