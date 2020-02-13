import {
    WikiPage, Kopf, MittelTeil,
    SubstantivFlexion, Kasus
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

export function isGermanWord( title:string, text:string ) {
    const GERMAN_WORD_INDICATOR = "== ${title} ({{Sprache|Deutsch}}) ==";
    //let {title, text} = entry;    
    return text.includes(GERMAN_WORD_INDICATOR.replace("${title}", title));
}


export function parseDeWikiTextToObject( wikipage: string ): WikiPage {

    let lines = wikipage.split("\n");
    const wikiLineCount = lines.length;
    let lineIdx = 0;
    let headLine:string = lines[lineIdx];
    let thirdLevelHeadline:string = lines[lineIdx+1];
    while (!headLine.startsWith("== ") && lineIdx < wikiLineCount - 2) {
        lineIdx += 1;
        headLine = lines[lineIdx];
        thirdLevelHeadline = lines[lineIdx+1];
    }
    let kopf = parseHeadLines(headLine, thirdLevelHeadline);
    // parse Head OK
    let flexionCache:{ title:string, lines:string[] } = {
        title: "",
        lines: []
    };
    // parse Mittel Teil
    let mittelTeil: MittelTeil = new MittelTeil();
    //-- Flexion
    let inFlexion = false;
    let flexikon: SubstantivFlexion;
    while(lineIdx < wikiLineCount - 1) {
        let line = lines[lineIdx].trim();
        lineIdx += 1;
        if(line.trim() === "") { // new section
            continue;
        }
        if (line.startsWith("{{") && !line.endsWith("}}")) { // line starts a new flexion
            flexionCache.title = line.replace("{{", "");
            inFlexion = true;
            continue;
        }
        if (inFlexion && line.startsWith("|")) {
            flexionCache.lines.push(line.slice(1)); // drop |
            continue;
        }
        if (inFlexion && line.trim() === "}}") {
            inFlexion = false;
            flexikon = parseFlexion(flexionCache.title, flexionCache.lines);
            mittelTeil.flexion = flexikon;
            continue;
        }
    }
    //OK for SubstantivFlexion
    let page: WikiPage = new WikiPage(kopf);
    page.mittelTeil = mittelTeil;
    return page;
}

function parseHeadLines(headLine:string, thirdLevelHeadLine:string):Kopf {
    if (headLine.startsWith("== ") && headLine.endsWith(" ==")) {
        if(thirdLevelHeadLine.startsWith("=== ") && thirdLevelHeadLine.endsWith(" ===")) {
            let lemma = headLine.split(" ")[1];
            let pos = parseWortart(thirdLevelHeadLine);
            return new Kopf(lemma, "Deutsch", pos);
        } else {
            throw new BadWikiSyntax("First line of wiktionary page must be embraced by '==='.");
        }
    } else {
        throw new BadWikiSyntax("First line of wiktionary page must be embraced by '=='.");
    }
}

export function parseWortart(thirdLevelHead:string):string[] {
    return stripEqualMark(thirdLevelHead)
        .split(/,\s+/)
        .map(stripCurly)
        .map(wikiWordartToWordArt).filter(x => x !=="");
}

function stripEqualMark(headLine:string):string {
    let countMark = 0;
    let eqChars = "";
    while(countMark < headLine.length)
    {
        let char = headLine[countMark];
        countMark++;
        if (char === "="){
            eqChars += "=";
        } else if(char === " "){
            break;
        }
    }
    if (countMark === 0){
        throw new Error("Headline is an empty string");
    }
    return headLine.slice(0, headLine.length-countMark).slice(countMark);
}

function stripCurly(text:string):string {
    return text.slice(0,text.length-2).slice(2);
}

function wikiWordartToWordArt(wikitext:string):string {
    let parts = wikitext.split("|");
    return parts.length > 1 ? parts[1] : "";
}

function parseFlexion(title:string, lines:string[]) : SubstantivFlexion {
    if (title === SubstantivFlexion.title) {
        let f = new SubstantivFlexion();
        for (let line of lines) {
            let [key, value] = line.split("=");
            let [kasus, numerus] = key.trim().split(/\s+/);
            let flexionKasus: Kasus;
            if (kasus.startsWith(SubstantivFlexion.GENUS)) {
                f.genus = value;
                continue;
            }else if (kasus.startsWith( SubstantivFlexion.NOMINATIV )) {
                flexionKasus = f.nominativ;
            } else if(kasus.startsWith(SubstantivFlexion.GENITIVE )) {
                flexionKasus = f.genitiv;
            } else if(kasus.startsWith(SubstantivFlexion.DATIV)) {
                flexionKasus = f.dativ;
            } else if (kasus.startsWith(SubstantivFlexion.AKKUSATIV)) {
                flexionKasus = f.akkusativ;
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
    } else {
        throw new BadWikiSyntax(`Unknown flexion '${title}'`);
    }
}



export class BadWikiSyntax extends Error {
    constructor(message: string) {
        super(message);
    }
}
