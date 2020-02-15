import {
    WikiPage, Body,
    SubstantivFlexion, Kasus, Title, PartOfSpeech, WikiBlockName, Flexion, VornameFlexion, UEBERSETZUNGS_TABELL
} from "./de_wiki_lang";

// Escapes text for XML.
export function escape(value: string) {
    return value.replace(/"|&|'|<|>/g, function (entity) {
        return entities[entity];
    });
}

// XML entities.
export const entities: { [index: string]: string } = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&apos;',
    '<': '&lt;',
    '>': '&gt;'
};

export function isGermanWord(title: string, text: string) {
    const GERMAN_WORD_INDICATOR = "== ${title} ({{Sprache|Deutsch}}) ==";
    //let {title, text} = entry;    
    return text.includes(GERMAN_WORD_INDICATOR.replace("${title}", title));
}


export function parseDeWikiTextToObject(wikiText: string): WikiPage[] {
    let lines = wikiText.split("\n");
    const WIKI_LENGTH = lines.length;
    let lineIdx = 0;
    let pages:WikiPage[] = [];
    while (lineIdx < WIKI_LENGTH) {
        let currentLine = lines[lineIdx];
        do {
            if (currentLine !== undefined  && currentLine.startsWith("== ")) {
                let [countPageLength, page] = consumePage(lineIdx, lines);
                lineIdx += countPageLength - 1;
                pages.push(page);
                break;
            }
            lineIdx+=1;
            currentLine = lines[lineIdx];
        }while (currentLine !== undefined /*&& !currentLine.startsWith("== ")*/ );
        lineIdx+=1;
    }
    return pages;
}

/* consume all lines from a line, which begins with `== Title {{Sprache|...}} ==` */
function consumePage(beginIdx:number, wikiLines:string[]):[number, WikiPage] {
    let [countTitleLine, title] = consumeTitle(beginIdx, wikiLines);
    let page = new WikiPage(title);
    let lineIdx = beginIdx + countTitleLine ;
    let currentLine = wikiLines[lineIdx];
    do {
        if(currentLine !== undefined && currentLine.startsWith("=== ")) {
            let [countBodyLength, body] = consumeBody(lineIdx, wikiLines);
            page.body.push(body);
            lineIdx += countBodyLength -1;
        }
        lineIdx+=1;
        currentLine = wikiLines[lineIdx];
    } while(currentLine !== undefined && !currentLine.startsWith("== "));
    let countPageLine = lineIdx - beginIdx; // Donot plus 1 here, because == was checked in while
    return [countPageLine, page];
}

/**
 * consume all lines from a line beginning with `=== {{Wordart|...|...}} ===`
 * to the line just before the next line, which begins with `=== {{Word|...|...}} ===`
 * */
function consumeBody(beginIdx:number, wikiLines:string[]):[number, Body] {
    let lineIdx = beginIdx;
    let [countPoSLength, pos] = consumePartOfSpeech(lineIdx, wikiLines);
    lineIdx += countPoSLength - 1;
    let body = new Body(pos);
    let skipEmptyLine = skipEmptyLines(lineIdx, wikiLines);
    lineIdx += skipEmptyLine - 1; // jump to next line after the last empty line

    let currentLine = wikiLines[lineIdx];
    let nextLine = wikiLines[lineIdx + 1];
    let block:string[] = [];
    let blockPosition = 0;
    do {
        if (currentLine !== undefined) {
            currentLine = currentLine.trim();
            if (currentLine !== "") {
                if (! (currentLine.startsWith("=== ") || currentLine.startsWith("==== ") )) {
                    block.push(currentLine);
                } else if (currentLine.startsWith("==== ")) { // because of "Übersetzung"
                    console.error(`Verdammt format ${currentLine}`);
                } else {
                    lineIdx += 1;
                    currentLine = wikiLines[lineIdx];
                    nextLine = wikiLines[lineIdx + 1];
                    continue;
                }
            } else if (block.length > 0) {
                // TODO: block is complete => process block
                let bTitle = block[0];
                console.error(bTitle);
                consumeBlock(body, block, blockPosition);
                blockPosition += 1;
                block = [];
            }
        }
        lineIdx += 1;
        currentLine = wikiLines[lineIdx];
        nextLine = wikiLines[lineIdx + 1];
    } while( !(nextLine === undefined || nextLine.startsWith("== ") || currentLine === undefined || currentLine.startsWith("=== ")) );
    if (currentLine !== undefined && currentLine.startsWith("=== ")) {
        lineIdx -= 1;
    }
    let countBodyLength =1 + lineIdx - beginIdx;
    return [countBodyLength, body];
}

