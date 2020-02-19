import {
    Body, PartOfSpeech, Title,
    UEBERSETZUNGS_TABELL,
    WikiBlockName,
    WikiPage
} from "./de_wiki_lang";
import {consumeWorttrennung} from "./de_wiktionary_worttrennung";
import {
    BadWikiSyntax,
    INGORE_WORD,
    NO_CONSUME_FOR_BLOCK,
    removeHTMLComment,
    statisticEventEmitter, stripCurly
} from "./de_wiki_aux";
import {consumeFlexion, isFlexion} from "./de_wiktionary_flexion";

export function parseDeWikiTextToObject(wikiText: string, selectLanguages:string[]=["Deutsch"]): WikiPage[] {
    //const GERMAN_WORD_INDICATOR = "({{Sprache|Deutsch}})";
    let indicators:string[] = [];
    for(let language of selectLanguages) {
        indicators.push( `({{Sprache|${language}}})` );
    }
    function isSelectedLanguage(title:string):boolean {
        for(let indicator of indicators) {
            if (title.includes(indicator)) {
                return true;
            }
        }
        return false;
    }
    let lines = removeHTMLComment(wikiText).split("\n");
    const WIKI_LENGTH = lines.length;
    let lineIdx = 0;
    let pages:WikiPage[] = [];
    while (lineIdx < WIKI_LENGTH) {
        let currentLine = lines[lineIdx];
        do {
            if (currentLine !== undefined  && currentLine.startsWith("== ")) {
                if ( isSelectedLanguage(currentLine) ) {
                    let [countPageLength, page] = consumePage(lineIdx, lines);
                    lineIdx += countPageLength - 1;
                    pages.push(page);
                    break;
                } else {
                    statisticEventEmitter.emit(INGORE_WORD, currentLine);
                }
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
            let [countBodyLength, body] = consumeBody(page,lineIdx, wikiLines);
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
export function consumeBody(page: WikiPage, beginIdx:number, wikiLines:string[]):[number, Body] {
    let lineIdx = beginIdx;
    let [countPoSLength, pos] = consumePartOfSpeech(page.title.lemma, lineIdx, wikiLines);
    lineIdx += countPoSLength - 1;
    let body = new Body(page.title.lemma, pos);
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
                    //console.error(`Verdammt format ${currentLine}`);
                } else {
                    lineIdx += 1;
                    currentLine = wikiLines[lineIdx];
                    nextLine = wikiLines[lineIdx + 1];
                    continue;
                }
            } else if (block.length > 0) {
                // TODO: block is complete => process block
                let bTitle = block[0];
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
        throw new BadWikiSyntax(`Programming error, a block cannot contain only empty strings`, body.lemma);
    }
    if (title === UEBERSETZUNGS_TABELL) {
        title = WikiBlockName.Uebersetzungen;
        block[0] = title;
        delete block[block.length - 1]; // remove the last "}}"
    }
    if ( isFlexion(body, title) ) {
        let [_, flexion] = consumeFlexion(body,0, block);
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
        consumeWorttrennung(body, block);
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
    statisticEventEmitter.emit(NO_CONSUME_FOR_BLOCK, block[0], body.lemma);
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
        line = line.trim();
        if (line.startsWith("== ") && line.endsWith(" ==")) {
            let titleParts =stripEqualMark(line).split(/\s+/);
            let text = titleParts[0];
            let size =  titleParts[1].length;
            let language = titleParts[1].slice(3, size - 3).split('|')[1];
            title = new Title(text, language);
        } else {
            throw new BadWikiSyntax(`Title line must be embraced by '== ' and ' ==', got '${line}'`, "(Cannot parse lemma)");
        }
    } else {
        throw new BadWikiSyntax(`A Wikipage must contain a title, which the line embraced by double equal sign.`, "(Cannot parse lemma)");
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
export function consumePartOfSpeech(lemma:string, beginIdx: number, wikiLines: string[]): [number, PartOfSpeech] {
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
        throw new BadWikiSyntax(`Cannot find a line with pattern '=== {{Wordart|...|...}} ===`, lemma);
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

