import {Body} from "./de_wiki_lang";

/**
 * consume a block like
 * ```
 * {{Worttrennung}}
 * :Vo·kal, {{Pl.}} Vo·ka·le
 * ```
 *
 * or
 *
 * ```
 * {{Worttrennung}}
 * :ich, {{Gen.}} mei·ner, {{va.|:}} mein, {{Dat.}} mir, {{Akk.}} mich; {{Pl.}} wir, {{Gen.}} un·ser, {{Dat.}} uns, {{Akk.}} uns
 * ```
 * or
 *
 * ```
 * {{Worttrennung}}
 * :durch·ge·hen, {{Prät.}} ging durch, {{Part.}} durch·ge·gan·gen
 * ```
 *
 * or
 *
 * ```
 * {{Worttrennung}}
 * :Schil·ler, {{Pl.}} Schil·ler &lt;small&gt;(ungebräuchlich)&lt;/small&gt;
 * ```
 * */
export function consumeWorttrennung(body:Body, block:string[]) {
    /*for(let idx = 1; idx < block.length; ++idx) {
        let text = block[idx];
        if ( isReluar )
    }*/
}