function consumeBlock(body:Body, block:string[], blockPosition:number) {
    let title:string|undefined = block[0];
    while (title !== undefined && title === "") {
        title = block.shift();
    }
    if(title === undefined){
        throw new BadWikiSyntax(`Programming error, a block cannot contain only empty strings`);
    }
    if (title === UEBERSETZUNGS_TABELL) {
        title = WikiBlockName.Uebungsetzungen;
        block[0] = title;
        delete block[block.length - 1]; // remove the last "}}"
    }
    if (title.startsWith("{{") && !title.endsWith("}}")) {
        let [_, flexion] = consumeFlexion(0, block);
        body.flexion = flexion;
    } else if (title === WikiBlockName.Lesungen){
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Anmerkung ) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Alternative_Schreibweisen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Nicht_mehr_gueltige_Schreibweisen ) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Veraltete_Schreibweisen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Nebenformen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Worttrennung) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.in_arabischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.in_kyrillischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.in_lateinischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Strichreihenfolge) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Vokalisierung) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Umschrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Aussprache) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Grammatische_Merkmale) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Bedeutungen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Abkuerzungen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Symbole) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Herkunft) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Wortfamilie) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Synonyme) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Sinnverwandte_Woerter) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Sinnverwandte_Zeichen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Gegenwoerter) {
        consumeUnknownBlock(body, block);
    } else { // TODO: extend this part
        consumeUnknownBlock(body, block);
    }
}

function consumeUnknownBlock(body:Body, block:string[]) {
    console.error(`No consumer for block '${block[0]}' (${block.length} lines) for now`);
}

/**
 * @return  * number:  The number of the line which are consumed, count from beginIdx (include) to the
 *                  last index (exclude);
 *          *  Title:  The title of the page
 * */
export function consumeTitle(beginIdx: number, wikiLines: string[]): [number, Title] {
    let lineIdx = beginIdx;
    let line = wikiLines[lineIdx];
    while (!line.startsWith("== ") && lineIdx < wikiLines.length) {
        lineIdx += 1;
        line = wikiLines[lineIdx];
    }
    let title: Title | undefined = undefined;
    if (lineIdx >= beginIdx) {
        if (line.startsWith("== ") && line.endsWith(" ==")) {
            let titleParts =stripEqualMark(line).split(/\s+/);
            let text = titleParts[0];
            let size =  titleParts[1].length;
            let language = titleParts[1].slice(3, size - 3).split('|')[1];
            title = new Title(text, language);
        } else {
            throw new BadWikiSyntax(`Title line must be embraced by '== ' and ' =='`);
        }
    } else {
        throw new BadWikiSyntax(`A Wikipage must contain a title, which the line embraced by double equal sign.`);
    }
    return [1+ lineIdx - beginIdx, title];
}

/**
 * @param beginIdx   Begin-Index to seek the next line beginning with `=== ` Triple Quote
 * @param wikiLines  Content of the wiki text, each line is an element of the parameter.
 *
 * @return [number,PartOfSpeech] Number is the number of consumed line. That it how many lines are take in
 *                               from the line `=== {{Wordart|...|...}} ===` (include) to the next empty line
 *                               (exclude).
 *
 * */
