import {Body, PartOfSpeech, ListItem} from "wikinary-eintopf/lib/de_wiki_lang";
import {consumeBedeutungBlock, Internal} from "../de_wiktionary_sense";



describe("consumeBedeutungBlock", () =>{
    test("durchaus", () => {
        let text =
`{{Bedeutungen}}
:[1] unter allen denkbaren Umständen und besonders auch gegen Widerstand; [[unbedingt]]
:[2] nach Abwägung oder Erfahrung denkbar und möglich, oder alles in allem machbar; [[schon]]
:[3] zu hundert Prozent sicher`.split('\n');
        let root = {
            content:"",
            items:[{
                content:"",
                items:[
                    {content:':[1] unter allen denkbaren Umständen und besonders auch gegen Widerstand; [[unbedingt]]', items:[]},
                    {content:':[2] nach Abwägung oder Erfahrung denkbar und möglich, oder alles in allem machbar; [[schon]]', items: []},
                    {content:':[3] zu hundert Prozent sicher', items: []}
                ]
            }]
        };
        let pos = new PartOfSpeech();
        pos.pos=['Adverb'];
        let body:Body = new Body('durchaus', pos);
        consumeBedeutungBlock(body, text);
        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);
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
        let root = {
            content:"",
            items: [{
                content: "",
                items: [
                    {
                        content: ':[1] {{K|Botanik}} aus [[Wurzel]], [[Stamm]], [[Krone]], [[Rinde]], [[Ast]], [[Zweig]], [[Blatt]], [[Laub]] bestehende [[Gehölzpflanze]]',
                        items: []
                    },
                    {
                        content: ':[2] etwas nach der [[Form]] von <sup>[1]</sup> [[herstellen|Hergestelltes]], [[errichten|Errichtetes]], [[nutzen|Genutztes]]',
                        items: []
                    },
                    {
                        content: ':[3] etwas der [[Struktur]] von <sup>[1]</sup> [[nachbilden|Nachgebildetes]]',
                        items: [{
                            content: '::[3a] {{K|Graphentheorie}} kreisfreier, zusammenhängender [[Graph]]',
                            items: []
                        }]
                    },
                    {content: ':[4] {{K|umgangssprachlich}} [[Weihnachtsbaum]]', items: []},
                    {content: ':[5] [[waagerecht]]e [[Stange]] am (meist unteren) [[Ende]] eines [[Segel]]s', items: []}
                ]
            }]
        };
        let pos = new PartOfSpeech();
        pos.pos=['Substantiv'];
        let body:Body = new Body('Baum', pos);
        consumeBedeutungBlock(body, text);

        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);

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
:[7] einer [[Aufforderung]] oder einem [[Befehl]] [[nachkommen]]`.split('\n');
       const expectLevel = [0, 1, 2, 2, 2, 2, 2, 2, 1, 2];
       const level = text.slice(1).reduce( (acc:number[], value:string, idx:number)=>{
            let currentLevel = acc[acc.length - 1];
            acc.push( Internal.computeLevel(currentLevel, value, 'folgen')[0] );
            return acc;
       } ,[0]);
       expect(level).toStrictEqual(expectLevel);
    });

    test('essen', () =>{
        let text = `{{Bedeutungen}}
* {{intrans.|:}}
:[1] [[fest]]e [[Nahrung]] [[oral]] [[einnehmen]]
* {{trans.|:}}
:[2] etwas als Nahrung dem [[Körper]] [[zuführen]]
:[3] etwas durch das Einnehmen der Nahrung in einen [[bestimmt]]en [[Zustand]] [[bringen]]`.split('\n');
        let root = {
            content: "",
            items: [
                {content: '* {{intrans.|:}}', items:[ {content:':[1] [[fest]]e [[Nahrung]] [[oral]] [[einnehmen]]', items:[]}] },
                {
                    content: '* {{trans.|:}}',
                    items: [{content: ':[2] etwas als Nahrung dem [[Körper]] [[zuführen]]', items: []},
                        {
                            content: ':[3] etwas durch das Einnehmen der Nahrung in einen [[bestimmt]]en [[Zustand]] [[bringen]]',
                            items: []
                        }
                    ]
                }
            ]
        };
        let pos = new PartOfSpeech();
        pos.pos=['XXXXXXX'];
        let body:Body = new Body('essen', pos);
        consumeBedeutungBlock(body, text);
        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);
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
:[8] {{K|Essen|t1=_|kinderspr.}} Fußball spielen`.split('\n');
        let root = {
            content:'',
            items:[
                {content:'*{{K|sonderspr.|t1=_|([[Gaunersprache]]: [[Rotwelsch]])|ugs.}}', items:[
                        {content:':[1] Glücksspiele machen; um Geld spielen', items:[]}
                ]},
                {content:'*{{K|ugs.}}', items:[
                        {content:':[2] riskante Börsengeschäfte betreiben', items: []},
                        {content:':[3] {{K|übertr.}} hartnäckig, kleinlich (um etwas) handeln, verhandeln',items:[]}
                ]},
                {content:'*{{K|sal.}}', items:[
                        {content:':[4] (vor allem bei Glücksspielen) risikofreudig agieren', items: []}
                ]},
                {content:'*{{K|Jargon|t1=_|(vor allem der [[Computerspieler]])}}', items:[
                        {content:':[5] (ein Spiel, vor allem ein Computer- oder Konsolenspiel) spielen', items: []}
                ]},
                {content:'*{{K|landsch.}}', items:[
                        {content:':[6] {{K|südhessisch}} (ein Spiel, vor allem ein Kartenspiel) spielen', items:[]},
                        {content:':[7] {{K|schlesisch}} für etwas den Gegenwert in Geld zahlen; (Geld oder dergleichen) als Gegenleistung geben', items:[]},
                        {content:':[8] {{K|Essen|t1=_|kinderspr.}} Fußball spielen', items: []}
                ]}
            ]
        };
        let pos = new PartOfSpeech();
        pos.pos=['XXXXXXX'];
        let body:Body = new Body('zocken', pos);
        consumeBedeutungBlock(body, text);
        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);
    });

    test('ach', () => {
       let text = `{{Bedeutungen}}
Es ist einer der variabelsten Ausrufe der deutschen Sprache und drückt je nach Länge und Betonung Unterschiedliches aus:
:[1] (kurz, ansteigend) drückt [[Verwunderung]] aus
:[2] (langgezogen, stöhnend) drückt [[Leiden]] aus
:[3] (langgezogen, ansteigend) drückt [[Aufmerksamkeit]] oder [[Interesse]] aus
:[4] (kurzab, wegwerfend) [[Belanglosigkeit]] oder [[Desinteresse]] aus
:[5] (hochtonig, abgerissen) drückt [[Fassungslosigkeit]] aus
:[6] verstärkt ein darauf folgendes Wort

`.split('\n');
        let root = {
            content:'Es ist einer der variabelsten Ausrufe der deutschen Sprache und drückt je nach Länge und Betonung Unterschiedliches aus:',
            items:[
                {content:'', items:[
                        {content:':[1] (kurz, ansteigend) drückt [[Verwunderung]] aus', items:[]},
                        {content:':[2] (langgezogen, stöhnend) drückt [[Leiden]] aus', items:[]},
                        {content:':[3] (langgezogen, ansteigend) drückt [[Aufmerksamkeit]] oder [[Interesse]] aus', items:[]},
                        {content:':[4] (kurzab, wegwerfend) [[Belanglosigkeit]] oder [[Desinteresse]] aus', items:[]},
                        {content:':[5] (hochtonig, abgerissen) drückt [[Fassungslosigkeit]] aus', items:[]},
                        {content:':[6] verstärkt ein darauf folgendes Wort', items: []}
                ]}
            ]
        };
        let pos = new PartOfSpeech();
        pos.pos=['XXXXXXX'];
        let body:Body = new Body('ach', pos);
        consumeBedeutungBlock(body, text);
        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);
    });

    test('ach-2', () => {
        let text = `{{Bedeutungen}}
Es ist einer der variabelsten Ausrufe der deutschen Sprache und drückt je nach Länge und Betonung Unterschiedliches aus:
:[1] (kurz, ansteigend) drückt [[Verwunderung]] aus
:[2] (langgezogen, stöhnend) drückt [[Leiden]] aus
:[3] (langgezogen, ansteigend) drückt [[Aufmerksamkeit]] oder [[Interesse]] aus
:[4] (kurzab, wegwerfend) [[Belanglosigkeit]] oder [[Desinteresse]] aus
:[5] (hochtonig, abgerissen) drückt [[Fassungslosigkeit]] aus
:[6] verstärkt ein darauf folgendes Wort`.split('\n');
        const expected = [0, 0, 2, 2, 2, 2, 2, 2];
        const level = text.slice(1).reduce( (acc:number[], val:string) => {
            let level = acc[acc.length - 1];
            acc.push( Internal.computeLevel(level, val, 'ach')[0] );
            return acc;
        }, [0] );
        expect(level).toStrictEqual(expected);
    });

    test("Evaluationsleitfaden", () =>{
        let text = `{{Bedeutungen}}
:[1] [[Leitfaden]], der zur [[Überprüfung]] der Vollständigkeit der entwickelten Fragestellungen, die zur Untersuchung des [[Evaluationsgegenstand]]es benötigt werden<ref>{{Internetquelle
| hrsg         = Otto-von-Guericke-Universität Magdeburg, Medienbildung und Bildungswissenschaften
| url          = http://www.anna.bplaced.net/evaluation/index.html
| format       = HTML
| sprache      = Deutsch
| titel        = Ablauf einer Evaluation
| untertitel   = Durchführungsphase
| datum        = 2010
| archiv-url   = http://www.anna.bplaced.net/evaluation/page7.html
| archiv-datum = 2010
| zugriff      = 2012-05-08
}}</ref>`.split('\n');
        let root = {
            "content": "",
            "items": [
                {
                    "content": "",
                    "items": [
                        {
                            "content": ":[1] [[Leitfaden]], der zur [[Überprüfung]] der Vollständigkeit der entwickelten Fragestellungen, die zur Untersuchung des [[Evaluationsgegenstand]]es benötigt werden<ref>{{Internetquelle\n| hrsg         = Otto-von-Guericke-Universität Magdeburg, Medienbildung und Bildungswissenschaften\n| url          = http://www.anna.bplaced.net/evaluation/index.html\n| format       = HTML\n| sprache      = Deutsch\n| titel        = Ablauf einer Evaluation\n| untertitel   = Durchführungsphase\n| datum        = 2010\n| archiv-url   = http://www.anna.bplaced.net/evaluation/page7.html\n| archiv-datum = 2010\n| zugriff      = 2012-05-08\n}}</ref>",
                            "items": []
                        }
                    ]
                }
            ]
        };
        let pos = new PartOfSpeech();
        pos.pos=['Substantiv'];
        let body:Body = new Body('Evaluationsleitfaden', pos);
        consumeBedeutungBlock(body, text);
        let result = JSON.parse( JSON.stringify(body.sense) );
        expect(result).toStrictEqual(root);
    });

});

