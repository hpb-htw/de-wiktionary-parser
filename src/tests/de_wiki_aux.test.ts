import {
    isGermanWord,
    escape, removeHTMLComment, stripCurly,
} from "../de_wiki_aux";

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

    test("removeHTMLComment single line", () =>{
        let text = `== Morphematik ({{Sprache|Deutsch}}) ==  <!-- ggf. Sprache ändern -->`;
        let noComment = removeHTMLComment(text);
        expect(noComment).toBe("== Morphematik ({{Sprache|Deutsch}}) ==  ");
    });

    test("removeHTMLComment multiple lines", () =>{
        let text = `== Morphematik ({{Sprache|Deutsch}}) ==  <!-- ggf. Sprache ändern -->
=== {{Wortart|Substantiv|Deutsch}}, {{f}} ===

{{Deutsch Substantiv Übersicht
|Genus=f
|Nominativ Singular=Morphematik
|Nominativ Plural=—
|Genitiv Singular=Morphematik
|Genitiv Plural=—
|Dativ Singular=Morphematik
|Dativ Plural=—
|Akkusativ Singular=Morphematik
|Akkusativ Plural=—
}}`;
        let noComment = removeHTMLComment(text);
        expect(noComment).toBe(
`== Morphematik ({{Sprache|Deutsch}}) ==  
=== {{Wortart|Substantiv|Deutsch}}, {{f}} ===

{{Deutsch Substantiv Übersicht
|Genus=f
|Nominativ Singular=Morphematik
|Nominativ Plural=—
|Genitiv Singular=Morphematik
|Genitiv Plural=—
|Dativ Singular=Morphematik
|Dativ Plural=—
|Akkusativ Singular=Morphematik
|Akkusativ Plural=—
}}`);
    });

    test("stripp Curly", () => {
        let text = "{{Siehe auch|[[polen]]}}";
        let stripped = stripCurly(text);
        expect(stripped).toBe("Siehe auch|[[polen]]");
    });


});


