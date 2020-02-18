import {
    AdjektivFlexion,
    Body,
    Flexion,
    FlexionFixTemplate,
    FlexionTemplate,
    Kasus,
    PersonalpronomenFlexion,
    SubstantivFlexion, VerbFlexion, VornameFlexion
} from "./de_wiki_lang";
import {BAD_FLEXION, BadWikiSyntax, GENERAL_ERROR, statisticEventEmitter} from "./de_wiki_aux";

/**
 * test if a single line string introduce a flexion block.
 * */
export function isFlexion(blockTitle:string):boolean {
    if (FlexionFixTemplate.includes(blockTitle)) {
        return true;
    }
    if (FlexionTemplate.includes(blockTitle)) {
        return true;
    }
    // if output of main programm shows something like a Flexion, for example
    // [Symbol(badFlexion)]: {
    // '{{Deutsch Adjektiv Übersicht': 11448,
    // ....
    // look here first
    if (blockTitle.startsWith("{{") && !blockTitle.endsWith("}}")) {
        statisticEventEmitter.emit(BAD_FLEXION, blockTitle);
    }
    /*
    if (blockTitle.startsWith("{{") && blockTitle.endsWith("}}")) {
        // TODO: do the fvking step here to check if `{{Anmerkungen|zur Verwendung}}`
        // may be syntactical other than `{{Deutsch Possessivpronomen|sein}}` and what
        // about `{{Deutsch Personalpronomen 1}}` ?
        // for now just ignore it
        // statisticEventEmitter.emit(BAD_FLEXION, blockTitle);
    }
    */
    return false;
}


/**
 * @param beginIdx   Begin-Index to seek the next line beginning with `{{`
 * @param wikiLines  Content of the wiki text, each line is an element of the parameter.
 * @param body the body, to which this flexion belongs.
 *
 * @return [number, ...] number: number of consumed line, that it how many lines are consumed
 *              from the line with index `beginIdx` (include) to the line with content `}}` (include)
 *
 * */
export function consumeFlexion(body:Body, beginIdx:number, wikiLines: string[]) : [number, Flexion|undefined] {
    let [lineIdx, line] = [beginIdx, wikiLines[beginIdx]];
    while (!line.startsWith("{{")) {
        lineIdx += 1;
        line = wikiLines[lineIdx];
    }
    let countConsumedLines = lineIdx - beginIdx;
    if (SubstantivFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumeSubstantivFlexion(lineIdx, wikiLines);
        return [countConsumedLines + countFlexionLine, flexion];
    } else if (VornameFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumeVornameFlexion(body.lemma,lineIdx, wikiLines);
        return  [countConsumedLines + countFlexionLine, flexion];
    } else if(PersonalpronomenFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumePersonalPronomen(body.lemma, lineIdx, wikiLines);
        return [countConsumedLines + countFlexionLine, flexion];
    } else if (VerbFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumeVerbFlexion(body.lemma, lineIdx, wikiLines);
        return [countConsumedLines + countFlexionLine, flexion];
    } else if (AdjektivFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumeAdjektivFlexion(body.lemma, lineIdx, wikiLines);
        return [countConsumedLines + countFlexionLine, flexion];
    } else {
        throw new BadWikiSyntax(`Unknown Flexion ${line}`);
    }
}



/**
 *
 * NOTE: This function does not change its arguments.
 *
 * @param lineIdx index if first line of Flexion
 * @param wikiLines wiki page, splitted in lines.
 *
 * @return [number, SubstantivFlexion| undefined] number: number of consumed lines, that is how many lines
 *                                      are consumed from the line with index `lineIdx` (include) to the
 *                                      line `}}` (include).
 * */
export function consumeSubstantivFlexion(lineIdx: number, wikiLines: string[]): [number, SubstantivFlexion | undefined] {
    let [lineCount, cache] = collectFlexionToCache(lineIdx, wikiLines);
    let flexikon = parseSubtantivFlexion(cache.title, cache.lines);
    return [lineCount, flexikon];
}

function collectFlexionToCache(lineIdx: number, wikiLines: string[]): [number, {title:string, lines:string[]}] {
    const WIKI_LENGTH = wikiLines.length;
    let consumedLineIdx = lineIdx;
    let flexionCache: { title: string, lines: string[] } = {
        title: "",
        lines: []
    };
    let inFlexion = false;

    while (consumedLineIdx < WIKI_LENGTH) {
        let line = wikiLines[consumedLineIdx].trim();
        consumedLineIdx += 1;
        if (line.startsWith("{{") && !line.endsWith("}}")) { // line starts a new flexion
            flexionCache.title = line.replace("{{", "");
            inFlexion = true;
            continue;
        }
        if (inFlexion && line.startsWith("|")) {
            flexionCache.lines.push(line.slice(1)); // drop |
            continue;
        }
        if (inFlexion && line === "}}") {
            inFlexion = false;
            break;
        }
    }
    return [consumedLineIdx - lineIdx, flexionCache];
}

