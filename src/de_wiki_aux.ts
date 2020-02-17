import * as events from 'events';

export const statisticEventEmitter = new events.EventEmitter();
export const PARSE_WIKI_TEXT = Symbol("countWikiText"),
    WIKI_OK = Symbol("wikiTextOK"),
    /**
     * if a block title lexical looks like a flexion, but cannot be reconized as a flexion.
     * This is differ from Error `Unknown lexion`: this error indicates that there is a
     * consumer of the flexion. But the consumer cannot consume the flexion and therefore throws
     * the exeption.
     * */
    BAD_FLEXION = Symbol("badFlexion"),

    NO_CONSUME_FOR_BLOCK = Symbol("noConsumerForBlock"),
    GENERAL_ERROR = Symbol("parseWikiError"),
    INGORE_WORD = Symbol("ignoreWord")
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


export class BadWikiSyntax extends Error {
    constructor(message: string) {
        super(message);
    }
}

