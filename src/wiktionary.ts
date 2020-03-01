//import XMLStream from "xml-stream";
import {parseDeWikiTextToObject} from "./de_wiktionary_text";

const XMLStream = require("xml-stream");
import * as fs from "fs";

import {
    BAD_FLEXION,
    GENERAL_ERROR,
    IGNORE_WORD, IGNORE_WORD_INSIDE,
    isGermanWord,
    NO_CONSUME_FOR_BLOCK,
    PARSE_WIKI_TEXT, SENSE_HAS_DOMAIN, SENSE_INCONSISTENT, SENSE_IS_MULTILINE,
    WIKI_OK
} from "./de_wiki_aux";
import {statisticEventEmitter} from "./de_wiki_aux";

const BUFFER_SIZE = 100;

export type Entry = {
    /**
     * unique id of the entry in a dictionary
     */
    id: number,
    /**
     * title of the wiki page
     */
    title: string,
    /**
     * text description about the entry
     */
    text: string,
};

/**
 * parse a XML dump file from http://dumps.wikimedia.org/backup-index.html
 * Result of this function is a Promise. See Unit test for Usage.
 * 
 */
export function parseWikiXml(dumpFile: string, collectNewEntry: (entry: Entry) => any):Promise<number> {    
    let xmlFile = fs.createReadStream(dumpFile);
    let count = 0;
    let promisses = new Promise<number>((resolve, reject) => {
        let xml = new XMLStream(xmlFile);
        xml.preserve('text', true);
        xml.on("endElement: page", (page: any) => {           
            let ns = page["ns"];
            if (ns === '0') {
                ++count;
                let id = Number.parseInt(page["id"]);
                let title = page["title"];
                let originText = page["revision"]["text"]["$children"];
                try {
                    let text = joinText(originText);                    
                    collectNewEntry({
                        id: id,
                        title: title,
                        text: text
                    });
                } catch (ex) {                    
                    reject(ex);
                }
            }
        });
        xml.on("end", () => {
            resolve(count);
        });
    });
    return promisses;
}

function joinText(text: string[]): string {    
    return text.join("");
}

const statisticCollect = {
    /** count how many wiki texts are parsed */
    [PARSE_WIKI_TEXT]: 0,
    /** count how many wikiText are parsed without any exception thrown */
    [WIKI_OK] : 0,

    /**  count how many bad Flextion
     *
     * */
    [BAD_FLEXION]: { // syntax: „flexionName“: {count: number, lemma:[{lemma:string, context:string}} }

    },
    [SENSE_INCONSISTENT]: [], // contains only lemmas
    [SENSE_HAS_DOMAIN]: [//syntax: {lemma:string, domain:string}

    ],
    [SENSE_IS_MULTILINE]: [//syntax: {lemma, line}

    ],
    /** count how many blocks, which are not consumed */
    [NO_CONSUME_FOR_BLOCK]: { // syntax: „blockName“: {count: number, lemma:string[] }

    },
    [GENERAL_ERROR]: {

    },
    [IGNORE_WORD]: 0,
    [IGNORE_WORD_INSIDE]: {
        count:0, lemma:[]
    }
};

statisticEventEmitter.addListener(PARSE_WIKI_TEXT,() => {
   statisticCollect[PARSE_WIKI_TEXT] +=1;
});

statisticEventEmitter.addListener(WIKI_OK, () =>{
   statisticCollect[WIKI_OK] += 1;
});

statisticEventEmitter.addListener(BAD_FLEXION, (flexionName:string, context:string, lemma:string)=>{
   // @ts-ignore
    let flexion = statisticCollect[BAD_FLEXION][flexionName] || {count:0, lemma: []};
    flexion.count +=1;
    flexion.lemma.push({lemma:lemma, context: context});
    // @ts-ignore
    statisticCollect[BAD_FLEXION][flexionName] = flexion;
});