export function consumePartOfSpeech(beginIdx: number, wikiLines: string[]): [number, PartOfSpeech] {
    const WIKI_LENGTH = wikiLines.length;
    let lineIdx = beginIdx;
    let headLine = wikiLines[lineIdx];
    while (!headLine.startsWith("=== ") && lineIdx < WIKI_LENGTH) {
        lineIdx += 1;
        headLine = wikiLines[lineIdx];
    }
    let countHeadLength = lineIdx - beginIdx ;
    if ( headLine.startsWith("=== ") ) {
        let pos = new PartOfSpeech();
        pos.pos = parseWortart(headLine);
        return [countHeadLength+1, pos];
    } else {
        throw new BadWikiSyntax(`Cannot find a line with pattern '=== {{Wordart|...|...}} ===`);
    }
}


function parseWortart(thirdLevelHead: string): string[] {
    return stripEqualMark(thirdLevelHead)
        .split(/,\s+/)
        .map(stripCurly)
        .map(wikiWordartToWordArt).filter(x => x !== "");
}

function stripEqualMark(headLine: string): string {
    let countMark = 0;
    let eqChars = "";
    while (countMark < headLine.length) {
        let char = headLine[countMark];
        countMark++;
        if (char === "=") {
            eqChars += "=";
        } else if (char === " ") {
            break;
        }
    }
    if (countMark === 0) {
        throw new Error("Headline is an empty string");
    }
    return headLine.slice(countMark, headLine.length - countMark);
}

function stripCurly(text: string): string {
    return text.slice(0, text.length - 2).slice(2);
}

function wikiWordartToWordArt(wikitext: string): string {
    let parts = wikitext.split("|");
    return parts.length > 1 ? parts[1] : "";
}

function skipEmptyLines(beginIdx: number, wikiLines: string[]): number {
    const WIKI_LENGTH = wikiLines.length;
    let skippedLineIdx = beginIdx;
    let currentLine = wikiLines[skippedLineIdx].trim();
    while (currentLine === "" && skippedLineIdx < WIKI_LENGTH) {
        skippedLineIdx += 1;
        currentLine = wikiLines[skippedLineIdx].trim();
    }
    return 1 + skippedLineIdx - beginIdx;
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
    if (SubstantivFlexion.testFlextion(line)) {
        let [countFlexionLine, flexion] = consumeSubstantivFlexion(lineIdx, wikiLines);
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
    if(flexionCache.title.includes(SubstantivFlexion.vorname)) {
        let parts = flexionCache.title.split(/\s+/);
        let genus = parts[parts.length-1];
        flexikon?.genus.push(genus);
    }
    return [consumedLineIdx - lineIdx, flexikon];
}


function parseSubtantivFlexion(title: string, lines: string[]): SubstantivFlexion {
    let f = new SubstantivFlexion();
    for (let line of lines) {
        let [key, value] = line.split("=");
        let [kasus, numerus] = key.trim().split(/\s+/);
        let flexionKasus: Kasus;
        if (kasus.startsWith(SubstantivFlexion.GENUS)) {
            f.genus.push(value);
            continue;
        } else if (kasus.startsWith(SubstantivFlexion.NOMINATIV)) {
            flexionKasus = f.nominativ;
        } else if (kasus.startsWith(SubstantivFlexion.GENITIVE)) {
            flexionKasus = f.genitiv;
        } else if (kasus.startsWith(SubstantivFlexion.DATIV)) {
            flexionKasus = f.dativ;
        } else if (kasus.startsWith(SubstantivFlexion.AKKUSATIV)) {
            flexionKasus = f.akkusativ;
        }else if (kasus.startsWith("Bild") ){
            continue;
        } else {
            throw new BadWikiSyntax(`Unknown Kasus '${kasus}'`);
        }
        if (numerus.startsWith(SubstantivFlexion.SINGULAR)) {
            flexionKasus.singular.push(value);
        } else if (numerus.startsWith(SubstantivFlexion.PLURAL)) {
            flexionKasus.plural.push(value);
        }
    }
    return f;
}


export class BadWikiSyntax extends Error {
    constructor(message: string) {
        super(message);
    }
}
