import {isGermanWord,escape} from "../de_wiki_aux";



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