// dirty solution:
import {Body, Hyphen} from "../de_wiki_lang";
import {consumeWorttrennung, worttrennung} from "../de_wiktionary_worttrennung";
import parseHyphenPart = worttrennung.parseHyphenPart;
import parseWorttrenungLine = worttrennung.parseWorttrenungLine;

describe("test consumeWorttrennung", () =>{
    test("consumeWorttrennung.sein (Possessivpronomen)", () => {
        let wikitext =
            `{{Worttrennung}}
:sein, {{Pl.}} sei·ne <small>(mehrere besessene Objekte)</small>, ihr <small>(mehrere Besitzer)</small>`;
        let body:Body = new Body({
            pos: ["Possessivpronomen"],
            addition: []
        });
        consumeWorttrennung(body, wikitext.split("\n"));
        let hyphens = body.hyphen;
        expect(hyphens).toHaveLength(wikitext.split(",").length);
        let sein = hyphens[0].syllable;
        expect(sein).toStrictEqual(["sein"]);
        let seine = hyphens[1].syllable;
        expect(seine).toStrictEqual(["sei", "ne"]);
        let ihr = hyphens[2].syllable;
        expect(ihr).toStrictEqual(["ihr"]);
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
        let hyphens = body.hyphen;
        expect(hyphens).toHaveLength(wikitext.split(/[,;]/).length);
        let ich = hyphens[0].syllable;
        expect(ich).toStrictEqual(["ich"]);
        let meiner = hyphens[1].syllable;
        expect(meiner).toStrictEqual(["mei", "ner"]);
        let mein = hyphens[2].syllable;
        expect(mein).toStrictEqual(["mein"]);
        let mir = hyphens[3].syllable;
        expect(mir).toStrictEqual(["mir"]);
        let mich = hyphens[4].syllable;
        expect(mich).toStrictEqual(["mich"]);
        let wir = hyphens[5].syllable;
        expect(wir).toStrictEqual(["wir"]);
        let unser = hyphens[6].syllable;
        expect(unser).toStrictEqual(["un", "ser"]);
        let unsDat = hyphens[7].syllable;
        expect(unsDat).toStrictEqual(["uns"]);
        let unsAkk = hyphens[8].syllable;
        expect(unsAkk).toStrictEqual(["uns"]);
    });
});

describe("test parseWorttrenungLine", () =>{
   test("coma in between additional information", () =>{
        let line = ":Ei·sen·bal·kon, {{Pl.1}} Ei·sen·bal·kons, ''besonders süddeutsch, österreichisch und schweizerisch:'' {{Pl.2}} Ei·sen·bal·ko·ne";
        let h = parseWorttrenungLine(line);
        expect(h).toHaveLength(line.split(",").length - 1);
   });
});


describe("test parseHyphenPart", () =>{
    test("simple word without hyphen", ()=>{
        let word = "ich";
        let h:Hyphen = parseHyphenPart(word);
        expect(h.syllable).toHaveLength(1);
        expect(h.syllable[0]).toBe("ich");
    });

    test("simple word with hyphen", ()=>{
        let word = "{{Gen.}} mei·ner";
        let h:Hyphen = parseHyphenPart(word);
        expect(h.form).toBe("{{Gen.}}");
        expect(h.syllable).toHaveLength(2);
        expect(h.syllable).toStrictEqual(["mei", "ner"]);
    });

    test("simple word with hyphen any additional after hyphen", ()=>{
        let word = "{{Pl.}} Schil·ler <small>(ungebräuchlich)</small>";
        let h:Hyphen = parseHyphenPart(word);
        expect(h.form).toBe("{{Pl.}}");
        expect(h.syllable).toStrictEqual(["Schil", "ler"]);
        expect(h.additionalInformation).toStrictEqual(["<small>(ungebräuchlich)</small>"]);
    });

    test("simple word with hyphen any additional before hyphen", ()=>{
        let word = "''besonders süddeutsch, österreichisch und schweizerisch:'' {{Pl.2}} Ei·sen·bal·ko·ne";
        let h:Hyphen = parseHyphenPart(word);
        expect(h.form).toBe("{{Pl.2}}");
        expect(h.syllable).toStrictEqual(["Ei", "sen", "bal", "ko", "ne"]);
        expect(h.additionalInformation).toStrictEqual(["''besonders süddeutsch, österreichisch und schweizerisch:''"]);
    });
});
