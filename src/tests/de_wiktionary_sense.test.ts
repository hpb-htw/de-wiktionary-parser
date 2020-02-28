import {Body, PartOfSpeech, Sense} from "wikinary-eintopf/lib/de_wiki_lang";
import {consumeBedeutungBlock} from "../de_wiktionary_sense";


describe("consumeBedeutungBlock", () =>{
    test("Anthropologie", () => {
        let text =
`{{Bedeutungen}}
:[1] unter allen denkbaren Umständen und besonders auch gegen Widerstand; [[unbedingt]]
:[2] nach Abwägung oder Erfahrung denkbar und möglich, oder alles in allem machbar; [[schon]]
:[3] zu hundert Prozent sicher`.split('\n');
        let pos = new PartOfSpeech();
        pos.pos=['Adverb'];
        let body:Body = new Body('durchaus', pos);
        consumeBedeutungBlock(body, text);
        let sense:Sense[] = body.sense;
        console.log(sense);
        expect(sense).toHaveLength(text.length - 1);
        let s1 = sense[0].text;
        expect(s1).toEqual('unter allen denkbaren Umständen und besonders auch gegen Widerstand; unbedingt');
        let s2 = sense[1].text;
        expect(s2).toEqual('nach Abwägung oder Erfahrung denkbar und möglich, oder alles in allem machbar; schon');
        let s3 = sense[2].text;
        expect(s3).toEqual('zu hundert Prozent sicher');
    });

    test("Baum", () => {
        let text =
            `{{Bedeutungen}}
:[1] {{K|Botanik}} aus [[Wurzel]], [[Stamm]], [[Krone]], [[Rinde]], [[Ast]], [[Zweig]], [[Blatt]], [[Laub]] bestehende [[Gehölzpflanze]]
:[2] etwas nach der [[Form]] von <sup>[1]</sup> [[herstellen|Hergestelltes]], [[errichten|Errichtetes]], [[nutzen|Genutztes]]
:[3] etwas der [[Struktur]] von <sup>[1]</sup> [[nachbilden|Nachgebildetes]]
::[3a] {{K|Graphentheorie}} kreisfreier, zusammenhängender [[Graph]]
:[4] {{K|umgangssprachlich}} [[Weihnachtsbaum]]
:[5] [[waagerecht]]e [[Stange]] am (meist unteren) [[Ende]] eines [[Segel]]s`.split('\n');
        let pos = new PartOfSpeech();
        pos.pos=['Adverb'];
        let body:Body = new Body('durchaus', pos);
        consumeBedeutungBlock(body, text);
        let sense:Sense[] = body.sense;
        console.log(sense);
        expect(sense).toHaveLength(text.length - 1 - 1);
        let thirdSense = sense[2];
        console.log(thirdSense);
    });

});
