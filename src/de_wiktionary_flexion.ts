import {
    Flexion,
    FlexionFixTemplate,
    FlexionTemplate,
    Kasus,
    PersonalpronomenFlexion,
    SubstantivFlexion, VornameFlexion
} from "./de_wiki_lang";
import {BAD_FLEXION, BadWikiSyntax, statisticEventEmitter} from "./de_wiki_aux";

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
 * @return [number, ...] number: number of consumed line, that it how many lines are consumed
 *              from the line with index `beginIdx` (include) to the line with content `}}` (include)
 *
 * */
export function consumeFlexion(beginIdx:number, wikiLines: string[]) : [number, Flexion|undefined] {
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
        let [countFlexionLine, flexion] = consumeVornameFlexion(lineIdx, wikiLines);
        return  [countConsumedLines + countFlexionLine, flexion];
    } else if(PersonalpronomenFlexion.testFlexion(line)) {
        let [countFlexionLine, flexion] = consumePersonalPronomen(lineIdx, wikiLines);
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
    const WIKI_LENGTH = wikiLines.length;
    let consumedLineIdx = lineIdx;
    let flexionCache: { title: string, lines: string[] } = {
        title: "",
        lines: []
    };
    let inFlexion = false;
    let flexikon: SubstantivFlexion | undefined = undefined;
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
            flexikon = parseSubtantivFlexion(flexionCache.title, flexionCache.lines);
            break;
        }
    }
    return [consumedLineIdx - lineIdx, flexikon];
}


function parseSubtantivFlexion(title: string, lines: string[]): SubstantivFlexion {
    let flexion = new SubstantivFlexion();
    for (let line of lines) {
        let [key, value] = line.split("=");
        let [kasus, numerus] = key.trim().split(/\s+/);
        let flexionKasus: Kasus;
        if (kasus.startsWith(SubstantivFlexion.GENUS)) {
            flexion.genus.push(value);
            continue;
        } else if (kasus.startsWith(SubstantivFlexion.NOMINATIV)) {
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
            let lastLines = lines.slice(-5).join('\n');
            throw new BadWikiSyntax(`Unknown Kasus '${kasus}' title: ${title} lines: ${lastLines}`);
        }
        if (numerus.startsWith(SubstantivFlexion.SINGULAR)) {
            flexionKasus.singular.push(value);
        } else if (numerus.startsWith(SubstantivFlexion.PLURAL)) {
            flexionKasus.plural.push(value);
        }
    }
    return flexion;
}

function isIgnorableKasus(kasus:string) {
    return (kasus.startsWith("Bild")) || (kasus.startsWith("mini|1|"));
}

/** test data: see Rosa and Achim */
function consumeVornameFlexion(lineIdx: number, lines:string[]): [number, VornameFlexion] {
    throw new BadWikiSyntax(`Not support Vorname Flexion for now, title: ${lines[1]}`);
}

/*TODO*/
export function consumePersonalPronomen(beginIdx: number, wikiLines:string[]):[number, PersonalpronomenFlexion] {
    let pFlexion = new PersonalpronomenFlexion(wikiLines[0]);
    return [1, pFlexion];
}