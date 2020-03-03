import {Body, Hyphen} from "wikinary-eintopf/lib/de_wiki_lang";


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
 *
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
        let hyphenTexts = tokenizeLine(line.slice(1));
        let hyphens = hyphenTexts.map(text => text.trim())
            .map( part => parseHyphenPart(part) ); // each possible hyphens are separated by a , or ;
        return hyphens;
    }

    // (this will fail) s. above
    function splitLineOld(line:string):string[] {
        const SEPARATOR_PATTERN = /\s*[,;]\s*/g;
        let comaSeparatedSplit = line.split(SEPARATOR_PATTERN);
        return comaSeparatedSplit;
    }

    export function tokenizeLine(line:string):string[] {
        let splitted:string[] = [];
        let cached:string = "";
        // mark fvking ''...'' or (...) or '''...''' or '''''...''''' or what ever I don't know for now!
        let expectedMatchParenthesisStack:string[] = [];
        for(let i = 0; i < line.length; ++i) {
            let char = line[i];
            if (char === "'") { // see a tick so eat the next tick as long as possible
                let nextChar = line[i+1];
                while (nextChar !== undefined && nextChar === "'") {
                    char += nextChar; // append a new tick to char
                    i = i + 1; // has eaten a char, so move on one position
                    nextChar = line[i + 1 ];
                    if (nextChar === "'") {
                        i = i + 1; // jump to next position
                    }
                }
            } else if (char === '<') { // see a html tag begin so eat the next char to end of tag (sign >)
                let nextChar = line[i + 1];
                while (nextChar !== undefined && nextChar !== '>') {
                    i = i + 1;
                    char += nextChar;
                    nextChar = line[i];
                }
            }
            if ( isSeparator(char) ) {
                if (expectedMatchParenthesisStack.length === 0) {
                    splitted.push(cached);
                    cached = "";
                } else { // if separator in a markup it loses it is treated as normal char
                    cached += char;
                }
            } else {
                if (isMarkupOpen(char, expectedMatchParenthesisStack )) {
                    expectedMatchParenthesisStack.push(char);
                } else if (isMarkupClose(char, expectedMatchParenthesisStack) ) {
                    expectedMatchParenthesisStack.pop();
                }
                cached += char;
            }
        }
        if (cached !== '') {
            splitted.push(cached);
        }
        return splitted;
    }

    function isSeparator(char:string) {
        return (char === ',') || (char === ';');
    }

    const ITALIC_TOKEN = "''",
        BOLD_TOKEN = "'''",
        ITALIC_BOLD_TOKEN = "'''''",
        TAG_OPEN_TOKEN = /<([^(>/)]+)>/,
        TAG_CLOSE_TOKEN = /<\/([^(>/)]+)>/;
    /**
     * we simplify the syntax and take an assumption, that neither '' nor ''' nor ''''' are placed twice next to each other.
     * */
    export function isMarkupOpen(char:string, stack:string[]):boolean {
        let size = stack.length;
        let isAmbiguous = char === ITALIC_TOKEN || char === BOLD_TOKEN || char === ITALIC_BOLD_TOKEN;
        if (size === 0) { // stack is empty, so check if char is one of '' , ''', ''''' or a html tag
            return isAmbiguous || TAG_OPEN_TOKEN.test(char);
        } else {
            let lastToken = stack[size - 1];
            if (isAmbiguous) { // char is one of ambiguous tokens, so if last token in stack is the same as char, its not an open token
                return lastToken !== char;
            } else  { //
                return TAG_OPEN_TOKEN.test(char); // we don't check if HTML tokens match
            }
        }
    }

    export function isMarkupClose(char:string, stack:string[]) :boolean {
        let size = stack.length;
        let isAmbiguous = char === ITALIC_TOKEN || char === BOLD_TOKEN || char === ITALIC_BOLD_TOKEN;
        if (size === 0) {
            return false; // cannot close an empty stack
        } else {
            let lastToken = stack[size - 1];
            if (isAmbiguous) {
                return lastToken === char;
            } else {
                return TAG_CLOSE_TOKEN.test(char);  // we don't check if HTML tokens match
            }
        }
    }

    /*
    Char DEC    HEX
    ß	 0223	00DF
    ä	 0228	00E4
    ö	 0246	00F6
    ü	 0252	00FC
    Ä	 0196	00C4
    Ö	 0214	00D6
    Ü	 0220	00DC
    */
    export function parseHyphenPart(text: string): Hyphen {
        const TYPE_PATTERN = /\{\{[^}]*\}\}/;
        const NON_ALPHA_SPACE_PATTERN = /[^(a-z\s\u00b7\u00df\u00e4\u00f6\u00fc\u00c4\u00d6\u00d4\-)]/i;
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
        // everything before form and hyphen are additional information
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