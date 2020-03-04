import * as events from 'events';
const wtf = require('wtf_wikipedia');

export const statisticEventEmitter = new events.EventEmitter();
export const PARSE_WIKI_TEXT = Symbol("PARSE_WIKI_TEXT"),
    WIKI_OK = Symbol("WIKI_OK"),
    /**
     * if a block title lexical looks like a flexion, but cannot be reconized as a flexion.
     * This is differ from Error `Unknown lexion`: this error indicates that there is a
     * consumer of the flexion. But the consumer cannot consume the flexion and therefore throws
     * the exeption.
     * */
    BAD_FLEXION = Symbol("BAD_FLEXION"),
    /**
     * this event is fired when the first line after {{Bedeutungen}} begins with more than one colons.
     *
     * */
    SENSE_INCONSISTENT = Symbol("SENSE_INCONSISTENT"),
    /**
     * this event is fired when a line in block {{Bedeutungen}} begins with a start (*), which
     * is not processed in this version
     * */
    SENSE_HAS_DOMAIN = Symbol("SENSE_HAS_DOMAIN"),
    /**
     * */
    SENSE_IS_MULTILINE = Symbol("SENSE_IS_MULTILINE"),

    /**
     * blocks, which can not be processed for now, go here!
     * */
    NO_CONSUME_FOR_BLOCK = Symbol("NO_CONSUME_FOR_BLOCK"),

    /**
     * non-categorized problems
     * */
    GENERAL_ERROR = Symbol("GENERAL_ERROR"),
    IGNORE_WORD = Symbol("IGNORE_WORD"),
    IGNORE_WORD_INSIDE = Symbol("IGNORE_WORD_INSIDE")
;

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

export function removeHTMLComment(htmlText:string) {
    return htmlText.replace(/<!--[\s\S]*?-->/g, "");
}

export class BadWikiSyntax extends Error {
    lemma:string;
    constructor(message: string, lemma:string) {
        super(message);
        this.lemma = lemma;
    }
}

export function stripCurly(text: string): string {
    return text.slice(0, text.length - 2).slice(2);
}

/**
 * parse something like:
 *
 *  + `{{parameter|value}}`
 *  + `{{parameter}}
 *
 * */
export function parseSimpleTemplate(template:string): {parameter:string, value:string|undefined} {
    let plaintext = stripCurly(template).split('|');
    if (plaintext.length < 3) {
        return {parameter: plaintext[0], value: plaintext[1]};
    }else {
        throw new Error(`Too much '|' for a simple template: '${template}'`);
    }
}

/**
 * TODO: strip only link
 * */
export function stripWikiFormat(text:string): string {
    return wtf(text).text();
}