statisticEventEmitter.addListener(NO_CONSUME_FOR_BLOCK, (blockName:string, lemma:string)=> {
    // @ts-ignore
   let blockCount = statisticCollect[NO_CONSUME_FOR_BLOCK][blockName] || {count:0, lemma:[]};
   blockCount.count += 1;
   blockCount.lemma.push(lemma);
    // @ts-ignore
   statisticCollect[NO_CONSUME_FOR_BLOCK][blockName] = blockCount;
});

statisticEventEmitter.addListener(SENSE_INCONSISTENT, (lemma:string) => {
    // @ts-ignore
   statisticCollect[SENSE_INCONSISTENT].push(lemma);
});

statisticEventEmitter.addListener(SENSE_HAS_DOMAIN, (lemma, domain) => {
    // @ts-ignore
    statisticCollect[SENSE_HAS_DOMAIN].push({lemma, domain});
});

statisticEventEmitter.addListener(SENSE_IS_MULTILINE, (lemma, line) => {
    // @ts-ignore
    statisticCollect[SENSE_IS_MULTILINE].push({lemma, line});
});

statisticEventEmitter.addListener(GENERAL_ERROR, (error:Error, extra:string) => {
    // @ts-ignore
    let errorCount = statisticCollect[GENERAL_ERROR][error.message] || {count:0, trace:[], extra:[]};
    errorCount.count += 1;
    errorCount.trace.push(error.stack);
    errorCount.extra.push(extra);
    // @ts-ignore
    statisticCollect[GENERAL_ERROR][error.message] = errorCount;
});

statisticEventEmitter.addListener(IGNORE_WORD, (word:string)=> {
    statisticCollect[IGNORE_WORD] += 1;
    if (statisticCollect[IGNORE_WORD] % 1000 === 0) {
        console.error(`    ignore word ${statisticCollect[IGNORE_WORD]} last ignored word is ${word}`);
    }
});

statisticEventEmitter.addListener(IGNORE_WORD_INSIDE, (word:string)=>{
    statisticCollect[IGNORE_WORD_INSIDE].count += 1;
    // @ts-ignore
    statisticCollect[IGNORE_WORD_INSIDE].lemma.push(word);
});

export function getStatistic(maximum:number = 5) {
    let result = {
        [PARSE_WIKI_TEXT.toString()]: statisticCollect[PARSE_WIKI_TEXT],
        [WIKI_OK.toString()] : statisticCollect[WIKI_OK] ,
        [IGNORE_WORD.toString()]: statisticCollect[IGNORE_WORD],
        [IGNORE_WORD_INSIDE.toString()]: {
            count: statisticCollect[IGNORE_WORD_INSIDE].count,
            lemma: statisticCollect[IGNORE_WORD_INSIDE].lemma.slice(0, maximum)
        },
        [GENERAL_ERROR.toString()]: {},
        [NO_CONSUME_FOR_BLOCK.toString()]:{},
        // Flexion
        [BAD_FLEXION.toString()]: {},
        // Bedeutung
        [SENSE_INCONSISTENT.toString()]: statisticCollect[SENSE_INCONSISTENT].slice(0, maximum),
        [SENSE_IS_MULTILINE.toString()]: statisticCollect[SENSE_IS_MULTILINE].slice(0, maximum),
        [SENSE_HAS_DOMAIN.toString()]: statisticCollect[SENSE_HAS_DOMAIN].slice(0, maximum)
    };
    let groupBy = function(collection:any[], key:string|number, transform:(item:any)=>any) {
        return collection.reduce(function(container, item) {
            container[item[key]] = container[item[key]] || [];
            if( container[item[key]].length < maximum ) {
                container[item[key]].push( transform(item) );
            } else if (container[item[key]].length === maximum ) {
                container[item[key]].push( '...' );
            }
            return container;
        }, {});
    };
    function summaryBadFlexion(statistic:any) { // structure: {count:number, lemma:[{lemma, context}]}
        let lemma = groupBy( statistic.lemma, 'context',(item)=>item.lemma);
        let newLemma = {};
        for( let [context,lemmas] of Object.entries(lemma) ) {
            // @ts-ignore
            let text = (lemmas.slice(0, maximum)).join(", ");
            // @ts-ignore
            if (lemmas.length > maximum) {
                text += ", ...";
            }
            // @ts-ignore
            newLemma[context] = {
                // @ts-ignore
                count: lemmas.length,
                lemma: text
            };
        }
        return {
            count: statistic.count,
            template: newLemma
        };
    }
    let badFlexionKeys = Object.keys( statisticCollect[BAD_FLEXION] ).slice(0, maximum);
    badFlexionKeys.forEach( (key)=>{
        // @ts-ignore
        result[BAD_FLEXION.toString()][key] = summaryBadFlexion( statisticCollect[BAD_FLEXION][key] );
    });
    function summaryNoConsume(statistic:any) { // structure: {count:number, lemma:[]}
        let lemma = statistic.lemma.slice(0, maximum).join(", ");
        if (maximum < statistic.count) {
            lemma += ", ...";
        }
        return {
            count: statistic.count,
            lemma: lemma
        };
    }
    let noConsumerForBlockKeys = Object.keys( statisticCollect[NO_CONSUME_FOR_BLOCK] ).slice(0, maximum);
    noConsumerForBlockKeys.forEach( (key)=>{
        // @ts-ignore
        result[NO_CONSUME_FOR_BLOCK.toString()][key] = summaryNoConsume( statisticCollect[NO_CONSUME_FOR_BLOCK][key] );
    });
    let generalErrorKeys = Object.keys( statisticCollect[GENERAL_ERROR] ).slice(0, maximum);
    generalErrorKeys.forEach(key =>{
       // @ts-ignore
       result[GENERAL_ERROR.toString()][key] = statisticCollect[GENERAL_ERROR][key];
    });

    return result;
}