function parseSubtantivFlexion(title: string, lines: string[]): SubstantivFlexion {
    let flexion = new SubstantivFlexion();
    for(let line of lines) {
        let [key, value] = line.split("=");
        let [kasus, numerus] = key.trim().split(/\s+/);
        let flexionKasus: Kasus;
        if (kasus.startsWith(SubstantivFlexion.GENUS)) {
            flexion.genus.push(value);
        }
    }
    feedDetailedKasusToFlexion(title, lines, flexion);
    return flexion;
}

function feedDetailedKasusToFlexion(title:string, listOfKasus:string[], flexion:SubstantivFlexion) {
    for (let line of listOfKasus) {
        let [key, value] = line.split("=");
        let [kasus, numerus] = key.trim().split(/\s+/);
        let flexionKasus: Kasus;
        if (kasus.startsWith(SubstantivFlexion.NOMINATIV)) {
            flexionKasus = flexion.nominativ;
        } else if (kasus.startsWith(SubstantivFlexion.GENITIVE)) {
            flexionKasus = flexion.genitiv;
        } else if (kasus.startsWith(SubstantivFlexion.DATIV)) {
            flexionKasus = flexion.dativ;
        } else if (kasus.startsWith(SubstantivFlexion.AKKUSATIV)) {
            flexionKasus = flexion.akkusativ;
        }else if ( isIgnorableKasus(kasus) ){
            continue;
        } else {
            let lastLines = listOfKasus.slice(-5).join('\n');
            throw new BadWikiSyntax(`Unknown Kasus '${kasus}' title: ${title} lines: ${lastLines}`);
        }
        if (numerus.startsWith(SubstantivFlexion.SINGULAR)) {
            flexionKasus.singular.push(value);
        } else if (numerus.startsWith(SubstantivFlexion.PLURAL)) {
            flexionKasus.plural.push(value);
        }
    }
}


function isIgnorableKasus(kasus:string) {
    return (kasus.startsWith(SubstantivFlexion.GENUS)) ||
            (kasus.startsWith("Bild")) ||
            (kasus.startsWith("mini|1|")) ||
            (kasus==="}}") ||
            (kasus.search(/\d+px/) >= 0);
}

/** test data: see Lemma Rosa and Achim */
export function consumeVornameFlexion(lemma:string, lineIdx: number, wikiLines:string[]): [number, VornameFlexion] {
    let [lineCount, cache] = collectFlexionToCache(lineIdx, wikiLines);
    let flexikon = parseVornameFlexion(lemma, cache.title, cache.lines);
    return [lineCount, flexikon];


}

function parseVornameFlexion(lemma:string ,title:string, lines:string[]):VornameFlexion {
    let flexion:VornameFlexion = new VornameFlexion();
    let genus = title.split(/\s+/).slice(-1)[0];
    // there are only two type: either f for feminin or m for maskulin. But to keep code extensible let genus be an array
    flexion.genus.push(genus);
    try {
        feedDetailedKasusToFlexion(title, lines, flexion);
    }catch (e) {
        // Vorname doesn't have detailed flexion list. Use other way to fill Kasus

        for (let line of lines) {
            let [key,value] = line.split("=");
            if (key === VornameFlexion.PLURAL) {
                if (value !== undefined) {
                    value = value.trim();
                    flexion.nominativ.plural.push(value);
                    flexion.genitiv.plural.push(value);
                    flexion.dativ.plural.push(value);
                    flexion.akkusativ.plural.push(value);
                    // Singular (not sure)
                    flexion.nominativ.singular.push(lemma);
                    flexion.genitiv.singular.push(lemma);
                    flexion.genitiv.singular.push(lemma + "s"); // << Not sure about it!
                    flexion.dativ.singular.push(lemma);
                    flexion.akkusativ.singular.push(lemma);
                    statisticEventEmitter.emit(BAD_FLEXION, `Not sure about Genitiv Form of ${lemma}`);
                } else {
                    statisticEventEmitter.emit(BAD_FLEXION, `Expected a Plural Form for Parameter ${key}, lemma ${lemma}`);
                }
            } else {
                statisticEventEmitter.emit(BAD_FLEXION, `Unknown parameter ${key} of '${lemma}' lines: ${line}`);
            }
        }

    }
    return flexion;
}

