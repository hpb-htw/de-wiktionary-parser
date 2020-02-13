//import XMLStream from "xml-stream";
const XMLStream = require("xml-stream");
import * as fs from "fs";

import {isGermanWord} from "./de_wiki_aux";


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
                let stringifyText = JSON.stringify(entry.text);
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
            console.error( `ignore word ${entry["title"]}`);
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