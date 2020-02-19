//import XMLStream from "xml-stream";
import {parseDeWikiTextToObject} from "./de_wiktionary_text";

const XMLStream = require("xml-stream");
import * as fs from "fs";

import {
    BAD_FLEXION,
    GENERAL_ERROR,
    INGORE_WORD,
    isGermanWord,
    NO_CONSUME_FOR_BLOCK,
    PARSE_WIKI_TEXT,
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
    [BAD_FLEXION]: { // syntax: „flexionName“: {count: number, lemma:string[] }

    },

    /** count how many blocks, which are not consumed */
    [NO_CONSUME_FOR_BLOCK]: { // syntax: „blockName“: {count: number, lemma:string[] }

    },
    [GENERAL_ERROR]: {

    },
    [INGORE_WORD]: 0
};

statisticEventEmitter.addListener(PARSE_WIKI_TEXT,() => {
   statisticCollect[PARSE_WIKI_TEXT] +=1;
});

statisticEventEmitter.addListener(WIKI_OK, () =>{
   statisticCollect[WIKI_OK] += 1;
});

statisticEventEmitter.addListener(BAD_FLEXION, (flexionName:string, lemma:string)=>{
   // @ts-ignore
    let flexion = statisticCollect[BAD_FLEXION][flexionName] || {count:0, lemma: []};
    flexion.count +=1;
    flexion.lemma.push(lemma);
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

statisticEventEmitter.addListener(GENERAL_ERROR, (error:Error) => {
    // @ts-ignore
    let errorCount = statisticCollect[GENERAL_ERROR][error.message] || 0;
    errorCount += 1;
    // @ts-ignore
    statisticCollect[GENERAL_ERROR][error.message] = errorCount;
});

statisticEventEmitter.addListener(INGORE_WORD, (word:string)=> {
    statisticCollect[INGORE_WORD] += 1;
    if (statisticCollect[INGORE_WORD] % 1000 === 0) {
        console.error(`    ignore word ${statisticCollect[INGORE_WORD]} last ignored word is ${word}`);
    }
});

export function getStatistic(maximum:number = 5) {
    let result = {
        [PARSE_WIKI_TEXT]: statisticCollect[PARSE_WIKI_TEXT],
        [WIKI_OK] : statisticCollect[WIKI_OK] ,
        [INGORE_WORD]: statisticCollect[INGORE_WORD],
        [GENERAL_ERROR]: {},
        [NO_CONSUME_FOR_BLOCK]:{},
        [BAD_FLEXION]: {},
    };
    function summaryLemma(statistic:any) { // structure: {count:number, lemma:[]}
        let lemma = statistic.lemma.slice(0, maximum).join(", ");
        if (maximum < statistic.count) {
            lemma += ", ...";
        }
        return {
            count: statistic.count,
            lemma: lemma
        };
    }
    let badFlexionKeys = Object.keys( statisticCollect[BAD_FLEXION] ).slice(0, maximum);
    badFlexionKeys.forEach( (key)=>{
        // @ts-ignore
        result[BAD_FLEXION][key] = summaryLemma( statisticCollect[BAD_FLEXION][key] );
    });
    let noConsumerForBlockKeys = Object.keys( statisticCollect[NO_CONSUME_FOR_BLOCK] ).slice(0, maximum);
    noConsumerForBlockKeys.forEach( (key)=>{
        // @ts-ignore
        result[NO_CONSUME_FOR_BLOCK][key] = summaryLemma( statisticCollect[NO_CONSUME_FOR_BLOCK][key] );
    });
    let generalErrorKeys = Object.keys( statisticCollect[GENERAL_ERROR] ).slice(0, maximum);
    generalErrorKeys.forEach(key =>{
       // @ts-ignore
       result[GENERAL_ERROR][key] = statisticCollect[GENERAL_ERROR][key];
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
            statisticEventEmitter.emit(INGORE_WORD, entry["title"]);
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
        let json = JSON.stringify( parseDeWikiTextToObject(wikitext) );
        statisticEventEmitter.emit(WIKI_OK);
        return json;
    } catch (e) {
        statisticEventEmitter.emit(GENERAL_ERROR, e);
        return JSON.stringify(wikitext);
    }
}



































