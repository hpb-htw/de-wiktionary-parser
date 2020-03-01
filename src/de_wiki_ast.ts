/* Abbildung von Wiki Text in AST */


import {parseSimpleTemplate, stripCurly} from "./de_wiki_aux";

/**
 * represents all text of wiki. A Wiki text hat one or more pages.
 * */
export class WikiText {
    /**
     * an array of extra lines before the first page, they are the most top lines,
     * which do not begin with Double Quote Sign (`== `).
     * */
    extraLines: string[] = [];
    /**
     * the come the pages in a WikiText
     * */
    pages: Page[] = [];
}

/**
 * A Page is a part of Wiki Text, which begin with
 * Double Equal Sign (for example: `== sein ({{Sprache|Deutsch}}) ==`) and ends with a
 * line before the next line with Double Equal Sign, or the last line of text.
 *
 * A page has one or more bodies.
 */
export class Page {
    /**
     * for example `sein`.
     * */
    lemma: string;
    /**
     * for example `Deutsch`
     * */
    language: string;

    /**/
    bodies: Body[] = [];

    constructor(title: string) {
        let striped = stripEqualMark(title);
        let openParentheseIdx = striped.indexOf("(");
        let closeParentheseIdx = striped.indexOf(")");
        this.lemma = striped.slice(0, openParentheseIdx).trim();
        let spracheBlock = parseSimpleTemplate(striped.slice(openParentheseIdx+1, closeParentheseIdx));
        this.language = spracheBlock.value || "";
    }
}

/**
 * A body is a parts of text, which begin with a line beginning with Triple Sign Sign
 * (for example `=== {{Wortart|Verb|Deutsch}}, {{Wortart|Hilfsverb|Deutsch}} ===`)
 * and ends with the line before the next line beginning with a Triple Sign.
 *
 * A Body has always the same lemma as its parent page. This let debugging easier.
 * A Body always has a default section, which has a Name `AstBody.defaultSectionName`.
 * This section contains all blocks before and after the section
 * `==== {{Übersetzungen}} ====`
 * */
export type PoS = string;

export class Body {
    static readonly defaultSectionName = "___default___";
    static readonly uebersetzungSectionName = "==== {{Übersetzungen}} ====";
    sections: Section[] = [];
    lemma: string;
    partOfSpeech: PoS[] = [];

    /**
     * @param lemma the parent lemma
     * @param title the string surrounded by Triple Equal Sign (include Triple Equal Sign).
     * */
    constructor(lemma: string, title: string) {
        this.lemma = lemma;
        this.partOfSpeech = parseWortart(title);
        this.sections.push(new Section(Body.defaultSectionName, this));
    }
}

export class Section {

    name:string;
    lemma:string;
    blocks: Block[] = [];
    constructor(name:string, parent:Body) {
        this.name = name;
        this.lemma = parent.lemma;
    }
}

export class Block {
    name: string;
    private text: string[] = [];
    constructor(name:string) {
        this.name = name;
    }
    appendText(line:string) {
        this.text.push(line);
    }

    getText():string[] {
        return Array.from(this.text);
    }
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

function parseWortart(thirdLevelHead: string): string[] {
    return stripEqualMark(thirdLevelHead)
        .split(/,\s+/)
        .map(stripCurly)
        .map(wikiWordartToWordArt).filter(x => x !== "");
}

function wikiWordartToWordArt(wikitext: string): string {
    let parts = wikitext.split("|");
    return parts.length > 1 ? parts[1] : "";
}