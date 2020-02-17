import {Body, Hyphen} from "./de_wiki_lang";


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
 * :Schil·ler, {{Pl.}} Schil·ler <small>(ungebräuchlich)</small>
 * ```
 * or
 *
 * ```
 * {{Worttrennung}}
 * :ety·mo·lo·gisch·en Spek·t·rums
 * ```
 * or
 *
 * ```
 * {{Worttrennung}}
 * :Ei·sen·bal·kon, {{Pl.1}} Ei·sen·bal·kons, ''besonders süddeutsch, österreichisch und schweizerisch:'' {{Pl.2}} Ei·sen·bal·ko·ne
 * ```
 * (this will fail)
 * */
export function consumeWorttrennung(body:Body, block:string[]) {
    for(let idx = 1; idx < block.length; ++idx) {
        let text = block[idx];
        let hyphens = worttrennung.parseWorttrenungLine(text);
        body.hyphen.push(...hyphens);
    }
}


/** this namespace is not made to be used outside of this file, export is just for unit test*/
export namespace worttrennung {
    /**
     * conditions: there is no hyphen lines, which use comma (,) or semi-colon (;) as additional text.
     * They all use coma or/and semi-colon to separated variants of hyphens.
     *
     * */
    export function parseWorttrenungLine(line: string): Hyphen[] {
        // drop : at begin then split to parts
        let hyphenTexts = splitLine(line.slice(1));
        let hyphens = hyphenTexts.map( part => parseHyphenPart(part) ); // each possible hyphens are separated by a , or ;
        return hyphens;
    }

    // (this will fail) s. above
    function splitLineOld(line:string):string[] {
        const SEPARATOR_PATTERN = /\s*[,;]\s*/g;
        let comaSeparatedSplit = line.split(SEPARATOR_PATTERN);
        return comaSeparatedSplit;
    }

    function splitLine(line:string):string[] {
        let splitted:string[] = [];
        let cached:string = "";
        let stack:string[] = []; // mark fvking '' or ( or what ever I don't know for now
        for(let i = 0; i < line.length; ++i) {
            let char = line[i];
            if (char === "'") { // eat the next tick as long as possible
                let nextChar = line[i+1];
                while (nextChar !== undefined && nextChar === "'") {
                    i = i+1; // jump to next position
                    char += nextChar; // append a new tick to char
                    nextChar = line[i+1];
                }
            }
            cached += char;
            // TODO:
        }
        return splitted;
    }

    export function parseHyphenPart(text: string): Hyphen {
        const TYPE_PATTERN = /\{\{[^}]*\}\}/;
        const NON_ALPHA_SPACE_PATTERN = /[^(a-z\s\u00b7)]/i;
        let foundForm = text.match(TYPE_PATTERN);
        let form: string | undefined = undefined;
        let hyphenBeginIdx = 0;
        if (foundForm !== null) {
            form = foundForm[0]; // take the whole match
            hyphenBeginIdx = (foundForm.index || 0) + form.length;
        }
        // the next non-character after form, if any, does not belong to hyphen
        let textBehindForm = text.slice(hyphenBeginIdx);

        let hyphenEndIdx = textBehindForm.search(NON_ALPHA_SPACE_PATTERN);
        let hyphenText = (hyphenEndIdx >= 0) ? textBehindForm.slice(0, hyphenEndIdx)
                                            : textBehindForm;
        let hyphen = new Hyphen();
        hyphen.syllable = hyphenText.trim().split(/\s*\u00b7\s*/);
        if (form !== undefined) {
            hyphen.form = form.trim();
        }
        // everything before form and hyphen are addtional information
        if (hyphenBeginIdx > 0 ) {
            let additionalEndIdx = 0;
            if (foundForm !== null) {
                additionalEndIdx = foundForm.index || 0;
            } else { // no form, so every thing before hyphen are additional information
                additionalEndIdx = hyphenBeginIdx;
            }
            let additionalInformation = text.slice(0, additionalEndIdx).trim();
            if (additionalInformation.length > 0) {
                hyphen.additionalInformation.push(additionalInformation);
            }
        }
        if (hyphenEndIdx >=0 ) {
            let suffixAdditionalInfo = textBehindForm.slice(hyphenEndIdx).trim();
            if (suffixAdditionalInfo.length > 0) {
                hyphen.additionalInformation.push(suffixAdditionalInfo);
            }
        }
        return hyphen;
    }
}