/*TODO*/
export function consumePersonalPronomen(lemma:string, beginIdx: number, wikiLines:string[]):[number, PersonalpronomenFlexion] {
    statisticEventEmitter.emit(BAD_FLEXION, `Not support PersonalPronomen for now, lemma: '${lemma}'`);
    let pFlexion = new PersonalpronomenFlexion(wikiLines[0]);
    return [1, pFlexion];
}

export function consumeVerbFlexion(lemma:string, lineIdx: number, wikiLines:string[]):[number, VerbFlexion] {
    let [lineCount, cache] = collectFlexionToCache(lineIdx, wikiLines);
    let flexikon = parseVerbFlexion(lemma,cache.title, cache.lines);
    return [lineCount, flexikon];
}

function parseVerbFlexion(lemma:string, title:string, lines:string[]):VerbFlexion {
    let flexion = new VerbFlexion();
    for(let line of lines) {
        let [key, value] = line.split("=");
        if (!ignoreableVerbFlexionParameter(key)) {
            value = normalizedValueOfFlexion(lemma, line, value);
            if (key.startsWith(VerbFlexion.PRAESENS_ICH)) {
                flexion.praesens.ich.push(value);
            } else if (key.startsWith(VerbFlexion.PRAESENS_DU)) {
                flexion.praesens.du.push(value);
            } else if (key.startsWith(VerbFlexion.PRAESENS_ER_SIE_ES)) {
                flexion.praesens.er_sie_es.push(value);
            } else if (key.startsWith(VerbFlexion.PRAETERITUM_ICH)) {
                flexion.imperfekt.push(value);
            } else if (key.startsWith(VerbFlexion.KONJUNKTIV_II_ICH)) {
                flexion.konjunktiv_II.push(value);
            } else if (key.startsWith(VerbFlexion.IMPERATIV_SINGULAR)) {
                flexion.imperativ.singular.push(value);
            } else if (key.startsWith(VerbFlexion.IMPERATIV_PLURAL)) {
                flexion.imperativ.plural.push(value);
            } else if (key.startsWith(VerbFlexion.PARTIZIP_II)) {
                flexion.perfekt.push(value);
            } else if (key.startsWith(VerbFlexion.HILF_VERB)) {
                flexion.hilfverb.push(value);
            } else if (key.startsWith(VerbFlexion.WEITERE_KONJUGATIONEN)) {
                statisticEventEmitter.emit(BAD_FLEXION, `Not support ${key} of ${lemma}; line: ${line} for now`);
            } else {
                statisticEventEmitter.emit(BAD_FLEXION, `Unknown VerbFlexion parameter '${key}' of '${lemma}'; line: ${line}`);
            }
        }
    }
    return flexion;
}

function normalizedValueOfFlexion(lemma:string, line:string, value:string):string {
    try {
        value = value.trim();
    } catch (e) {
        value = "";
        let errMsg = `msg: ${e.message} lemma: '${lemma}' line: ${line}`;
        statisticEventEmitter.emit(GENERAL_ERROR, new Error(errMsg));
    }
    return value;
}

function ignoreableVerbFlexionParameter(parameter:string):boolean {
    // borrow function from Substantiv
    return isIgnorableKasus(parameter) || parameter === "Flexion";
}


export function consumeAdjektivFlexion(lemma:string, lineIdx: number, wikiLines:string[]): [number, AdjektivFlexion]  {
    let [lineCount, cache] = collectFlexionToCache(lineIdx, wikiLines);
    let flexikon = parseAdjektivFlexion(lemma,cache.title, cache.lines);
    return [lineCount, flexikon];
}

function parseAdjektivFlexion(lemma:string, title:string, lines:string[]):AdjektivFlexion {
    let flexion = new AdjektivFlexion();
    for(let line of lines) {
        let [key, value] = line.split("=");
        if (!ignoreableAdjektivFlexionParameter(key)){
            value = normalizedValueOfFlexion(lemma, line, value);
            if (key.startsWith(AdjektivFlexion.POSITIV)) {
                flexion.positiv.push(value);
            } else if (key.startsWith(AdjektivFlexion.KOMPARATIV)) {
                flexion.komparativ.push(value);
            } else if (key.startsWith(AdjektivFlexion.SUPERLATIV)) {
                flexion.superlativ.push(value);
            } else {
                statisticEventEmitter.emit(BAD_FLEXION, `Unknown AdjektivFlexion parameter '${key}' of ${lemma}`);
            }
        }
    }
    return flexion;
}

function ignoreableAdjektivFlexionParameter(parameter:string):boolean {
    // borrow function from Substantiv
    return isIgnorableKasus(parameter) ||
        (parameter.search(/thumb\|\d+\|/) >= 0) ;
}