export function importDic(
        xmlPath: string, 
        filterEntryFn: (index:number, entry:Entry)=>boolean,
        insertEntriesFn:  (en: Entry[]) => number 
) : Promise<number> {
    let buffer: Entry[] = [];
    let countGermanWords = 0;
    let savedEntries = 0;
    let effectiveFilterFn = filterEntryFn?filterEntryFn : (index:number, entry:Entry) => true;
    function collectNewEntry (entry: Entry) {
        if ( isGermanWord( entry["title"], entry["text"] )) {
            ++countGermanWords;
            if( effectiveFilterFn(countGermanWords, entry) ){
                let stringifyText = prepareWikiJson(entry.text);
                entry.text = stringifyText;
                buffer.push(entry);                
                if (buffer.length === BUFFER_SIZE) {                
                    let cache: Entry[] = buffer;                
                    buffer = [];
                    let r = insertEntriesFn(cache);                      
                    savedEntries += r;
                }
            }
        } else {
            statisticEventEmitter.emit(IGNORE_WORD, entry["title"]);
            // console.error( `ignore word ${entry["title"]}`);
        }
    }
    return parseWikiXml(xmlPath, collectNewEntry)
        .then((countResultFromParseWikiDump) => {
            console.error({ countGermanWords, countResultFromParseWikiDump });
            if (buffer.length > 0) {
                return insertEntriesFn(buffer);
            } else {
                return 0;
            }
        }).then((lastChunk) => {
            console.error({ countGermanWords, savedEntries, lastChunk });
            return savedEntries + lastChunk;
        });
}

function prepareWikiJson(wikitext:string):string {
    try{
        statisticEventEmitter.emit(PARSE_WIKI_TEXT);
        let json = JSON.stringify( parseDeWikiTextToObject(wikitext, ["Deutsch"]) );
        statisticEventEmitter.emit(WIKI_OK);
        return json;
    } catch (e) {
        let extraText = wikitext.split("\n").slice(0, 3).join("<newline>");
        console.error(extraText);
        statisticEventEmitter.emit(GENERAL_ERROR, e, extraText);
        return JSON.stringify(wikitext);
    }
}



































