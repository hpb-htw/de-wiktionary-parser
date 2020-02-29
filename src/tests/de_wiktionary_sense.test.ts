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
        let body:Body = new Body('Baum', pos);
        consumeBedeutungBlock(body, text);
        let sense:Sense[] = body.sense;
        console.log(sense);
        expect(sense).toHaveLength(text.length - 1 - 1);
        let thirdSense = sense[2];
        console.log(thirdSense);
    });

    test('folgen', () =>{
       let text =
           `{{Bedeutungen}}
''Mit Hilfsverb „sein“:''
:[1] jemandem oder etwas [[hinterhergehen]] oder auch [[hinterherfahren]]
:[2] ''übertragen:'' jemandem oder etwas [[hinterherblicken]]
:[3] gedanklich [[nachvollziehen]]
:[4] sich [[logisch]] – oder sonst argumentativ – [[ergeben]], [[kausal]]e [[Folge]] sein
:[5] in einer linearen Anordnung das nächste Element sein (dies kann zeitlich, räumlich oder logisch begründet sein)
:[6] sich nach etwas [[richten]], diesem [[nachgeben]]
''Mit Hilfsverb „haben“, stets ohne Dativ-Objekt<!-- oder hat jemand ein Beispiel _mit_ irgendeinem Objekt?-->:''
:[7] einer [[Aufforderung]] oder einem [[Befehl]] [[nachkommen]]
`;
    });

    test('essen', () =>{
        let text = `{{Bedeutungen}}
* {{intrans.|:}}
:[1] [[fest]]e [[Nahrung]] [[oral]] [[einnehmen]]
* {{trans.|:}}
:[2] etwas als Nahrung dem [[Körper]] [[zuführen]]
:[3] etwas durch das Einnehmen der Nahrung in einen [[bestimmt]]en [[Zustand]] [[bringen]]`;
    });

    test('zocken', () => {
        let text = `{{Bedeutungen}}
*{{K|sonderspr.|t1=_|([[Gaunersprache]]: [[Rotwelsch]])|ugs.}}
:[1] Glücksspiele machen; um Geld spielen
*{{K|ugs.}}
:[2] riskante Börsengeschäfte betreiben
:[3] {{K|übertr.}} hartnäckig, kleinlich (um etwas) handeln, verhandeln
*{{K|sal.}}
:[4] (vor allem bei Glücksspielen) risikofreudig agieren
*{{K|Jargon|t1=_|(vor allem der [[Computerspieler]])}}
:[5] (ein Spiel, vor allem ein Computer- oder Konsolenspiel) spielen
*{{K|landsch.}}
:[6] {{K|südhessisch}} (ein Spiel, vor allem ein Kartenspiel) spielen
:[7] {{K|schlesisch}} für etwas den Gegenwert in Geld zahlen; (Geld oder dergleichen) als Gegenleistung geben
:[8] {{K|Essen|t1=_|kinderspr.}} Fußball spielen`;
    });


});
