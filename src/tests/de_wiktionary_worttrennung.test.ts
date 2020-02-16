// dirty solution:
import {Body} from "../de_wiki_lang";
import {consumeWorttrennung} from "../de_wiktionary_worttrennung";

describe("test consumeWorttrennung", () =>{
    test("consumeWorttrennung.sein (Possessivpronomen)", () => {
        let wikitext =
            `{{Worttrennung}}
:sein, {{Pl.}} sei·ne &lt;small&gt;(mehrere besessene Objekte)&lt;/small&gt;, ihr &lt;small&gt;(mehrere Besitzer)&lt;/small&gt;`;
        let body:Body = new Body({
            pos: ["Possessivpronomen"],
            addition: []
        });
        consumeWorttrennung(body, wikitext.split("\n"));
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
    });
});