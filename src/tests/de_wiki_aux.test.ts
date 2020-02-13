import {isGermanWord, escape, parseDeWikiTextToObject, parseWortart} from "../de_wiki_aux";
import {Kopf, SubstantivFlexion, WikiPage} from "../de_wiki_lang";



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

function assertHead(wikiPage: WikiPage, expectedHead: Kopf) {
    let k = wikiPage.kopf;
    expect( JSON.parse(JSON.stringify(k)) )
        .toStrictEqual( JSON.parse(JSON.stringify(expectedHead)) );
}

describe("parse wiki text", ()=>{
    test("parseWortart", ()=>{
       let testData = [
           "=== {{Wortart|Substantiv|Deutsch}}, {{mf}}, {{Wortart|Nachname|Deutsch}} ===",
           "=== {{Wortart|Substantiv|Deutsch}}, {{f}} ===",
           "=== {{Wortart|Verb|Deutsch}} ===",
           "=== {{Wortart|Wortverbindung|Deutsch}}, {{Wortart|Interjektion|Deutsch}} ===",
           "=== {{Wortart|Abkürzung|Deutsch}}, {{Wortart|Substantiv|Deutsch}}, {{f}} ==="
       ];
       let expected = [
            ["Substantiv", "Nachname"],
           ["Substantiv"],
           ["Verb"],
           ["Wortverbindung", "Interjektion"],
           ["Abkürzung", "Substantiv"]
       ];
       testData.forEach( (data,idx)=>{
          let pos = parseWortart(data);
          expect(pos).toStrictEqual(expected[idx]);
       });
    });
    test("parse head", () => {
        let wikiText =
`{{Siehe auch|[[Singen]]}}
== singen ({{Sprache|Deutsch}}) ==
=== {{Wortart|Verb|Deutsch}} ===`;
        let wikiPage = parseDeWikiTextToObject(wikiText);
        assertHead(wikiPage, {
            language:"Deutsch",
            partOfSpeech:["Verb"],
            title:"singen"
        });
    });



    function assertFlexion(wikiPage:WikiPage, flexion:SubstantivFlexion) {
        let f = wikiPage?.mittelTeil?.flexion;
        expect(f?.genus).toStrictEqual(flexion.genus);
        expect(f?.nominativ).toStrictEqual(flexion.nominativ);
        expect(f?.genitiv).toStrictEqual(flexion.genitiv);
        expect(f?.dativ).toStrictEqual(flexion.dativ);
        expect(f?.akkusativ).toStrictEqual(flexion.akkusativ);
    }

    test("parse flexion multi dativ", () => {
        let wikiText =
`
{{Siehe auch|[[wort]]}}
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
        let wikiPage = parseDeWikiTextToObject(wikiText);
        assertHead(wikiPage, {
            title: "Wort",
            partOfSpeech: ["Substantiv"],
            language: "Deutsch"
        });
        let expectedFlexion: SubstantivFlexion =  {
            genus: 'n',
            nominativ: { singular: [ 'Wort' ],            plural: [ 'Wörter' ] },
            genitiv:   { singular: [ 'Worts', 'Wortes' ], plural: [ 'Wörter' ] },
            dativ:     { singular: [ 'Wort', 'Worte' ],   plural: [ 'Wörtern' ] },
            akkusativ: { singular: [ 'Wort' ],            plural: [ 'Wörter' ] }
        };
        assertFlexion(wikiPage, expectedFlexion);

    });

    test("flexion no singular", ()=>{
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
        let wikiPage = parseDeWikiTextToObject(wikitext);
        let expectedFlexion = {
            genus: '0',
            nominativ: { singular: [ '—' ], plural: [ 'Ferien' ] },
            genitiv:   { singular: [ '—' ], plural: [ 'Ferien' ] },
            dativ:     { singular: [ '—' ], plural: [ 'Ferien' ] },
            akkusativ: { singular: [ '—' ], plural: [ 'Ferien' ] }
        };
        console.dir(expectedFlexion);
        assertFlexion(wikiPage, expectedFlexion);
    });
});